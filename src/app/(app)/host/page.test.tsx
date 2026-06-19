import { screen } from "@testing-library/react";
import { renderAsync } from "@test/render";
import type { RoomWithMeta } from "@/lib/types";

jest.mock("@/lib/data/auth", () => ({ requireProfile: jest.fn() }));
jest.mock("@/lib/data/rooms", () => ({ getMyRooms: jest.fn() }));

import { requireProfile } from "@/lib/data/auth";
import { getMyRooms } from "@/lib/data/rooms";
import HostPage from "./page";

const requireProfileMock = requireProfile as jest.MockedFunction<
  typeof requireProfile
>;
const getMyRoomsMock = getMyRooms as jest.MockedFunction<typeof getMyRooms>;

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
  requireProfileMock.mockResolvedValue({ id: "u1" } as never);
});

it("renders the empty state when there are no rooms", async () => {
  getMyRoomsMock.mockResolvedValue([]);

  await renderAsync(HostPage());

  expect(screen.getByText("No rooms yet")).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /List your first room/i })
  ).toBeInTheDocument();
});

it("renders the room grid when rooms exist", async () => {
  getMyRoomsMock.mockResolvedValue([room()]);

  await renderAsync(HostPage());

  expect(
    screen.getByRole("heading", { name: "Your rooms" })
  ).toBeInTheDocument();
  expect(screen.getByText("Studio X")).toBeInTheDocument();
});
