import "server-only";
import { createClient } from "@/utils/supabase/server";
import type { MusicianWithProfile } from "@/lib/types";

export type MusicianFilters = {
  q?: string;
  genres?: string[];
  instruments?: string[];
  availability?: string[];
  experience?: string;
  city?: string;
  openToWork?: boolean;
};

const MUSICIAN_SELECT = `
  *,
  musician_profiles!inner (*),
  media (*)
`;

export async function getMusicians(
  filters: MusicianFilters = {}
): Promise<MusicianWithProfile[]> {
  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select(MUSICIAN_SELECT)
    .order("updated_at", { ascending: false });

  if (filters.q) {
    query = query.or(
      `full_name.ilike.%${filters.q}%,username.ilike.%${filters.q}%,headline.ilike.%${filters.q}%`
    );
  }
  if (filters.city) {
    query = query.ilike("city", `%${filters.city}%`);
  }
  if (filters.genres?.length) {
    query = query.overlaps("musician_profiles.genres", filters.genres);
  }
  if (filters.instruments?.length) {
    query = query.overlaps("musician_profiles.instruments", filters.instruments);
  }
  if (filters.availability?.length) {
    query = query.overlaps("musician_profiles.available_for", filters.availability);
  }
  if (filters.experience) {
    query = query.eq(
      "musician_profiles.experience_level",
      filters.experience as never
    );
  }
  if (filters.openToWork) {
    query = query.eq("musician_profiles.open_to_work", true);
  }

  const { data, error } = await query;
  if (error) throw error;
  // PostgREST returns musician_profiles as a single object for !inner one-to-one.
  return (data ?? []) as unknown as MusicianWithProfile[];
}

export async function getMusicianByUsername(
  username: string
): Promise<MusicianWithProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*, musician_profiles (*), media (*)")
    .eq("username", username)
    .maybeSingle();
  return (data as unknown as MusicianWithProfile) ?? null;
}
