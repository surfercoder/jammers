import type { Metadata } from "next";
import { Suspense } from "react";
import { Users } from "lucide-react";
import { MusicianFilters } from "@/components/musicians/musician-filters";
import { MusicianCard } from "@/components/musicians/musician-card";
import { getMusicians } from "@/lib/data/musicians";

export const metadata: Metadata = {
  title: "Find musicians",
  description: "Discover and hire musicians, bands and session players.",
};

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export default async function MusiciansPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const musicians = await getMusicians({
    q: typeof sp.q === "string" ? sp.q : undefined,
    genres: toArray(sp.genre),
    instruments: toArray(sp.instrument),
    availability: toArray(sp.avail),
    experience: typeof sp.exp === "string" ? sp.exp : undefined,
    openToWork: sp.open === "1",
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Find your next collaborator
        </h1>
        <p className="text-muted-foreground">
          Session players, support acts and full bands across Buenos Aires.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <Suspense>
            <MusicianFilters />
          </Suspense>
        </aside>

        <div>
          <p className="text-muted-foreground mb-4 text-sm">
            {musicians.length} {musicians.length === 1 ? "musician" : "musicians"}
          </p>
          {musicians.length === 0 ? (
            <div className="text-muted-foreground grid place-items-center rounded-2xl border border-dashed py-20 text-center">
              <Users className="mb-3 size-10" />
              <p className="font-medium">No musicians match your filters</p>
              <p className="text-sm">Try removing a few.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {musicians.map((m) => (
                <MusicianCard key={m.id} musician={m} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
