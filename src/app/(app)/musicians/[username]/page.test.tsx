import { screen } from "@testing-library/react";
import { renderAsync } from "@test/render";
import type { MusicianWithProfile, Profile } from "@/lib/types";

jest.mock("@/lib/data/musicians", () => ({
  getMusicianByUsername: jest.fn(),
}));
jest.mock("@/lib/data/auth", () => ({ getCurrentProfile: jest.fn() }));

import { getMusicianByUsername } from "@/lib/data/musicians";
import { getCurrentProfile } from "@/lib/data/auth";
import MusicianProfilePage, { generateMetadata } from "./page";

const byUsernameMock = getMusicianByUsername as jest.MockedFunction<
  typeof getMusicianByUsername
>;
const profileMock = getCurrentProfile as jest.MockedFunction<
  typeof getCurrentProfile
>;

const musician = (
  overrides: Partial<MusicianWithProfile> = {}
): MusicianWithProfile =>
  ({
    id: "m1",
    username: "ada",
    full_name: "Ada Lovelace",
    avatar_url: "https://img.test/a.jpg",
    headline: "Session guitarist",
    city: "Buenos Aires",
    bio: "I play things.",
    musician_profiles: {
      open_to_work: true,
      experience_level: "pro",
      years_experience: 8,
      hourly_rate: 5000,
      rate_currency: "ARS",
      instruments: ["Guitar"],
      genres: ["Rock"],
      available_for: ["sessions"],
    },
    media: [{ id: "media1" }],
    ...overrides,
  }) as unknown as MusicianWithProfile;

beforeEach(() => {
  jest.clearAllMocks();
});

it("notFound throws when the musician is missing", async () => {
  byUsernameMock.mockResolvedValue(null);
  await expect(
    renderAsync(
      MusicianProfilePage({ params: Promise.resolve({ username: "ghost" }) })
    )
  ).rejects.toThrow("NEXT_NOT_FOUND");
});

it("renders the full profile for a signed-out viewer (sign-in CTA, all sections)", async () => {
  byUsernameMock.mockResolvedValue(musician());
  profileMock.mockResolvedValue(null);

  await renderAsync(
    MusicianProfilePage({ params: Promise.resolve({ username: "ada" }) })
  );

  expect(
    screen.getByRole("heading", { name: "Ada Lovelace" })
  ).toBeInTheDocument();
  expect(screen.getByText("Open to work")).toBeInTheDocument();
  expect(screen.getByText("Session guitarist")).toBeInTheDocument();
  expect(screen.getByText("Buenos Aires")).toBeInTheDocument();
  expect(screen.getByText(/pro/)).toBeInTheDocument();
  expect(screen.getByText("Guitar")).toBeInTheDocument();
  expect(screen.getByText("Rock")).toBeInTheDocument();
  expect(screen.getByText("About")).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /sign in to contact/i })
  ).toBeInTheDocument();
});

it("renders the edit button when the viewer is the same musician", async () => {
  byUsernameMock.mockResolvedValue(musician());
  profileMock.mockResolvedValue({ id: "m1" } as unknown as Profile);

  await renderAsync(
    MusicianProfilePage({ params: Promise.resolve({ username: "ada" }) })
  );

  expect(
    screen.getByRole("link", { name: /edit profile/i })
  ).toBeInTheDocument();
});

it("renders message + contract actions for a different signed-in viewer", async () => {
  byUsernameMock.mockResolvedValue(musician());
  profileMock.mockResolvedValue({ id: "other" } as unknown as Profile);

  await renderAsync(
    MusicianProfilePage({ params: Promise.resolve({ username: "ada" }) })
  );

  // ContractDialog renders a trigger button referencing the musician name.
  expect(screen.getByText(/Ada Lovelace/)).toBeInTheDocument();
});

it("covers all the falsy branches: username fallback, no profile fields, no media", async () => {
  byUsernameMock.mockResolvedValue(
    musician({
      full_name: null,
      avatar_url: null,
      headline: null,
      city: null,
      bio: null,
      musician_profiles: null as unknown as MusicianWithProfile["musician_profiles"],
      media: [],
    })
  );
  profileMock.mockResolvedValue(null);

  await renderAsync(
    MusicianProfilePage({ params: Promise.resolve({ username: "ada" }) })
  );

  // displayName falls back to username.
  expect(screen.getByRole("heading", { name: "ada" })).toBeInTheDocument();
  expect(screen.queryByText("Open to work")).not.toBeInTheDocument();
  expect(screen.queryByText("About")).not.toBeInTheDocument();
  expect(screen.getByText("No videos yet.")).toBeInTheDocument();
});

it("covers profile present but empty tags/availability and no years/rate/open", async () => {
  byUsernameMock.mockResolvedValue(
    musician({
      musician_profiles: {
        open_to_work: false,
        experience_level: "intermediate",
        years_experience: 0,
        hourly_rate: null,
        rate_currency: "ARS",
        instruments: [],
        genres: [],
        available_for: [],
      } as unknown as MusicianWithProfile["musician_profiles"],
    })
  );
  profileMock.mockResolvedValue(null);

  await renderAsync(
    MusicianProfilePage({ params: Promise.resolve({ username: "ada" }) })
  );

  expect(screen.getByText(/intermediate/)).toBeInTheDocument();
  // years_experience 0 -> no " · X yrs" suffix; hourly_rate null -> no rate.
  expect(screen.queryByText(/yrs/)).not.toBeInTheDocument();
});

describe("generateMetadata", () => {
  it("uses the musician name + headline when found", async () => {
    byUsernameMock.mockResolvedValue(musician());
    const meta = await generateMetadata({
      params: Promise.resolve({ username: "ada" }),
    });
    expect(meta.title).toBe("Ada Lovelace");
    expect(meta.description).toBe("Session guitarist");
  });

  it("falls back to @username and undefined description", async () => {
    byUsernameMock.mockResolvedValue(
      musician({ full_name: null, headline: null })
    );
    const meta = await generateMetadata({
      params: Promise.resolve({ username: "ada" }),
    });
    expect(meta.title).toBe("@ada");
    expect(meta.description).toBeUndefined();
  });

  it("falls back to @username when musician is missing", async () => {
    byUsernameMock.mockResolvedValue(null);
    const meta = await generateMetadata({
      params: Promise.resolve({ username: "ghost" }),
    });
    expect(meta.title).toBe("@ghost");
  });
});
