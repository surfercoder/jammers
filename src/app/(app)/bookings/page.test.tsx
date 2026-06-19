import { screen } from "@testing-library/react";
import { renderAsync, userEvent } from "@test/render";
import type { BookingWithRelations } from "@/lib/types";

jest.mock("@/lib/data/auth", () => ({ requireProfile: jest.fn() }));
jest.mock("@/lib/data/requests", () => ({
  getIncomingBookings: jest.fn(),
  getOutgoingBookings: jest.fn(),
}));

import { requireProfile } from "@/lib/data/auth";
import { getIncomingBookings, getOutgoingBookings } from "@/lib/data/requests";
import BookingsPage from "./page";

const requireProfileMock = requireProfile as jest.MockedFunction<
  typeof requireProfile
>;
const incomingMock = getIncomingBookings as jest.MockedFunction<
  typeof getIncomingBookings
>;
const outgoingMock = getOutgoingBookings as jest.MockedFunction<
  typeof getOutgoingBookings
>;

const booking = (overrides: Partial<BookingWithRelations> = {}) =>
  ({
    id: "b1",
    status: "pending",
    total_price: 12000,
    start_time: "2026-07-01T18:00:00.000Z",
    end_time: "2026-07-01T20:00:00.000Z",
    room: {
      slug: "studio-x",
      name: "Studio X",
      neighborhood: "Palermo",
      photos: ["https://img.test/a.jpg"],
    },
    requester: {
      full_name: "Ada Lovelace",
      username: "ada",
      avatar_url: null,
    },
    ...overrides,
  }) as unknown as BookingWithRelations;

beforeEach(() => {
  jest.clearAllMocks();
  requireProfileMock.mockResolvedValue({ id: "u1" } as never);
});

it("renders empty states when there are no bookings", async () => {
  incomingMock.mockResolvedValue([]);
  outgoingMock.mockResolvedValue([]);

  await renderAsync(BookingsPage());

  expect(
    screen.getByText(/haven't requested any rooms yet/i)
  ).toBeInTheDocument();
});

it("renders the outgoing booking item with details", async () => {
  outgoingMock.mockResolvedValue([booking({ id: "out1" })]);
  incomingMock.mockResolvedValue([]);

  await renderAsync(BookingsPage());

  expect(screen.getByRole("heading", { name: "Bookings" })).toBeInTheDocument();
  expect(screen.getByText("Studio X")).toBeInTheDocument();
});

it("renders incoming items, including the username fallback and no-requester case", async () => {
  outgoingMock.mockResolvedValue([]);
  incomingMock.mockResolvedValue([
    booking({
      id: "in1",
      room: { ...booking().room, photos: [] } as never,
      // full_name null exercises the `?? username` fallback.
      requester: { full_name: null, username: "ada", avatar_url: null } as never,
    }),
    // No requester exercises the `&& booking.requester` false branch.
    booking({ id: "in2", requester: null as never }),
  ]);

  await renderAsync(BookingsPage());
  await userEvent.click(screen.getByRole("tab", { name: /for my rooms/i }));

  expect(screen.getByText("ada")).toBeInTheDocument();
});
