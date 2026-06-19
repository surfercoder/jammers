import Link from "next/link";
import { Logo } from "@/components/logo";

const HIGHLIGHTS = [
  "Book rehearsal rooms across Buenos Aires",
  "Hire session players, support acts & full bands",
  "Show your sound with video & a pro profile",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="bg-brand-gradient relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12 text-white">
        <div className="bg-hero-aurora animate-aurora pointer-events-none absolute inset-0 opacity-60 mix-blend-soft-light" />
        <Logo href="/" className="relative text-white [&_span]:text-white" />

        <div className="relative space-y-6">
          <div className="flex items-end gap-1" aria-hidden>
            {[0.5, 0.9, 0.6, 1, 0.7, 0.4, 0.85].map((h, i) => (
              <span
                key={i}
                className="equalizer-bar w-2 rounded-full bg-white/80"
                style={{
                  height: `${h * 56}px`,
                  animationDelay: `${i * 0.12}s`,
                }}
              />
            ))}
          </div>
          <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-tight text-balance">
            Where live music gets made.
          </h1>
          <ul className="space-y-2 text-white/85">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-white" />
                {h}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/70">
          The professional network for musicians, bands & venues.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Logo href="/" />
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            ← Home
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
