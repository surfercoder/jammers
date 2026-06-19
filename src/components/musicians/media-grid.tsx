import { youtubeEmbed } from "@/lib/format";
import type { Media } from "@/lib/types";

export function MediaGrid({ media }: { media: Media[] }) {
  const videos = media.filter((m) => m.type === "video");
  if (!videos.length) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {videos.map((m) => (
        <figure key={m.id} className="space-y-2">
          <div className="aspect-video overflow-hidden rounded-xl border">
            <iframe
              src={youtubeEmbed(m.url)}
              title={m.title ?? "Performance"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              sandbox="allow-scripts allow-presentation allow-popups"
              allowFullScreen
              className="size-full"
            />
          </div>
          {m.title && (
            <figcaption className="text-muted-foreground text-sm">
              {m.title}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
