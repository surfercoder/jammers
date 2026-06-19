import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CalendarClock, MapPin } from "lucide-react";
import { requireProfile } from "@/lib/data/auth";
import { getIncomingBookings, getOutgoingBookings } from "@/lib/data/requests";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/status-badge";
import { RequestActions } from "@/components/request-actions";
import { formatMoney, initials } from "@/lib/format";
import type { BookingWithRelations } from "@/lib/types";

export const metadata: Metadata = { title: "Bookings" };

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function BookingItem({
  booking,
  direction,
}: {
  booking: BookingWithRelations;
  direction: "incoming" | "outgoing";
}) {
  return (
    <div className="bg-card flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center">
      <div className="bg-muted relative size-20 shrink-0 overflow-hidden rounded-lg">
        {booking.room?.photos?.[0] && (
          <Image
            src={booking.room.photos[0]}
            alt=""
            fill
            sizes="80px"
            className="object-cover"
          />
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <Link href={`/rooms/${booking.room?.slug}`} className="font-semibold hover:underline">
            {booking.room?.name}
          </Link>
          <StatusBadge status={booking.status} />
        </div>
        <p className="text-muted-foreground flex items-center gap-1 text-sm">
          <MapPin className="size-3.5" /> {booking.room?.neighborhood}
        </p>
        <p className="text-muted-foreground flex items-center gap-1 text-sm">
          <CalendarClock className="size-3.5" /> {fmt(booking.start_time)} → {fmt(booking.end_time)}
        </p>
        {direction === "incoming" && booking.requester && (
          <div className="flex items-center gap-2 pt-1">
            <Avatar className="size-6">
              <AvatarImage src={booking.requester.avatar_url ?? undefined} />
              <AvatarFallback className="text-[10px]">
                {initials(booking.requester.full_name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{booking.requester.full_name ?? booking.requester.username}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="font-semibold">{formatMoney(booking.total_price)}</span>
        <RequestActions id={booking.id} kind="booking" direction={direction} status={booking.status} />
      </div>
    </div>
  );
}

export default async function BookingsPage() {
  const profile = await requireProfile();
  const [incoming, outgoing] = await Promise.all([
    getIncomingBookings(profile.id),
    getOutgoingBookings(profile.id),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Bookings</h1>
      <Tabs defaultValue="outgoing">
        <TabsList>
          <TabsTrigger value="outgoing">My requests ({outgoing.length})</TabsTrigger>
          <TabsTrigger value="incoming">For my rooms ({incoming.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="outgoing" className="mt-4 space-y-3">
          {outgoing.length === 0 ? (
            <Empty message="You haven't requested any rooms yet." href="/explore" cta="Explore rooms" />
          ) : (
            outgoing.map((b) => <BookingItem key={b.id} booking={b} direction="outgoing" />)
          )}
        </TabsContent>

        <TabsContent value="incoming" className="mt-4 space-y-3">
          {incoming.length === 0 ? (
            <Empty message="No booking requests for your rooms yet." href="/host" cta="Manage rooms" />
          ) : (
            incoming.map((b) => <BookingItem key={b.id} booking={b} direction="incoming" />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Empty({ message, href, cta }: { message: string; href: string; cta: string }) {
  return (
    <div className="text-muted-foreground grid place-items-center rounded-2xl border border-dashed py-16 text-center">
      <p>{message}</p>
      <Link href={href} className="text-primary mt-2 text-sm font-medium hover:underline">
        {cta} →
      </Link>
    </div>
  );
}
