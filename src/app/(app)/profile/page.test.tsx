import { screen } from "@testing-library/react";
import { renderAsync } from "@test/render";
import { createSupabaseMock, createQuery } from "@test/supabase";
import type { MusicianProfile, Media } from "@/lib/types";

jest.mock("@/lib/data/auth", () => ({ requireProfile: jest.fn() }));
jest.mock("@/utils/supabase/server", () => ({ createClient: jest.fn() }));

import { requireProfile } from "@/lib/data/auth";
import { createClient } from "@/utils/supabase/server";
import ProfilePage from "./page";

const requireProfileMock = requireProfile as jest.MockedFunction<
  typeof requireProfile
>;
const createClientMock = createClient as jest.MockedFunction<
  typeof createClient
>;

const musician = {
  profile_id: "u1",
  genres: ["jazz"],
  instruments: ["guitar"],
} as unknown as MusicianProfile;

const media: Media[] = [
  { id: "med1", profile_id: "u1", url: "https://youtu.be/abc" } as unknown as Media,
];

function mockSupabase(opts: { musician: unknown; media: unknown }) {
  const client = createSupabaseMock({
    from: (table: string) => {
      if (table === "musician_profiles") {
        return createQuery({ data: opts.musician, error: null });
      }
      return createQuery({ data: opts.media, error: null });
    },
  });
  createClientMock.mockResolvedValue(client as never);
  return client;
}

beforeEach(() => {
  jest.clearAllMocks();
});

it("renders the media manager for a musician account with data", async () => {
  requireProfileMock.mockResolvedValue({
    id: "u1",
    username: "ada",
    account_type: "musician",
  } as never);
  mockSupabase({ musician, media });

  await renderAsync(ProfilePage());

  expect(
    screen.getByRole("heading", { name: "Edit profile" })
  ).toBeInTheDocument();
  // MediaManager renders its own heading when not a room owner.
  expect(screen.getByRole("link", { name: /View public/i })).toHaveAttribute(
    "href",
    "/musicians/ada"
  );
  expect(screen.getByText("Performance videos")).toBeInTheDocument();
});

it("renders for a musician with null data, using the null/empty fallbacks", async () => {
  requireProfileMock.mockResolvedValue({
    id: "u1",
    username: "ada",
    account_type: "musician",
  } as never);
  // null musician -> `?? null`; null media -> `?? []` (MediaManager still renders).
  mockSupabase({ musician: null, media: null });

  await renderAsync(ProfilePage());

  expect(screen.getByText("Performance videos")).toBeInTheDocument();
});

it("hides the media manager for room owners", async () => {
  requireProfileMock.mockResolvedValue({
    id: "u1",
    username: "owner",
    account_type: "room_owner",
  } as never);
  mockSupabase({ musician, media });

  await renderAsync(ProfilePage());

  expect(
    screen.getByRole("heading", { name: "Edit profile" })
  ).toBeInTheDocument();
  expect(screen.queryByText("Performance videos")).not.toBeInTheDocument();
});
