import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarClock,
  FileSignature,
  Building2,
  Map,
  Music2,
  ArrowRight,
} from "lucide-react";
import { requireProfile } from "@/lib/data/auth";
import {
  getIncomingBookings,
  getOutgoingBookings,
  getIncomingContracts,
  getOutgoingContracts,
} from "@/lib/data/requests";
import { getMyRooms } from "@/lib/data/rooms";
import { StatusBadge } from "@/components/status-badge";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const profile = await requireProfile();
  const [incomingB, outgoingB, incomingC, outgoingC, rooms] = await Promise.all([
    getIncomingBookings(profile.id),
    getOutgoingBookings(profile.id),
    getIncomingContracts(profile.id),
    getOutgoingContracts(profile.id),
    getMyRooms(profile.id),
  ]);

  const pendingBookings = incomingB.filter((b) => b.status === "pending").length;
  const pendingOffers = incomingC.filter((c) => c.status === "pending").length;

  const stats = [
    { label: "Booking requests", value: pendingBookings, sub: "awaiting your reply", href: "/bookings", icon: CalendarClock },
    { label: "Gig offers", value: pendingOffers, sub: "for you", href: "/contracts", icon: FileSignature },
    { label: "Your rooms", value: rooms.length, sub: "listed", href: "/host", icon: Building2 },
    { label: "Active requests", value: outgoingB.length + outgoingC.length, sub: "you sent", href: "/bookings", icon: ArrowRight },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Hey {profile.full_name?.split(" ")[0] ?? profile.username} 👋
      </h1>
      <p className="text-muted-foreground">Here's what's happening on Jammers.</p>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-card hover-glow rounded-xl border p-4"
          >
            <div className="text-muted-foreground flex items-center justify-between">
              <span className="text-sm">{s.label}</span>
              <s.icon className="size-4" />
            </div>
            <p className="mt-2 text-3xl font-semibold">{s.value}</p>
            <p className="text-muted-foreground text-xs">{s.sub}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <QuickAction href="/explore" icon={Map} title="Book a room" desc="Find your next rehearsal space" />
        <QuickAction href="/musicians" icon={Music2} title="Hire a musician" desc="Session players & support acts" />
        <QuickAction href="/host/rooms/new" icon={Building2} title="List a room" desc="Earn from your space" />
      </div>

      {/* Recent */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Latest booking requests" href="/bookings" empty="No bookings yet.">
          {incomingB.slice(0, 4).map((b) => (
            <Row key={b.id} title={b.room?.name ?? "Room"} subtitle={b.requester?.full_name ?? ""} status={b.status} />
          ))}
        </Panel>
        <Panel title="Latest gig offers" href="/contracts" empty="No offers yet.">
          {incomingC.slice(0, 4).map((c) => (
            <Row key={c.id} title={c.title} subtitle={c.requester?.full_name ?? ""} status={c.status} />
          ))}
        </Panel>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <Link href={href} className="bg-card hover-glow group flex items-center gap-3 rounded-xl border p-4">
      <span className="bg-brand-gradient grid size-10 shrink-0 place-items-center rounded-lg text-white">
        <Icon className="size-5" />
      </span>
      <span>
        <span className="block font-medium">{title}</span>
        <span className="text-muted-foreground block text-xs">{desc}</span>
      </span>
      <ArrowRight className="text-muted-foreground ml-auto size-4 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

function Panel({
  title,
  href,
  empty,
  children,
}: {
  title: string;
  href: string;
  empty: string;
  children: React.ReactNode;
}) {
  const items = [children].flat();
  const hasItems = items.some(Boolean) && items.length > 0;
  return (
    <div className="bg-card rounded-xl border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <Link href={href} className="text-primary text-sm hover:underline">
          View all
        </Link>
      </div>
      {hasItems ? (
        <div className="divide-y">{children}</div>
      ) : (
        <p className="text-muted-foreground py-6 text-center text-sm">{empty}</p>
      )}
    </div>
  );
}

function Row({
  title,
  subtitle,
  status,
}: {
  title: string;
  subtitle: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{title}</p>
        {subtitle && <p className="text-muted-foreground truncate text-xs">{subtitle}</p>}
      </div>
      <StatusBadge status={status} />
    </div>
  );
}
