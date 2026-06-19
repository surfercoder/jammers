import type { Metadata } from "next";
import { Suspense } from "react";
import { RoomFilters } from "@/components/rooms/room-filters";
import { ExploreView } from "@/components/rooms/explore-view";
import { getRooms, getSavedRoomIds } from "@/lib/data/rooms";
import { getCurrentProfile } from "@/lib/data/auth";

export const metadata: Metadata = {
  title: "Explore rehearsal rooms",
  description: "Find and book rehearsal rooms across Buenos Aires.",
};

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = {
    q: typeof sp.q === "string" ? sp.q : undefined,
    neighborhoods: toArray(sp.hood),
    amenities: toArray(sp.amenity),
    priceMax: sp.priceMax ? Number(sp.priceMax) : undefined,
  };

  const profile = await getCurrentProfile();
  const [rooms, savedIds] = await Promise.all([
    getRooms(filters),
    profile ? getSavedRoomIds(profile.id) : Promise.resolve(new Set<string>()),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b px-4 py-4 sm:px-6">
        <Suspense>
          <RoomFilters resultCount={rooms.length} />
        </Suspense>
      </div>
      <ExploreView rooms={rooms} savedIds={[...savedIds]} />
    </div>
  );
}
