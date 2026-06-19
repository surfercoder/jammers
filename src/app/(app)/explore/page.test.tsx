import { screen } from "@testing-library/react";
import { renderAsync } from "@test/render";
import type { RoomWithMeta } from "@/lib/types";

jest.mock("@/lib/data/auth", () => ({ getCurrentProfile: jest.fn() }));
jest.mock("@/lib/data/rooms", () => ({
  getRooms: jest.fn(),
  getSavedRoomIds: jest.fn(),
}));

import { getCurrentProfile } from "@/lib/data/auth";
import { getRooms, getSavedRoomIds } from "@/lib/data/rooms";
import ExplorePage from "./page";

const getCurrentProfileMock = getCurrentProfile as jest.MockedFunction<
  typeof getCurrentProfile
>;
const getRoomsMock = getRooms as jest.MockedFunction<typeof getRooms>;
const getSavedRoomIdsMock = getSavedRoomIds as jest.MockedFunction<
  typeof getSavedRoomIds
>;

const room = (overrides: Partial<RoomWithMeta> = {}) =>
  ({
    id: "r1",
    slug: "studio-x",
    name: "Studio X",
    neighborhood: "Palermo",
    photos: ["https://img.test/a.jpg"],
    amenities: ["wifi"],
    hourly_price: 5000,
    currency: "ARS",
    rating: null,
    review_count: 0,
    capacity: null,
    ...overrides,
  }) as unknown as RoomWithMeta;

beforeEach(() => {
  jest.clearAllMocks();
});

it("renders rooms for a signed-in profile with saved ids and parsed filters", async () => {
  getCurrentProfileMock.mockResolvedValue({ id: "u1" } as never);
  getRoomsMock.mockResolvedValue([room()]);
  getSavedRoomIdsMock.mockResolvedValue(new Set(["r1"]));

  await renderAsync(
    ExplorePage({
      // hood as array, amenity as string exercise both toArray branches;
      // q and priceMax present exercise the truthy filter branches.
      searchParams: Promise.resolve({
        q: "drums",
        hood: ["Palermo", "Recoleta"],
        amenity: "wifi",
        priceMax: "8000",
      }),
    })
  );

  expect(screen.getByText("Studio X")).toBeInTheDocument();
  expect(getSavedRoomIdsMock).toHaveBeenCalledWith("u1");
  expect(getRoomsMock).toHaveBeenCalledWith({
    q: "drums",
    neighborhoods: ["Palermo", "Recoleta"],
    amenities: ["wifi"],
    priceMax: 8000,
  });
});

it("renders with no profile and empty/undefined filters", async () => {
  getCurrentProfileMock.mockResolvedValue(null);
  getRoomsMock.mockResolvedValue([]);

  await renderAsync(
    ExplorePage({
      // q not a string, no hood/amenity/priceMax exercise the falsy branches.
      searchParams: Promise.resolve({ q: ["x"] }),
    })
  );

  expect(getSavedRoomIdsMock).not.toHaveBeenCalled();
  expect(getRoomsMock).toHaveBeenCalledWith({
    q: undefined,
    neighborhoods: [],
    amenities: [],
    priceMax: undefined,
  });
});
