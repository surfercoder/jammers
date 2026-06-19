import { screen } from "@testing-library/react";
import { renderAsync } from "@test/render";
import type {
  BookingWithRelations,
  ContractWithRelations,
  RoomWithMeta,
} from "@/lib/types";

jest.mock("@/lib/data/auth", () => ({ requireProfile: jest.fn() }));
jest.mock("@/lib/data/requests", () => ({
  getIncomingBookings: jest.fn(),
  getOutgoingBookings: jest.fn(),
  getIncomingContracts: jest.fn(),
  getOutgoingContracts: jest.fn(),
}));
jest.mock("@/lib/data/rooms", () => ({ getMyRooms: jest.fn() }));

import { requireProfile } from "@/lib/data/auth";
import {
  getIncomingBookings,
  getOutgoingBookings,
  getIncomingContracts,
  getOutgoingContracts,
} from "@/lib/data/requests";
import { getMyRooms } from "@/lib/data/rooms";
import DashboardPage from "./page";

const requireProfileMock = requireProfile as jest.MockedFunction<
  typeof requireProfile
>;
const incomingBMock = getIncomingBookings as jest.MockedFunction<
  typeof getIncomingBookings
>;
const outgoingBMock = getOutgoingBookings as jest.MockedFunction<
  typeof getOutgoingBookings
>;
const incomingCMock = getIncomingContracts as jest.MockedFunction<
  typeof getIncomingContracts
>;
const outgoingCMock = getOutgoingContracts as jest.MockedFunction<
  typeof getOutgoingContracts
>;
const roomsMock = getMyRooms as jest.MockedFunction<typeof getMyRooms>;

const booking = (overrides: Partial<BookingWithRelations> = {}) =>
  ({
    id: "b1",
    status: "pending",
    room: { name: "Studio X" },
    requester: { full_name: "Ada Lovelace" },
    ...overrides,
  }) as unknown as BookingWithRelations;

const contract = (overrides: Partial<ContractWithRelations> = {}) =>
  ({
    id: "c1",
    title: "Jazz night",
    status: "pending",
    requester: { full_name: "Bob Marley" },
    ...overrides,
  }) as unknown as ContractWithRelations;

const room = (id: string) => ({ id }) as unknown as RoomWithMeta;

beforeEach(() => {
  jest.clearAllMocks();
});

it("renders empty panels and the username greeting fallback", async () => {
  requireProfileMock.mockResolvedValue({
    id: "u1",
    full_name: null,
    username: "jammer",
  } as never);
  incomingBMock.mockResolvedValue([]);
  outgoingBMock.mockResolvedValue([]);
  incomingCMock.mockResolvedValue([]);
  outgoingCMock.mockResolvedValue([]);
  roomsMock.mockResolvedValue([]);

  await renderAsync(DashboardPage());

  expect(screen.getByText(/Hey jammer/)).toBeInTheDocument();
  expect(screen.getByText("No bookings yet.")).toBeInTheDocument();
  expect(screen.getByText("No offers yet.")).toBeInTheDocument();
});

it("renders populated panels, stats and the first-name greeting", async () => {
  requireProfileMock.mockResolvedValue({
    id: "u1",
    full_name: "Grace Hopper",
    username: "grace",
  } as never);
  incomingBMock.mockResolvedValue([
    booking({
      id: "b1",
      status: "pending",
      room: { name: "Studio X" } as never,
    }),
    booking({
      id: "b2",
      status: "accepted",
      room: { name: "Studio Y" } as never,
      requester: { full_name: "Carl Sagan" } as never,
    }),
  ]);
  outgoingBMock.mockResolvedValue([booking({ id: "b3" })]);
  incomingCMock.mockResolvedValue([
    contract({ id: "c1", status: "pending" }),
  ]);
  outgoingCMock.mockResolvedValue([contract({ id: "c2" })]);
  roomsMock.mockResolvedValue([room("r1"), room("r2")]);

  await renderAsync(DashboardPage());

  expect(screen.getByText(/Hey Grace/)).toBeInTheDocument();
  expect(screen.getByText("Studio X")).toBeInTheDocument();
  expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
  expect(screen.getByText("Jazz night")).toBeInTheDocument();
  expect(screen.getByText("Bob Marley")).toBeInTheDocument();
});

it("renders rows without a subtitle when names are missing", async () => {
  requireProfileMock.mockResolvedValue({
    id: "u1",
    full_name: "Grace Hopper",
    username: "grace",
  } as never);
  incomingBMock.mockResolvedValue([
    booking({ id: "b1", room: null as never, requester: null as never }),
  ]);
  outgoingBMock.mockResolvedValue([]);
  incomingCMock.mockResolvedValue([
    contract({ id: "c1", requester: null as never }),
  ]);
  outgoingCMock.mockResolvedValue([]);
  roomsMock.mockResolvedValue([]);

  await renderAsync(DashboardPage());

  // Room name falls back to "Room" when room is null.
  expect(screen.getByText("Room")).toBeInTheDocument();
});
