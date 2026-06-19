"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SaveRoomButton } from "./save-room-button";
import { amenityLabel } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { RoomWithMeta } from "@/lib/types";

export function RoomCard({
  room,
  saved = false,
  active = false,
  onHover,
  showSave = true,
}: {
  room: RoomWithMeta;
  saved?: boolean;
  active?: boolean;
  onHover?: (id: string | null) => void;
  showSave?: boolean;
}) {
  return (
    <Link
      href={`/rooms/${room.slug}`}
      onMouseEnter={() => onHover?.(room.id)}
      onMouseLeave={() => onHover?.(null)}
      className={cn(
        "group bg-card hover-glow block overflow-hidden rounded-xl border transition-colors",
        active && "ring-primary/60 ring-2"
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {room.photos[0] ? (
          <Image
            src={room.photos[0]}
            alt={room.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="bg-muted size-full" />
        )}
        {showSave && (
          <div className="absolute right-2 top-2">
            <SaveRoomButton roomId={room.id} initialSaved={saved} />
          </div>
        )}
        <div className="absolute bottom-2 left-2">
          <Badge className="bg-background/85 text-foreground backdrop-blur">
            {formatMoney(room.hourly_price, room.currency)}
            <span className="text-muted-foreground font-normal">/hr</span>
          </Badge>
        </div>
      </div>

      <div className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold">{room.name}</h3>
          {room.rating != null && (
            <span className="flex shrink-0 items-center gap-1 text-sm">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              {room.rating}
              <span className="text-muted-foreground">({room.review_count})</span>
            </span>
          )}
        </div>
        <p className="text-muted-foreground flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" /> {room.neighborhood}
          </span>
          {room.capacity != null && (
            <span className="flex items-center gap-1">
              <Users className="size-3.5" /> {room.capacity}
            </span>
          )}
        </p>
        <div className="flex flex-wrap gap-1">
          {room.amenities.slice(0, 3).map((a) => (
            <Badge key={a} variant="secondary" className="font-normal">
              {amenityLabel(a)}
            </Badge>
          ))}
          {room.amenities.length > 3 && (
            <Badge variant="outline" className="font-normal">
              +{room.amenities.length - 3}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
