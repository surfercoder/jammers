import Link from "next/link";
import { Sparkles, Play, Map } from "lucide-react";
import { Button } from "@/components/ui/button";

// Deterministic bar heights (SSR-safe — no Math.random during render).
const BARS = [
  34, 58, 42, 70, 50, 86, 62, 40, 76, 54, 92, 48, 66, 38, 80, 56, 44, 72, 60,
  88, 46, 68, 52, 78, 36, 64, 90, 50, 74, 42, 82, 58,
];

export function Hero({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-hero-aurora animate-aurora pointer-events-none absolute inset-0 -z-10 opacity-70" />
      <div className="bg-hero-grid pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-24 text-center sm:py-32">
        <Link
          href="/musicians"
          className="border-primary/30 bg-primary/5 text-foreground/80 hover:bg-primary/10 mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm backdrop-blur transition-colors"
        >
          <Sparkles className="text-primary size-4" />
          The professional network for live music
        </Link>

        <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl md:text-7xl">
          Where live music <span className="text-gradient">gets made</span>
        </h1>

        <p className="text-muted-foreground mt-6 max-w-2xl text-lg text-pretty sm:text-xl">
          Book rehearsal rooms across the city, hire session players and support
          acts, and grow your band — all in one place built for musicians,
          managers and venues.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 px-8 text-base">
            <Link href={signedIn ? "/explore" : "/sign-up"}>
              <Play className="size-5" />
              {signedIn ? "Open the app" : "Get started — it's free"}
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
            <Link href="/explore">
              <Map className="size-5" />
              Explore rooms
            </Link>
          </Button>
        </div>

        {/* Waveform card */}
        <div className="relative mt-16 w-full max-w-2xl">
          <div className="bg-brand-gradient absolute inset-0 -z-10 blur-3xl opacity-30" />
          <div className="bg-card/60 flex h-32 items-center justify-center gap-1.5 rounded-2xl border p-6 backdrop-blur">
            {BARS.map((h, i) => (
              <span
                key={i}
                className="bg-brand-gradient equalizer-bar w-1.5 rounded-full"
                style={{
                  height: `${h}%`,
                  animationDelay: `${(i % 8) * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
