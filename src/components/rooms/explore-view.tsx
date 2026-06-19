"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Map as MapIcon, List } from "lucide-react";
import { RoomCard } from "./room-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { RoomWithMeta } from "@/lib/types";

const RoomMap = dynamic(() => import("./room-map").then((m) => m.RoomMap), {
  ssr: false,
  loading: () => <Skeleton className="size-full" />,
});

export function ExploreView({
  rooms,
  savedIds,
}: {
  rooms: RoomWithMeta[];
  savedIds: string[];
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const saved = new Set(savedIds);

  return (
    <div className="relative flex flex-1 flex-col lg:flex-row">
      {/* List */}
      <div
        className={cn(
          "flex-1 overflow-y-auto px-4 py-4 sm:px-6 lg:max-w-[60%]",
          mobileView === "map" && "hidden lg:block"
        )}
      >
        {rooms.length === 0 ? (
          <div className="text-muted-foreground grid h-64 place-items-center text-center">
            <div>
              <p className="font-medium">No rooms match your filters</p>
              <p className="text-sm">Try widening your search.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                saved={saved.has(room.id)}
                active={hoveredId === room.id || selectedId === room.id}
                onHover={setHoveredId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div
        className={cn(
          "bg-muted sticky top-16 h-[calc(100vh-4rem)] lg:w-[40%]",
          mobileView === "list" ? "hidden lg:block" : "block"
        )}
      >
        <RoomMap
          rooms={rooms}
          hoveredId={hoveredId}
          selectedId={selectedId}
          onHover={setHoveredId}
          onSelect={setSelectedId}
        />
      </div>

      {/* Mobile toggle */}
      <div className="fixed bottom-5 left-1/2 z-20 -translate-x-1/2 lg:hidden">
        <Button
          onClick={() => setMobileView((v) => (v === "list" ? "map" : "list"))}
          className="shadow-lg"
        >
          {mobileView === "list" ? <MapIcon className="size-4" /> : <List className="size-4" />}
          {mobileView === "list" ? "Map" : "List"}
        </Button>
      </div>
    </div>
  );
}
