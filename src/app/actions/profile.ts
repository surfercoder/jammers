"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { profileSchema, musicianSchema } from "@/lib/validations";

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

export async function updateProfile(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { supabase, userId } = await requireUserId();

  const profileParsed = profileSchema.safeParse({
    full_name: formData.get("full_name"),
    headline: formData.get("headline"),
    city: formData.get("city"),
    bio: formData.get("bio"),
    avatar_url: formData.get("avatar_url"),
  });
  if (!profileParsed.success) {
    return { fieldErrors: profileParsed.error.flatten().fieldErrors };
  }
  const p = profileParsed.data;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: p.full_name,
      headline: p.headline || null,
      city: p.city || null,
      bio: p.bio || null,
      avatar_url: p.avatar_url || null,
    })
    .eq("id", userId);
  if (profileError) return { error: profileError.message };

  // Musician extension (only present for musician/manager accounts).
  if (formData.get("has_musician") === "1") {
    const musicianParsed = musicianSchema.safeParse({
      genres: formData.getAll("genres"),
      instruments: formData.getAll("instruments"),
      experience_level: formData.get("experience_level"),
      available_for: formData.getAll("available_for"),
      hourly_rate: formData.get("hourly_rate") || undefined,
      years_experience: formData.get("years_experience") || undefined,
      open_to_work: formData.get("open_to_work") === "on",
    });
    if (!musicianParsed.success) {
      return { fieldErrors: musicianParsed.error.flatten().fieldErrors };
    }
    const mp = musicianParsed.data;
    const { error: mErr } = await supabase.from("musician_profiles").upsert(
      {
        profile_id: userId,
        genres: mp.genres,
        instruments: mp.instruments,
        experience_level: mp.experience_level,
        available_for: mp.available_for,
        hourly_rate: mp.hourly_rate ?? null,
        years_experience: mp.years_experience ?? null,
        open_to_work: mp.open_to_work,
      },
      { onConflict: "profile_id" }
    );
    if (mErr) return { error: mErr.message };
  }

  revalidatePath("/profile");
  revalidatePath("/musicians", "layout");
  return { ok: true };
}

export async function addMedia(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const url = (formData.get("url") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  if (!url) return { error: "Add a video URL." };
  const { supabase, userId } = await requireUserId();

  const { error } = await supabase.from("media").insert({
    profile_id: userId,
    type: "video",
    url,
    title: title || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/profile");
  return { ok: true };
}

export async function deleteMedia(mediaId: string) {
  const { supabase, userId } = await requireUserId();
  await supabase.from("media").delete().eq("id", mediaId).eq("profile_id", userId);
  revalidatePath("/profile");
  return { ok: true };
}
