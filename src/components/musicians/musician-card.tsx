import Link from "next/link";
import { MapPin, BadgeCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/format";
import type { MusicianWithProfile } from "@/lib/types";

export function MusicianCard({ musician }: { musician: MusicianWithProfile }) {
  const m = musician.musician_profiles;
  const tags = [...(m?.instruments ?? []), ...(m?.genres ?? [])].slice(0, 4);

  return (
    <Link
      href={`/musicians/${musician.username}`}
      className="group bg-card hover-glow block overflow-hidden rounded-xl border"
    >
      <div className="bg-brand-gradient relative h-20">
        <div className="bg-hero-aurora absolute inset-0 opacity-60" />
      </div>
      <div className="-mt-9 px-4 pb-4">
        <Avatar className="border-card size-16 border-4 shadow-sm">
          <AvatarImage src={musician.avatar_url ?? undefined} alt={musician.full_name ?? ""} />
          <AvatarFallback className="text-lg">
            {initials(musician.full_name ?? musician.username)}
          </AvatarFallback>
        </Avatar>

        <div className="mt-2 flex items-center gap-1">
          <h3 className="line-clamp-1 font-semibold">
            {musician.full_name ?? musician.username}
          </h3>
          {m?.open_to_work && (
            <BadgeCheck className="size-4 shrink-0 text-emerald-500" />
          )}
        </div>
        {musician.headline && (
          <p className="text-muted-foreground line-clamp-1 text-sm">
            {musician.headline}
          </p>
        )}
        {musician.city && (
          <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
            <MapPin className="size-3" /> {musician.city}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-1">
          {tags.map((t) => (
            <Badge key={t} variant="secondary" className="font-normal">
              {t}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}
