"use client";

import { useTheme } from "next-themes";
import Map, { Marker } from "react-map-gl/maplibre";
import { MapPin } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_STYLES } from "@/lib/constants";

export function RoomLocationMap({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const { resolvedTheme } = useTheme();
  return (
    <div className="h-72 overflow-hidden rounded-2xl border">
      <Map
        initialViewState={{ latitude, longitude, zoom: 14 }}
        mapStyle={resolvedTheme === "light" ? MAP_STYLES.light : MAP_STYLES.dark}
        attributionControl={false}
        dragRotate={false}
        style={{ width: "100%", height: "100%" }}
      >
        <Marker latitude={latitude} longitude={longitude} anchor="bottom">
          <span className="bg-brand-gradient grid size-9 place-items-center rounded-full text-white shadow-lg ring-4 ring-white/30">
            <MapPin className="size-5" />
          </span>
        </Marker>
      </Map>
    </div>
  );
}
