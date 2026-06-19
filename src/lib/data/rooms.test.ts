import { createSupabaseMock, createQuery, type QueryMock } from "@test/supabase";

jest.mock("@/utils/supabase/server", () => ({ createClient: jest.fn() }));
import { createClient } from "@/utils/supabase/server";
import {
  getRooms,
  getRoomBySlug,
  getRoomReviews,
  getMyRooms,
  getSavedRoomIds,
} from "./rooms";

const mockedCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

function useQuery(query: QueryMock) {
  mockedCreateClient.mockResolvedValue(
    createSupabaseMock({ from: () => query }) as never
  );
  return query;
}

const owner = { id: "o1", username: "owner", full_name: "Owner", avatar_url: null };

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getRooms", () => {
  it("maps rows with averaged ratings (reviews present)", async () => {
    const rows = [
      { id: "r1", owner, room_reviews: [{ rating: 4 }, { rating: 5 }] },
    ];
    useQuery(createQuery({ data: rows, error: null }));
    const result = await getRooms();
    expect(result[0].rating).toBe(4.5);
    expect(result[0].review_count).toBe(2);
    expect("room_reviews" in result[0]).toBe(false);
    expect(result[0].owner).toEqual(owner);
  });

  it("handles rows with null reviews (?? [] fallback → null rating)", async () => {
    const rows = [{ id: "r2", owner, room_reviews: null }];
    useQuery(createQuery({ data: rows, error: null }));
    const result = await getRooms();
    expect(result[0].rating).toBeNull();
    expect(result[0].review_count).toBe(0);
  });

  it("applies every filter branch", async () => {
    const query = useQuery(createQuery({ data: [], error: null }));
    await getRooms({
      q: "studio",
      neighborhoods: ["Palermo"],
      amenities: ["wifi"],
      priceMax: 5000,
      capacityMin: 4,
    });
    expect(query.or).toHaveBeenCalledWith(
      "name.ilike.%studio%,neighborhood.ilike.%studio%,description.ilike.%studio%"
    );
    expect(query.in).toHaveBeenCalledWith("neighborhood", ["Palermo"]);
    expect(query.contains).toHaveBeenCalledWith("amenities", ["wifi"]);
    expect(query.lte).toHaveBeenCalledWith("hourly_price", 5000);
    expect(query.gte).toHaveBeenCalledWith("capacity", 4);
  });

  it("skips filters that are empty/null", async () => {
    const query = useQuery(createQuery({ data: [], error: null }));
    await getRooms({ neighborhoods: [], amenities: [] });
    expect(query.or).not.toHaveBeenCalled();
    expect(query.in).not.toHaveBeenCalled();
    expect(query.contains).not.toHaveBeenCalled();
    expect(query.lte).not.toHaveBeenCalled();
    expect(query.gte).not.toHaveBeenCalled();
  });

  it("throws when the query returns an error", async () => {
    useQuery(createQuery({ data: null, error: { message: "boom" } }));
    await expect(getRooms()).rejects.toEqual({ message: "boom" });
  });
});

describe("getRoomBySlug", () => {
  it("returns a mapped room when found", async () => {
    const row = { id: "r1", owner, room_reviews: [{ rating: 3 }] };
    useQuery(createQuery({ data: row, error: null }));
    const result = await getRoomBySlug("slug");
    expect(result?.rating).toBe(3);
    expect(result?.review_count).toBe(1);
  });

  it("returns null when not found", async () => {
    useQuery(createQuery({ data: null, error: null }));
    await expect(getRoomBySlug("nope")).resolves.toBeNull();
  });
});

describe("getRoomReviews", () => {
  it("returns the reviews", async () => {
    const data = [{ id: "rev1" }];
    useQuery(createQuery({ data, error: null }));
    await expect(getRoomReviews("r1")).resolves.toEqual(data);
  });

  it("returns [] when data is null (?? fallback)", async () => {
    useQuery(createQuery({ data: null, error: null }));
    await expect(getRoomReviews("r1")).resolves.toEqual([]);
  });
});

describe("getMyRooms", () => {
  it("maps owned rooms with ratings", async () => {
    const rows = [{ id: "r1", owner, room_reviews: [{ rating: 5 }] }];
    useQuery(createQuery({ data: rows, error: null }));
    const result = await getMyRooms("o1");
    expect(result[0].rating).toBe(5);
  });

  it("returns [] when data is null (?? fallback)", async () => {
    useQuery(createQuery({ data: null, error: null }));
    await expect(getMyRooms("o1")).resolves.toEqual([]);
  });
});

describe("getSavedRoomIds", () => {
  it("returns a Set of saved room ids", async () => {
    useQuery(
      createQuery({
        data: [{ room_id: "r1" }, { room_id: "r2" }],
        error: null,
      })
    );
    const result = await getSavedRoomIds("p1");
    expect(result).toEqual(new Set(["r1", "r2"]));
  });

  it("returns an empty Set when data is null (?? fallback)", async () => {
    useQuery(createQuery({ data: null, error: null }));
    await expect(getSavedRoomIds("p1")).resolves.toEqual(new Set());
  });
});
