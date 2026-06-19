"use client";

import { useTheme } from "next-themes";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  type MapRef,
} from "react-map-gl/maplibre";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import "maplibre-gl/dist/maplibre-gl.css";
import { BA_CENTER, MAP_STYLES } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { RoomWithMeta } from "@/lib/types";

export function RoomMap({
  rooms,
  hoveredId,
  selectedId,
  onHover,
  onSelect,
}: {
  rooms: RoomWithMeta[];
  hoveredId: string | null;
  selectedId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
}) {
  const { resolvedTheme } = useTheme();
  const mapRef = useRef<MapRef>(null);
  const selected = rooms.find((r) => r.id === selectedId) ?? null;

  return (
    <Map
      ref={mapRef}
      initialViewState={BA_CENTER}
      mapStyle={resolvedTheme === "light" ? MAP_STYLES.light : MAP_STYLES.dark}
      attributionControl={false}
      style={{ width: "100%", height: "100%" }}
    >
      <NavigationControl position="top-right" showCompass={false} />

      {rooms.map((room) => {
        const active = room.id === hoveredId || room.id === selectedId;
        return (
          <Marker
            key={room.id}
            longitude={room.longitude}
            latitude={room.latitude}
            anchor="center"
          >
            <button
              type="button"
              onMouseEnter={() => onHover(room.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onSelect(room.id)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-semibold shadow-md transition-all",
                active
                  ? "bg-brand-gradient z-10 scale-110 border-transparent text-white"
                  : "bg-background hover:border-primary border-border text-foreground"
              )}
            >
              {formatMoney(room.hourly_price, room.currency)}
            </button>
          </Marker>
        );
      })}

      {selected && (
        <Popup
          longitude={selected.longitude}
          latitude={selected.latitude}
          anchor="bottom"
          offset={20}
          closeButton={false}
          onClose={() => onSelect(null)}
        >
          <Link
            href={`/rooms/${selected.slug}`}
            className="bg-card text-card-foreground block w-56 overflow-hidden rounded-lg border"
          >
            {selected.photos[0] && (
              <Image
                src={selected.photos[0]}
                alt={selected.name}
                width={224}
                height={112}
                className="h-28 w-full object-cover"
              />
            )}
            <div className="space-y-0.5 p-2.5">
              <p className="truncate text-sm font-semibold">{selected.name}</p>
              <p className="text-muted-foreground text-xs">
                {selected.neighborhood} ·{" "}
                {formatMoney(selected.hourly_price, selected.currency)}/hr
              </p>
            </div>
          </Link>
        </Popup>
      )}
    </Map>
  );
}
