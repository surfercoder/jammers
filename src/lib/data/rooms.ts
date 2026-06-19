import "server-only";
import { createClient } from "@/utils/supabase/server";
import type { RoomWithMeta } from "@/lib/types";
import { averageRating } from "@/lib/format";

export type RoomFilters = {
  q?: string;
  neighborhoods?: string[];
  amenities?: string[];
  priceMax?: number;
  capacityMin?: number;
};

const ROOM_SELECT = `
  *,
  owner:profiles!rehearsal_rooms_owner_id_fkey (id, username, full_name, avatar_url),
  room_reviews (rating)
`;

type RawRoom = Record<string, unknown> & {
  room_reviews: { rating: number }[];
  owner: RoomWithMeta["owner"];
};

function withRating(row: RawRoom): RoomWithMeta {
  const ratings = (row.room_reviews ?? []).map((r) => r.rating);
  const { room_reviews, ...rest } = row;
  void room_reviews;
  return {
    ...(rest as unknown as RoomWithMeta),
    rating: averageRating(ratings),
    review_count: ratings.length,
  };
}

export async function getRooms(filters: RoomFilters = {}): Promise<RoomWithMeta[]> {
  const supabase = await createClient();
  let query = supabase
    .from("rehearsal_rooms")
    .select(ROOM_SELECT)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (filters.q) {
    query = query.or(
      `name.ilike.%${filters.q}%,neighborhood.ilike.%${filters.q}%,description.ilike.%${filters.q}%`
    );
  }
  if (filters.neighborhoods?.length) {
    query = query.in("neighborhood", filters.neighborhoods);
  }
  if (filters.amenities?.length) {
    query = query.contains("amenities", filters.amenities);
  }
  if (filters.priceMax != null) {
    query = query.lte("hourly_price", filters.priceMax);
  }
  if (filters.capacityMin != null) {
    query = query.gte("capacity", filters.capacityMin);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as unknown as RawRoom[]).map(withRating);
}

export async function getRoomBySlug(slug: string): Promise<RoomWithMeta | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rehearsal_rooms")
    .select(ROOM_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  return data ? withRating(data as unknown as RawRoom) : null;
}

export async function getRoomReviews(roomId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("room_reviews")
    .select(
      "*, author:profiles!room_reviews_author_id_fkey (id, username, full_name, avatar_url)"
    )
    .eq("room_id", roomId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getMyRooms(ownerId: string): Promise<RoomWithMeta[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rehearsal_rooms")
    .select(ROOM_SELECT)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  return ((data as unknown as RawRoom[]) ?? []).map(withRating);
}

export async function getSavedRoomIds(profileId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("saved_rooms")
    .select("room_id")
    .eq("profile_id", profileId);
  return new Set((data ?? []).map((r) => r.room_id));
}
