import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  BadgeCheck,
  Briefcase,
  Music2,
  Pencil,
} from "lucide-react";
import { getMusicianByUsername } from "@/lib/data/musicians";
import { getCurrentProfile } from "@/lib/data/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContractDialog } from "@/components/musicians/contract-dialog";
import { MediaGrid } from "@/components/musicians/media-grid";
import { MessageButton } from "@/components/message-button";
import { initials, formatMoney } from "@/lib/format";
import { availabilityLabel } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const m = await getMusicianByUsername(username);
  return {
    title: m?.full_name ?? `@${username}`,
    description: m?.headline ?? undefined,
  };
}

export default async function MusicianProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const musician = await getMusicianByUsername(username);
  if (!musician) notFound();

  const viewer = await getCurrentProfile();
  const isSelf = viewer?.id === musician.id;
  const m = musician.musician_profiles;
  const displayName = musician.full_name ?? musician.username;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      {/* Cover + header */}
      <div className="bg-brand-gradient relative h-36 overflow-hidden rounded-2xl sm:h-44">
        <div className="bg-hero-aurora animate-aurora absolute inset-0 opacity-70" />
      </div>

      <div className="px-2 sm:px-6">
        <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <Avatar className="border-background size-24 border-4 shadow-lg sm:size-28">
              <AvatarImage src={musician.avatar_url ?? undefined} alt={displayName} />
              <AvatarFallback className="text-3xl">
                {initials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">{displayName}</h1>
                {m?.open_to_work && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <BadgeCheck className="size-3.5" /> Open to work
                  </span>
                )}
              </div>
              <p className="text-muted-foreground">@{musician.username}</p>
            </div>
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            {isSelf ? (
              <Button asChild variant="outline">
                <Link href="/profile">
                  <Pencil className="size-4" /> Edit profile
                </Link>
              </Button>
            ) : viewer ? (
              <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:grid-cols-none sm:auto-cols-max sm:grid-flow-col">
                <MessageButton targetId={musician.id} />
                <ContractDialog musicianId={musician.id} musicianName={displayName} />
              </div>
            ) : (
              <Button asChild>
                <Link href={`/sign-in?next=/musicians/${username}`}>
                  Sign in to contact
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-4 text-sm">
          {musician.headline && (
            <span className="text-foreground font-medium">{musician.headline}</span>
          )}
          {musician.city && (
            <span className="flex items-center gap-1">
              <MapPin className="size-4" /> {musician.city}
            </span>
          )}
          {m?.experience_level && (
            <span className="flex items-center gap-1 capitalize">
              <Briefcase className="size-4" /> {m.experience_level}
              {m.years_experience ? ` · ${m.years_experience} yrs` : ""}
            </span>
          )}
          {m?.hourly_rate != null && (
            <span className="text-foreground font-medium">
              {formatMoney(m.hourly_rate, m.rate_currency)}/hr
            </span>
          )}
        </div>

        {/* Tags */}
        {m && (m.instruments.length > 0 || m.genres.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {m.instruments.map((instrument) => (
              <Badge key={instrument}>{instrument}</Badge>
            ))}
            {m.genres.map((g) => (
              <Badge key={g} variant="secondary">
                {g}
              </Badge>
            ))}
          </div>
        )}

        {/* Availability */}
        {m && m.available_for.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {m.available_for.map((a) => (
              <span
                key={a}
                className="border-primary/30 bg-primary/5 text-primary rounded-full border px-3 py-1 text-xs font-medium"
              >
                {availabilityLabel(a)}
              </span>
            ))}
          </div>
        )}

        {/* Bio */}
        {musician.bio && (
          <section className="mt-8">
            <h2 className="mb-2 text-lg font-semibold">About</h2>
            <p className="text-muted-foreground max-w-2xl whitespace-pre-line leading-relaxed">
              {musician.bio}
            </p>
          </section>
        )}

        {/* Media */}
        <section className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <Music2 className="size-5" /> Performances
          </h2>
          {musician.media.length ? (
            <MediaGrid media={musician.media} />
          ) : (
            <p className="text-muted-foreground text-sm">
              No videos yet.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
