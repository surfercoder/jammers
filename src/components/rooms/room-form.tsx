"use client";

import { useActionState, useState } from "react";
import { useTheme } from "next-themes";
import Map, { Marker, type MapLayerMouseEvent } from "react-map-gl/maplibre";
import { MapPin } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
import { createRoom, type ActionResult } from "@/app/actions/rooms";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormError } from "@/components/auth/form-error";
import { FieldError } from "@/components/auth/field-error";
import { AMENITIES, BA_NEIGHBORHOODS, BA_CENTER, MAP_STYLES } from "@/lib/constants";

export function RoomForm() {
  const [state, action] = useActionState<ActionResult, FormData>(createRoom, {});
  const { resolvedTheme } = useTheme();
  const [pin, setPin] = useState({
    latitude: BA_CENTER.latitude,
    longitude: BA_CENTER.longitude,
  });

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-2">
      <input type="hidden" name="latitude" value={pin.latitude} />
      <input type="hidden" name="longitude" value={pin.longitude} />

      <div className="space-y-4">
        <FormError message={state.error} />
        <div className="space-y-1.5">
          <Label htmlFor="name">Room name</Label>
          <Input id="name" name="name" placeholder="The Loft Rehearsal Studio" required />
          <FieldError errors={state.fieldErrors?.name} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="neighborhood">Neighborhood</Label>
          <Select name="neighborhood" defaultValue="Palermo">
            <SelectTrigger id="neighborhood" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BA_NEIGHBORHOODS.map((h) => (
                <SelectItem key={h} value={h}>
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address">Address (optional)</Label>
          <Input id="address" name="address" placeholder="Calle Falsa 123" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="hourly_price">Price / hour (ARS)</Label>
            <Input id="hourly_price" name="hourly_price" type="number" min={0} defaultValue={6000} required />
            <FieldError errors={state.fieldErrors?.hourly_price} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="capacity">Capacity</Label>
            <Input id="capacity" name="capacity" type="number" min={1} defaultValue={5} required />
            <FieldError errors={state.fieldErrors?.capacity} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={4} placeholder="Tell musicians about your space, gear and vibe." />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="photos">Photo URLs (one per line)</Label>
          <Textarea
            id="photos"
            name="photos"
            rows={3}
            placeholder="https://images.unsplash.com/..."
          />
          <FieldError errors={state.fieldErrors?.photos} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Pin the location</Label>
          <p className="text-muted-foreground text-xs">
            Click the map to place your room.
          </p>
          <div className="h-64 overflow-hidden rounded-xl border">
            <Map
              initialViewState={BA_CENTER}
              mapStyle={resolvedTheme === "light" ? MAP_STYLES.light : MAP_STYLES.dark}
              attributionControl={false}
              onClick={(e: MapLayerMouseEvent) =>
                setPin({ latitude: e.lngLat.lat, longitude: e.lngLat.lng })
              }
              style={{ width: "100%", height: "100%" }}
            >
              <Marker latitude={pin.latitude} longitude={pin.longitude} anchor="bottom">
                <span className="bg-brand-gradient grid size-8 place-items-center rounded-full text-white shadow-lg">
                  <MapPin className="size-4" />
                </span>
              </Marker>
            </Map>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Gear & amenities</Label>
          <div className="grid grid-cols-2 gap-2">
            {AMENITIES.map((a) => (
              <Label key={a.value} className="flex items-center gap-2 font-normal">
                <Checkbox name="amenities" value={a.value} />
                {a.label}
              </Label>
            ))}
          </div>
        </div>

        <SubmitButton>Publish room</SubmitButton>
      </div>
    </form>
  );
}
