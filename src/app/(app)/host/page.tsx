import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import { requireProfile } from "@/lib/data/auth";
import { getMyRooms } from "@/lib/data/rooms";
import { RoomCard } from "@/components/rooms/room-card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Host a room" };

export default async function HostPage() {
  const profile = await requireProfile();
  const rooms = await getMyRooms(profile.id);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your rooms</h1>
          <p className="text-muted-foreground text-sm">
            List rehearsal spaces and manage their bookings.
          </p>
        </div>
        <Button asChild>
          <Link href="/host/rooms/new">
            <Plus className="size-4" /> List a room
          </Link>
        </Button>
      </div>

      {rooms.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed py-20 text-center">
          <Building2 className="text-muted-foreground mb-3 size-10" />
          <p className="font-medium">No rooms yet</p>
          <p className="text-muted-foreground mb-4 text-sm">
            Earn by renting your rehearsal space to musicians.
          </p>
          <Button asChild>
            <Link href="/host/rooms/new">
              <Plus className="size-4" /> List your first room
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} showSave={false} />
          ))}
        </div>
      )}
    </div>
  );
}
