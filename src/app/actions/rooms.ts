"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { roomSchema, bookingSchema, reviewSchema } from "@/lib/validations";
import { slugify } from "@/lib/format";

export type ActionResult = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  // `userId` is the server-verified session id from supabase.auth.getUser(),
  // never a client-supplied value, and ownership is also enforced by RLS.
  // react-doctor-disable-next-line react-doctor/supabase-client-owned-authz-field
  return { supabase, userId: user.id };
}

export async function createBooking(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = bookingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { room_id, date, start, hours, notes } = parsed.data;
  const { supabase, userId } = await requireUserId();

  const { data: room } = await supabase
    .from("rehearsal_rooms")
    .select("hourly_price, slug")
    .eq("id", room_id)
    .single();
  if (!room) return { error: "Room not found." };

  const startTime = new Date(`${date}T${start}:00`);
  if (Number.isNaN(startTime.getTime())) return { error: "Invalid date/time." };
  const endTime = new Date(startTime.getTime() + hours * 60 * 60 * 1000);

  const { error } = await supabase.from("room_bookings").insert({
    room_id,
    requester_id: userId,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    total_price: hours * Number(room.hourly_price),
    notes: notes || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/bookings");
  revalidatePath(`/rooms/${room.slug}`);
  return { ok: true };
}

export async function setBookingStatus(bookingId: string, status: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase
    .from("room_bookings")
    .update({ status: status as never })
    .eq("id", bookingId);
  if (error) return { error: error.message };
  revalidatePath("/bookings");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function toggleSaveRoom(
  roomId: string,
  saved: boolean
): Promise<ActionResult> {
  const { supabase, userId } = await requireUserId();
  const { error } = saved
    ? await supabase
        .from("saved_rooms")
        .delete()
        .eq("profile_id", userId)
        .eq("room_id", roomId)
    : await supabase
        .from("saved_rooms")
        .insert({ profile_id: userId, room_id: roomId });
  if (error) return { error: error.message };
  revalidatePath("/explore");
  return { ok: true };
}

export async function createReview(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { supabase, userId } = await requireUserId();
  const { error } = await supabase.from("room_reviews").upsert(
    {
      room_id: parsed.data.room_id,
      author_id: userId,
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
    },
    { onConflict: "room_id,author_id" }
  );
  if (error) return { error: error.message };
  revalidatePath("/rooms", "layout");
  return { ok: true };
}

export async function createRoom(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    ...Object.fromEntries(formData),
    amenities: formData.getAll("amenities"),
    photos: (formData.get("photos") as string)?.split(/[\n,]/).flatMap((s) => {
      const trimmed = s.trim();
      return trimmed ? [trimmed] : [];
    }),
  };
  const parsed = roomSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { supabase, userId } = await requireUserId();

  const suffix = Math.abs(
    Array.from(parsed.data.name).reduce((a, c) => a + c.charCodeAt(0), 0)
  )
    .toString(36)
    .slice(0, 4);
  const slug = `${slugify(parsed.data.name)}-${suffix}`;

  const { error } = await supabase.from("rehearsal_rooms").insert({
    owner_id: userId,
    slug,
    name: parsed.data.name,
    description: parsed.data.description || null,
    neighborhood: parsed.data.neighborhood,
    address: parsed.data.address || null,
    latitude: parsed.data.latitude,
    longitude: parsed.data.longitude,
    hourly_price: parsed.data.hourly_price,
    capacity: parsed.data.capacity,
    amenities: parsed.data.amenities,
    photos: parsed.data.photos ?? [],
  });
  if (error) return { error: error.message };

  revalidatePath("/explore");
  revalidatePath("/host");
  redirect(`/rooms/${slug}`);
}
