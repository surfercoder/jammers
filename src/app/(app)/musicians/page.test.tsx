import { screen } from "@testing-library/react";
import { renderAsync } from "@test/render";
import type { MusicianWithProfile } from "@/lib/types";

jest.mock("@/lib/data/musicians", () => ({ getMusicians: jest.fn() }));

import { getMusicians } from "@/lib/data/musicians";
import MusiciansPage from "./page";

const getMusiciansMock = getMusicians as jest.MockedFunction<
  typeof getMusicians
>;

const musician = (id: string): MusicianWithProfile =>
  ({
    id,
    username: `user-${id}`,
    full_name: `User ${id}`,
    avatar_url: null,
    headline: null,
    city: null,
    musician_profiles: {
      open_to_work: false,
      experience_level: "pro",
      hourly_rate: null,
      rate_currency: "ARS",
      instruments: [],
      genres: [],
      available_for: [],
    },
  }) as unknown as MusicianWithProfile;

beforeEach(() => {
  jest.clearAllMocks();
});

it("renders the empty state and a singular count of 0 when no musicians match", async () => {
  getMusiciansMock.mockResolvedValue([]);

  await renderAsync(MusiciansPage({ searchParams: Promise.resolve({}) }));

  expect(
    screen.getByText("No musicians match your filters")
  ).toBeInTheDocument();
  expect(screen.getByText(/0 musicians/)).toBeInTheDocument();
  expect(getMusiciansMock).toHaveBeenCalledWith({
    q: undefined,
    genres: [],
    instruments: [],
    availability: [],
    experience: undefined,
    openToWork: false,
  });
});

it("renders a single musician (singular label) and parses all searchParams variants", async () => {
  getMusiciansMock.mockResolvedValue([musician("a")]);

  await renderAsync(
    MusiciansPage({
      searchParams: Promise.resolve({
        q: "ada",
        genre: ["rock", "jazz"],
        instrument: "guitar",
        avail: "sessions",
        exp: "pro",
        open: "1",
      }),
    })
  );

  expect(screen.getByText("1 musician")).toBeInTheDocument();
  expect(getMusiciansMock).toHaveBeenCalledWith({
    q: "ada",
    genres: ["rock", "jazz"],
    instruments: ["guitar"],
    availability: ["sessions"],
    experience: "pro",
    openToWork: true,
  });
});

it("renders a grid (plural label) and handles non-string q/exp + open !== '1'", async () => {
  getMusiciansMock.mockResolvedValue([musician("a"), musician("b")]);

  await renderAsync(
    MusiciansPage({
      searchParams: Promise.resolve({
        q: ["x", "y"],
        exp: ["a", "b"],
        open: "0",
      }),
    })
  );

  expect(screen.getByText("2 musicians")).toBeInTheDocument();
  expect(getMusiciansMock).toHaveBeenCalledWith({
    q: undefined,
    genres: [],
    instruments: [],
    availability: [],
    experience: undefined,
    openToWork: false,
  });
});
