"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  GENRES,
  INSTRUMENTS,
  AVAILABILITY,
  EXPERIENCE_LEVELS,
} from "@/lib/constants";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">{title}</p>
      {children}
    </div>
  );
}

export function MusicianFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const genres = params.getAll("genre");
  const instruments = params.getAll("instrument");
  const availability = params.getAll("avail");
  const experience = params.get("exp") ?? "";
  const openToWork = params.get("open") === "1";

  function update(mutate: (p: URLSearchParams) => void) {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    startTransition(() => router.replace(`${pathname}?${next.toString()}`));
  }

  function toggleMulti(key: string, value: string) {
    update((p) => {
      const set = new Set(p.getAll(key));
      p.delete(key);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      set.forEach((v) => p.append(key, v));
    });
  }

  const hasFilters =
    genres.length || instruments.length || availability.length || experience || openToWork;

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
        <Input
          placeholder="Search musicians…"
          defaultValue={params.get("q") ?? ""}
          onChange={(e) =>
            update((p) => (e.target.value ? p.set("q", e.target.value) : p.delete("q")))
          }
          className="pl-9"
        />
      </div>

      <Label className="bg-card flex items-center justify-between rounded-lg border p-3">
        <span className="text-sm font-medium">Open to work only</span>
        <Switch
          checked={openToWork}
          onCheckedChange={(v) =>
            update((p) => (v ? p.set("open", "1") : p.delete("open")))
          }
        />
      </Label>

      <Section title="Instruments">
        <div className="flex flex-wrap gap-1.5">
          {INSTRUMENTS.map((instrument) => (
            <Chip
              key={instrument}
              label={instrument}
              active={instruments.includes(instrument)}
              onClick={() => toggleMulti("instrument", instrument)}
            />
          ))}
        </div>
      </Section>

      <Section title="Genres">
        <div className="flex flex-wrap gap-1.5">
          {GENRES.map((g) => (
            <Chip
              key={g}
              label={g}
              active={genres.includes(g)}
              onClick={() => toggleMulti("genre", g)}
            />
          ))}
        </div>
      </Section>

      <Section title="Available for">
        <div className="grid gap-2">
          {AVAILABILITY.map((a) => (
            <Label key={a.value} className="flex items-center gap-2 font-normal">
              <Checkbox
                checked={availability.includes(a.value)}
                onCheckedChange={() => toggleMulti("avail", a.value)}
              />
              {a.label}
            </Label>
          ))}
        </div>
      </Section>

      <Section title="Experience">
        <div className="grid gap-2">
          {EXPERIENCE_LEVELS.map((e) => (
            <Label key={e.value} className="flex items-center gap-2 font-normal">
              <Checkbox
                checked={experience === e.value}
                onCheckedChange={() =>
                  update((p) =>
                    experience === e.value ? p.delete("exp") : p.set("exp", e.value)
                  )
                }
              />
              {e.label}
            </Label>
          ))}
        </div>
      </Section>

      {hasFilters ? (
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => startTransition(() => router.replace(pathname))}
        >
          <X className="size-4" /> Clear all filters
        </Button>
      ) : null}
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "bg-primary text-primary-foreground rounded-full border px-2.5 py-1 text-xs font-medium"
          : "border-border hover:border-primary rounded-full border px-2.5 py-1 text-xs transition-colors"
      }
    >
      {label}
    </button>
  );
}
