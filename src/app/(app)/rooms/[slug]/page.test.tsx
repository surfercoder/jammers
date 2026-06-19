import { screen } from "@testing-library/react";
import { renderAsync } from "@test/render";
import type { Profile, RoomWithMeta } from "@/lib/types";

jest.mock("@/lib/data/rooms", () => ({
  getRoomBySlug: jest.fn(),
  getRoomReviews: jest.fn(),
  getSavedRoomIds: jest.fn(),
}));
jest.mock("@/lib/data/auth", () => ({ getCurrentProfile: jest.fn() }));

import {
  getRoomBySlug,
  getRoomReviews,
  getSavedRoomIds,
} from "@/lib/data/rooms";
import { getCurrentProfile } from "@/lib/data/auth";
import RoomPage, { generateMetadata } from "./page";

const bySlugMock = getRoomBySlug as jest.MockedFunction<typeof getRoomBySlug>;
const reviewsMock = getRoomReviews as jest.MockedFunction<
  typeof getRoomReviews
>;
const savedMock = getSavedRoomIds as jest.MockedFunction<
  typeof getSavedRoomIds
>;
const profileMock = getCurrentProfile as jest.MockedFunction<
  typeof getCurrentProfile
>;

const room = (overrides: Partial<RoomWithMeta> = {}): RoomWithMeta =>
  ({
    id: "r1",
    slug: "studio-x",
    name: "Studio X",
    owner_id: "owner1",
    rating: 4.8,
    review_count: 2,
    neighborhood: "Palermo",
    city: "Buenos Aires",
    capacity: 6,
    description: "A nice place.",
    amenities: ["pa_system"],
    address: "123 Main St",
    latitude: -34.6,
    longitude: -58.4,
    photos: ["https://img.test/a.jpg"],
    hourly_price: 5000,
    currency: "ARS",
    owner: {
      id: "owner1",
      username: "owner",
      full_name: "Owner Name",
      avatar_url: null,
    },
    ...overrides,
  }) as unknown as RoomWithMeta;

type ReviewRow = Awaited<ReturnType<typeof getRoomReviews>>[number];

const review = (overrides: Record<string, unknown> = {}): ReviewRow =>
  ({
    id: "rev1",
    rating: 5,
    comment: "Great spot!",
    author: {
      full_name: "Reviewer One",
      avatar_url: null,
      username: "reviewer",
    },
    ...overrides,
  }) as unknown as ReviewRow;

beforeEach(() => {
  jest.clearAllMocks();
});

it("notFound throws when the room is missing", async () => {
  bySlugMock.mockResolvedValue(null);
  await expect(
    renderAsync(RoomPage({ params: Promise.resolve({ slug: "ghost" }) }))
  ).rejects.toThrow("NEXT_NOT_FOUND");
});

it("renders the full room for a signed-out viewer (sign-in CTA, reviews present)", async () => {
  bySlugMock.mockResolvedValue(room());
  profileMock.mockResolvedValue(null);
  reviewsMock.mockResolvedValue([review()]);

  await renderAsync(RoomPage({ params: Promise.resolve({ slug: "studio-x" }) }));

  expect(
    screen.getByRole("heading", { name: "Studio X" })
  ).toBeInTheDocument();
  expect(screen.getByText("4.8")).toBeInTheDocument();
  expect(screen.getByText(/Up to 6/)).toBeInTheDocument();
  expect(screen.getByText("About this space")).toBeInTheDocument();
  expect(screen.getByText("Gear & amenities")).toBeInTheDocument();
  expect(screen.getByText("123 Main St")).toBeInTheDocument();
  expect(screen.getByText("Reviewer One")).toBeInTheDocument();
  expect(screen.getByText("Great spot!")).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /sign in/i })
  ).toBeInTheDocument();
  // savedIds resolved as empty set; getSavedRoomIds not called for signed-out.
  expect(savedMock).not.toHaveBeenCalled();
});

it("renders for the room owner (owner panel, no save button, no review form)", async () => {
  bySlugMock.mockResolvedValue(room());
  profileMock.mockResolvedValue({ id: "owner1" } as unknown as Profile);
  reviewsMock.mockResolvedValue([]);
  savedMock.mockResolvedValue(new Set<string>());

  await renderAsync(RoomPage({ params: Promise.resolve({ slug: "studio-x" }) }));

  expect(screen.getByText("This is your room.")).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /view booking requests/i })
  ).toBeInTheDocument();
  // No reviews -> empty state branch.
  expect(
    screen.getByText(/be the first to play here/i)
  ).toBeInTheDocument();
});

it("renders for a signed-in non-owner (booking widget, save button, message owner, review form)", async () => {
  bySlugMock.mockResolvedValue(room());
  profileMock.mockResolvedValue({ id: "guest1" } as unknown as Profile);
  reviewsMock.mockResolvedValue([]);
  savedMock.mockResolvedValue(new Set<string>(["r1"]));

  await renderAsync(RoomPage({ params: Promise.resolve({ slug: "studio-x" }) }));

  // SaveRoomButton renders for a signed-in non-owner.
  expect(savedMock).toHaveBeenCalledWith("guest1");
  expect(screen.getByText("Studio X")).toBeInTheDocument();
});

it("covers all the falsy branches: no rating/capacity/description/amenities/address/owner + review fallback", async () => {
  bySlugMock.mockResolvedValue(
    room({
      rating: null,
      capacity: null,
      description: null,
      amenities: [],
      address: null,
      owner: null as unknown as RoomWithMeta["owner"],
    })
  );
  profileMock.mockResolvedValue(null);
  // Review whose author has no full_name -> username fallback.
  reviewsMock.mockResolvedValue([
    review({
      author: {
        full_name: null,
        avatar_url: null,
        username: "anon",
      },
    }),
  ]);

  await renderAsync(RoomPage({ params: Promise.resolve({ slug: "studio-x" }) }));

  expect(screen.queryByText("4.8")).not.toBeInTheDocument();
  expect(screen.queryByText("About this space")).not.toBeInTheDocument();
  expect(screen.queryByText("Gear & amenities")).not.toBeInTheDocument();
  expect(screen.queryByText("123 Main St")).not.toBeInTheDocument();
  expect(screen.queryByText("Hosted by")).not.toBeInTheDocument();
  // author username fallback.
  expect(screen.getByText("anon")).toBeInTheDocument();
});

it("covers owner full_name fallback to username in the host link", async () => {
  bySlugMock.mockResolvedValue(
    room({
      owner: {
        id: "owner1",
        username: "owner",
        full_name: null,
        avatar_url: null,
      } as unknown as RoomWithMeta["owner"],
    })
  );
  profileMock.mockResolvedValue(null);
  reviewsMock.mockResolvedValue([]);

  await renderAsync(RoomPage({ params: Promise.resolve({ slug: "studio-x" }) }));

  expect(screen.getByRole("link", { name: "owner" })).toBeInTheDocument();
});

describe("generateMetadata", () => {
  it("uses the room name when found", async () => {
    bySlugMock.mockResolvedValue(room());
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "studio-x" }),
    });
    expect(meta.title).toBe("Studio X");
  });

  it("falls back to 'Room' when not found", async () => {
    bySlugMock.mockResolvedValue(null);
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: "ghost" }),
    });
    expect(meta.title).toBe("Room");
  });
});
