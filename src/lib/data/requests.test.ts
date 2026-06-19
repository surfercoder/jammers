import { createSupabaseMock, createQuery, type QueryMock } from "@test/supabase";

jest.mock("@/utils/supabase/server", () => ({ createClient: jest.fn() }));
import { createClient } from "@/utils/supabase/server";
import {
  getOutgoingBookings,
  getIncomingBookings,
  getOutgoingContracts,
  getIncomingContracts,
} from "./requests";

const mockedCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

function useFrom(from: (table: string) => QueryMock) {
  mockedCreateClient.mockResolvedValue(createSupabaseMock({ from }) as never);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getOutgoingBookings", () => {
  it("returns the bookings", async () => {
    const data = [{ id: "b1" }];
    useFrom(() => createQuery({ data, error: null }));
    await expect(getOutgoingBookings("u1")).resolves.toEqual(data);
  });

  it("returns [] when data is null (?? fallback)", async () => {
    useFrom(() => createQuery({ data: null, error: null }));
    await expect(getOutgoingBookings("u1")).resolves.toEqual([]);
  });
});

describe("getIncomingBookings", () => {
  it("returns [] when the user owns no rooms (early return)", async () => {
    useFrom((table) => {
      if (table === "rehearsal_rooms") {
        return createQuery({ data: [], error: null });
      }
      return createQuery({ data: null, error: null });
    });
    await expect(getIncomingBookings("u1")).resolves.toEqual([]);
  });

  it("returns [] when room rows are null (?? [] then early return)", async () => {
    useFrom((table) => {
      if (table === "rehearsal_rooms") {
        return createQuery({ data: null, error: null });
      }
      return createQuery({ data: null, error: null });
    });
    await expect(getIncomingBookings("u1")).resolves.toEqual([]);
  });

  it("returns bookings for owned rooms", async () => {
    const bookings = [{ id: "b1" }];
    useFrom((table) => {
      if (table === "rehearsal_rooms") {
        return createQuery({ data: [{ id: "r1" }, { id: "r2" }], error: null });
      }
      if (table === "room_bookings") {
        return createQuery({ data: bookings, error: null });
      }
      return createQuery({ data: null, error: null });
    });
    await expect(getIncomingBookings("u1")).resolves.toEqual(bookings);
  });

  it("returns [] when bookings data is null (?? fallback)", async () => {
    useFrom((table) => {
      if (table === "rehearsal_rooms") {
        return createQuery({ data: [{ id: "r1" }], error: null });
      }
      if (table === "room_bookings") {
        return createQuery({ data: null, error: null });
      }
      return createQuery({ data: null, error: null });
    });
    await expect(getIncomingBookings("u1")).resolves.toEqual([]);
  });
});

describe("getOutgoingContracts", () => {
  it("returns the contracts", async () => {
    const data = [{ id: "c1" }];
    useFrom(() => createQuery({ data, error: null }));
    await expect(getOutgoingContracts("u1")).resolves.toEqual(data);
  });

  it("returns [] when data is null (?? fallback)", async () => {
    useFrom(() => createQuery({ data: null, error: null }));
    await expect(getOutgoingContracts("u1")).resolves.toEqual([]);
  });
});

describe("getIncomingContracts", () => {
  it("returns the contracts", async () => {
    const data = [{ id: "c2" }];
    useFrom(() => createQuery({ data, error: null }));
    await expect(getIncomingContracts("u1")).resolves.toEqual(data);
  });

  it("returns [] when data is null (?? fallback)", async () => {
    useFrom(() => createQuery({ data: null, error: null }));
    await expect(getIncomingContracts("u1")).resolves.toEqual([]);
  });
});
