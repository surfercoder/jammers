"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleSaveRoom } from "@/app/actions/rooms";
import { cn } from "@/lib/utils";

export function SaveRoomButton({
  roomId,
  initialSaved,
  className,
}: {
  roomId: string;
  initialSaved: boolean;
  className?: string;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label={saved ? "Remove from saved" : "Save room"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const prev = saved;
        setSaved(!prev);
        startTransition(async () => {
          const res = await toggleSaveRoom(roomId, prev);
          if (res?.error) setSaved(prev);
        });
      }}
      className={cn(
        "grid size-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition-transform hover:scale-110",
        className
      )}
    >
      <Heart className={cn("size-4", saved && "fill-current text-rose-400")} />
    </button>
  );
}
