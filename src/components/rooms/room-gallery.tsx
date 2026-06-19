"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function RoomGallery({ photos, name }: { photos: string[]; name: string }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  if (!photos.length) {
    return <div className="bg-muted aspect-[16/9] w-full rounded-2xl" />;
  }

  const open_ = (i: number) => {
    setActive(i);
    setOpen(true);
  };

  return (
    <>
      <div className="grid h-[clamp(280px,42vw,460px)] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl">
        <button
          type="button"
          onClick={() => open_(0)}
          className={cn(
            "relative col-span-2 row-span-2 overflow-hidden",
            photos.length === 1 && "col-span-4"
          )}
        >
          <Image
            src={photos[0]}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform hover:scale-105"
          />
        </button>
        {photos.slice(1, 5).map((p, i) => (
          <button
            key={p}
            type="button"
            onClick={() => open_(i + 1)}
            className="relative overflow-hidden"
          >
            <Image
              src={p}
              alt={`${name} ${i + 2}`}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform hover:scale-105"
            />
          </button>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl overflow-hidden p-0">
          <DialogTitle className="sr-only">{name} photos</DialogTitle>
          <Image
            src={photos[active]}
            alt={name}
            width={1600}
            height={1200}
            className="max-h-[80vh] w-full object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
