import type { Tables } from "@/lib/database.types";

export type Profile = Tables<"profiles">;
export type MusicianProfile = Tables<"musician_profiles">;
export type Media = Tables<"media">;
export type Room = Tables<"rehearsal_rooms">;
export type Booking = Tables<"room_bookings">;
export type Review = Tables<"room_reviews">;
export type Contract = Tables<"contracts">;
export type Conversation = Tables<"conversations">;
export type Message = Tables<"messages">;

/** Room joined with its owner profile + aggregated rating. */
export type RoomWithMeta = Room & {
  owner: Pick<Profile, "id" | "username" | "full_name" | "avatar_url"> | null;
  rating: number | null;
  review_count: number;
};

/** Musician directory/profile shape: profile + musician extension + media. */
export type MusicianWithProfile = Profile & {
  musician_profiles: MusicianProfile | null;
  media: Media[];
};

export type BookingWithRelations = Booking & {
  room: Pick<Room, "id" | "name" | "slug" | "photos" | "neighborhood"> | null;
  requester: Pick<Profile, "id" | "username" | "full_name" | "avatar_url"> | null;
};

export type ContractWithRelations = Contract & {
  requester: Pick<Profile, "id" | "username" | "full_name" | "avatar_url"> | null;
  musician: Pick<Profile, "id" | "username" | "full_name" | "avatar_url"> | null;
};

export type ConversationSummary = Conversation & {
  participants: Pick<Profile, "id" | "username" | "full_name" | "avatar_url">[];
  last_message: Message | null;
};
