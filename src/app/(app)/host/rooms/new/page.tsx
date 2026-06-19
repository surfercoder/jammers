import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireProfile } from "@/lib/data/auth";
import { RoomForm } from "@/components/rooms/room-form";

export const metadata: Metadata = { title: "List a room" };

export default async function NewRoomPage() {
  await requireProfile();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <Link
        href="/host"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" /> Back to your rooms
      </Link>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        List a rehearsal room
      </h1>
      <RoomForm />
    </div>
  );
}
