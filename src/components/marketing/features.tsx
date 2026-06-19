import Link from "next/link";
import {
  MapPin,
  Music2,
  CalendarCheck,
  Search,
  Video,
  MessagesSquare,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PERKS = [
  { icon: Search, title: "Powerful filters", desc: "Find rooms by gear & price, or players by instrument, genre and availability." },
  { icon: Video, title: "Show your sound", desc: "Build a pro profile with videos so bookers hear you before they hire you." },
  { icon: MessagesSquare, title: "Direct messaging", desc: "Chat in real time to lock in details before you commit." },
  { icon: ShieldCheck, title: "Request & confirm", desc: "Every booking and contract is reviewed and accepted — no surprises." },
];

function FeatureBand({
  align,
  badge,
  icon: Icon,
  title,
  desc,
  points,
  cta,
  href,
}: {
  align: "left" | "right";
  badge: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  points: string[];
  cta: string;
  href: string;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div className={align === "right" ? "lg:order-2" : ""}>
        <span className="text-primary inline-flex items-center gap-2 text-sm font-medium">
          <Icon className="size-4" /> {badge}
        </span>
        <h3 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {title}
        </h3>
        <p className="text-muted-foreground mt-3 text-lg">{desc}</p>
        <ul className="mt-5 space-y-2">
          {points.map((p) => (
            <li key={p} className="flex items-center gap-2">
              <span className="bg-primary size-1.5 rounded-full" />
              {p}
            </li>
          ))}
        </ul>
        <Button asChild className="mt-6">
          <Link href={href}>{cta}</Link>
        </Button>
      </div>

      <div className={align === "right" ? "lg:order-1" : ""}>
        <div className="bg-card hover-glow relative aspect-[4/3] overflow-hidden rounded-3xl border">
          <div className="bg-hero-aurora animate-aurora absolute inset-0 opacity-60" />
          <div className="bg-hero-grid absolute inset-0 opacity-40" />
          <Icon className="text-foreground/10 absolute -bottom-6 -right-6 size-56" />
        </div>
      </div>
    </div>
  );
}

export function Features() {
  return (
    <section className="mx-auto max-w-6xl space-y-24 px-4 py-24 sm:px-6">
      <FeatureBand
        align="left"
        badge="Rehearsal rooms"
        icon={MapPin}
        title="Book the perfect room, on a live map"
        desc="Browse rehearsal studios near you like an Airbnb for musicians — see gear, prices and photos, then request a time."
        points={[
          "Interactive map with instant previews",
          "Filter by backline, capacity and budget",
          "Real reviews from other bands",
        ]}
        cta="Explore rooms"
        href="/explore"
      />
      <FeatureBand
        align="right"
        badge="The musician network"
        icon={Music2}
        title="Find players. Get hired. Build your band."
        desc="A professional profile for every musician. Managers find support acts and session players; artists land gigs."
        points={[
          "Filter by instrument, genre & experience",
          "Send and manage contract offers",
          "Showcase performance videos",
        ]}
        cta="Find musicians"
        href="/musicians"
      />

      {/* Perks grid */}
      <div>
        <div className="mx-auto max-w-2xl text-center">
          <h3 className="text-3xl font-semibold tracking-tight">
            Built for working musicians
          </h3>
          <p className="text-muted-foreground mt-3">
            Everything you need to play more and stress less.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map((p) => (
            <div key={p.title} className="bg-card rounded-2xl border p-5">
              <span className="bg-brand-gradient grid size-10 place-items-center rounded-xl text-white">
                <p.icon className="size-5" />
              </span>
              <h4 className="mt-4 font-semibold">{p.title}</h4>
              <p className="text-muted-foreground mt-1 text-sm">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Roles */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Music2, t: "Musicians", d: "Show your talent and get booked." },
          { icon: CalendarCheck, t: "Managers & bands", d: "Hire players and support acts fast." },
          { icon: Building2, t: "Room owners", d: "List your space and fill your calendar." },
        ].map((r) => (
          <div key={r.t} className="bg-card flex items-center gap-3 rounded-2xl border p-5">
            <r.icon className="text-primary size-6" />
            <div>
              <p className="font-medium">{r.t}</p>
              <p className="text-muted-foreground text-sm">{r.d}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
