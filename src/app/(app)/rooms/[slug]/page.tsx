import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, MapPin, Users, Check } from "lucide-react";
import { getRoomBySlug, getRoomReviews, getSavedRoomIds } from "@/lib/data/rooms";
import { getCurrentProfile } from "@/lib/data/auth";
import { RoomGallery } from "@/components/rooms/room-gallery";
import { RoomLocationMap } from "@/components/rooms/room-location-map";
import { BookingWidget } from "@/components/rooms/booking-widget";
import { ReviewForm } from "@/components/rooms/review-form";
import { SaveRoomButton } from "@/components/rooms/save-room-button";
import { MessageButton } from "@/components/message-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { amenityLabel } from "@/lib/constants";
import { initials } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const room = await getRoomBySlug(slug);
  return { title: room?.name ?? "Room" };
}

export default async function RoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const room = await getRoomBySlug(slug);
  if (!room) notFound();

  const profile = await getCurrentProfile();
  const [reviews, savedIds] = await Promise.all([
    getRoomReviews(room.id),
    profile ? getSavedRoomIds(profile.id) : Promise.resolve(new Set<string>()),
  ]);
  const isOwner = profile?.id === room.owner_id;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {room.name}
          </h1>
          <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-3 text-sm">
            {room.rating != null && (
              <span className="text-foreground flex items-center gap-1">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                {room.rating}
                <span className="text-muted-foreground">
                  ({room.review_count} reviews)
                </span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <MapPin className="size-4" /> {room.neighborhood}, {room.city}
            </span>
            {room.capacity != null && (
              <span className="flex items-center gap-1">
                <Users className="size-4" /> Up to {room.capacity}
              </span>
            )}
          </div>
        </div>
        {profile && !isOwner && (
          <SaveRoomButton
            roomId={room.id}
            initialSaved={savedIds.has(room.id)}
            className="bg-secondary text-secondary-foreground"
          />
        )}
      </div>

      <RoomGallery photos={room.photos} name={room.name} />

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left: details */}
        <div className="space-y-8">
          {room.owner && (
            <div className="flex items-center gap-3 border-b pb-6">
              <Avatar className="size-11 border">
                <AvatarImage src={room.owner.avatar_url ?? undefined} />
                <AvatarFallback>{initials(room.owner.full_name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-muted-foreground text-xs">Hosted by</p>
                <Link
                  href={`/musicians/${room.owner.username}`}
                  className="font-medium hover:underline"
                >
                  {room.owner.full_name ?? room.owner.username}
                </Link>
              </div>
            </div>
          )}

          {room.description && (
            <section>
              <h2 className="mb-2 text-lg font-semibold">About this space</h2>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {room.description}
              </p>
            </section>
          )}

          {room.amenities.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Gear & amenities</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {room.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-sm">
                    <span className="text-primary grid size-7 place-items-center rounded-md border">
                      <Check className="size-4" />
                    </span>
                    {amenityLabel(a)}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-lg font-semibold">Where you'll play</h2>
            {room.address && (
              <p className="text-muted-foreground mb-3 text-sm">{room.address}</p>
            )}
            <RoomLocationMap latitude={room.latitude} longitude={room.longitude} />
          </section>

          {/* Reviews */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">
              Reviews{" "}
              <span className="text-muted-foreground font-normal">
                ({room.review_count})
              </span>
            </h2>
            {reviews.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {reviews.map((r) => {
                  const author = (r as { author?: { full_name: string | null; avatar_url: string | null; username: string } }).author;
                  return (
                    <div key={r.id} className="bg-card rounded-xl border p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Avatar className="size-8">
                          <AvatarImage src={author?.avatar_url ?? undefined} />
                          <AvatarFallback className="text-xs">
                            {initials(author?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm font-medium">
                          {author?.full_name ?? author?.username}
                        </div>
                        <div className="ml-auto flex">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm">{r.comment}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No reviews yet — be the first to play here.
              </p>
            )}
            {profile && !isOwner && <ReviewForm roomId={room.id} />}
          </section>
        </div>

        {/* Right: booking */}
        <div className="lg:sticky lg:top-20 lg:h-fit">
          <div className="bg-card rounded-2xl border p-5 shadow-sm">
            {isOwner ? (
              <div className="space-y-3 text-center">
                <p className="text-muted-foreground text-sm">
                  This is your room.
                </p>
                <Link
                  href="/bookings"
                  className="text-primary text-sm font-medium hover:underline"
                >
                  View booking requests →
                </Link>
              </div>
            ) : profile ? (
              <>
                <BookingWidget
                  roomId={room.id}
                  hourlyPrice={room.hourly_price}
                  currency={room.currency}
                />
                {room.owner && (
                  <div className="mt-3 border-t pt-3">
                    <MessageButton targetId={room.owner.id} label="Message owner" />
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-3 text-center">
                <p className="text-muted-foreground text-sm">
                  Sign in to book this room.
                </p>
                <Link
                  href={`/sign-in?next=/rooms/${slug}`}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  Sign in →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
