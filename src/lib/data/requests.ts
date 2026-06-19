import "server-only";
import { createClient } from "@/utils/supabase/server";
import type { BookingWithRelations, ContractWithRelations } from "@/lib/types";

/** Bookings where the user is the requester. */
export async function getOutgoingBookings(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("room_bookings")
    .select(
      `*, room:rehearsal_rooms (id, name, slug, photos, neighborhood),
       requester:profiles!room_bookings_requester_id_fkey (id, username, full_name, avatar_url)`
    )
    .eq("requester_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as BookingWithRelations[];
}

/** Bookings for rooms the user owns (incoming requests). */
export async function getIncomingBookings(userId: string) {
  const supabase = await createClient();
  const { data: rooms } = await supabase
    .from("rehearsal_rooms")
    .select("id")
    .eq("owner_id", userId);
  const ids = (rooms ?? []).map((r) => r.id);
  if (!ids.length) return [];

  const { data } = await supabase
    .from("room_bookings")
    .select(
      `*, room:rehearsal_rooms (id, name, slug, photos, neighborhood),
       requester:profiles!room_bookings_requester_id_fkey (id, username, full_name, avatar_url)`
    )
    .in("room_id", ids)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as BookingWithRelations[];
}

const CONTRACT_SELECT = `*,
  requester:profiles!contracts_requester_id_fkey (id, username, full_name, avatar_url),
  musician:profiles!contracts_musician_id_fkey (id, username, full_name, avatar_url)`;

/** Contracts the user sent (as a manager/band hiring). */
export async function getOutgoingContracts(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contracts")
    .select(CONTRACT_SELECT)
    .eq("requester_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as ContractWithRelations[];
}

/** Contracts the user received (as the musician being hired). */
export async function getIncomingContracts(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contracts")
    .select(CONTRACT_SELECT)
    .eq("musician_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as ContractWithRelations[];
}
