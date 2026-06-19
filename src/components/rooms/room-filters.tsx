"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AMENITIES, BA_NEIGHBORHOODS } from "@/lib/constants";
import { formatMoney } from "@/lib/format";

export function RoomFilters({ resultCount }: { resultCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const selectedHoods = params.getAll("hood");
  const selectedAmenities = params.getAll("amenity");
  const priceMax = Number(params.get("priceMax") ?? 0);

  function update(mutate: (p: URLSearchParams) => void) {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    startTransition(() => router.replace(`${pathname}?${next.toString()}`));
  }

  function toggleMulti(key: string, value: string) {
    update((p) => {
      const current = p.getAll(key);
      p.delete(key);
      const set = new Set(current);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      set.forEach((v) => p.append(key, v));
    });
  }

  const activeCount =
    selectedHoods.length + selectedAmenities.length + (priceMax ? 1 : 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search rooms or neighborhoods…"
            defaultValue={params.get("q") ?? ""}
            onChange={(e) =>
              update((p) => {
                if (e.target.value) p.set("q", e.target.value);
                else p.delete("q");
              })
            }
            className="pl-9"
          />
        </div>

        {/* Neighborhoods */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              Area
              {selectedHoods.length > 0 && (
                <Badge variant="secondary">{selectedHoods.length}</Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3">
            <div className="grid max-h-64 gap-2 overflow-auto">
              {BA_NEIGHBORHOODS.map((h) => (
                <Label key={h} className="flex items-center gap-2 font-normal">
                  <Checkbox
                    checked={selectedHoods.includes(h)}
                    onCheckedChange={() => toggleMulti("hood", h)}
                  />
                  {h}
                </Label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Amenities */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <SlidersHorizontal className="size-4" />
              Gear
              {selectedAmenities.length > 0 && (
                <Badge variant="secondary">{selectedAmenities.length}</Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3">
            <div className="grid max-h-64 gap-2 overflow-auto">
              {AMENITIES.map((a) => (
                <Label
                  key={a.value}
                  className="flex items-center gap-2 font-normal"
                >
                  <Checkbox
                    checked={selectedAmenities.includes(a.value)}
                    onCheckedChange={() => toggleMulti("amenity", a.value)}
                  />
                  {a.label}
                </Label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Price */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              Price {priceMax ? `≤ ${formatMoney(priceMax)}` : ""}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 space-y-4 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Max price / hour</span>
              <span className="font-medium">
                {priceMax ? formatMoney(priceMax) : "Any"}
              </span>
            </div>
            <Slider
              min={0}
              max={20000}
              step={1000}
              value={[priceMax]}
              onValueChange={([v]) =>
                update((p) => (v ? p.set("priceMax", String(v)) : p.delete("priceMax")))
              }
            />
          </PopoverContent>
        </Popover>

        {activeCount > 0 && (
          <Button
            variant="ghost"
            onClick={() =>
              update((p) => {
                p.delete("hood");
                p.delete("amenity");
                p.delete("priceMax");
              })
            }
          >
            <X className="size-4" /> Clear
          </Button>
        )}
      </div>

      <p className="text-muted-foreground text-sm">
        {resultCount} {resultCount === 1 ? "room" : "rooms"} available
      </p>
    </div>
  );
}
