import { createSupabaseMock, createQuery, type QueryMock } from "@test/supabase";

jest.mock("@/utils/supabase/server", () => ({ createClient: jest.fn() }));
import { createClient } from "@/utils/supabase/server";
import { getMusicians, getMusicianByUsername } from "./musicians";

const mockedCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

function useQuery(query: QueryMock) {
  mockedCreateClient.mockResolvedValue(
    createSupabaseMock({ from: () => query }) as never
  );
  return query;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getMusicians", () => {
  it("returns musicians with no filters", async () => {
    const data = [{ id: "p1" }];
    useQuery(createQuery({ data, error: null }));
    await expect(getMusicians()).resolves.toEqual(data);
  });

  it("returns [] when data is null (?? fallback)", async () => {
    useQuery(createQuery({ data: null, error: null }));
    await expect(getMusicians()).resolves.toEqual([]);
  });

  it("applies every filter branch", async () => {
    const query = useQuery(createQuery({ data: [], error: null }));
    await getMusicians({
      q: "rock",
      city: "Buenos Aires",
      genres: ["rock"],
      instruments: ["guitar"],
      availability: ["weekends"],
      experience: "pro",
      openToWork: true,
    });
    expect(query.or).toHaveBeenCalledWith(
      "full_name.ilike.%rock%,username.ilike.%rock%,headline.ilike.%rock%"
    );
    expect(query.ilike).toHaveBeenCalledWith("city", "%Buenos Aires%");
    expect(query.overlaps).toHaveBeenCalledWith("musician_profiles.genres", [
      "rock",
    ]);
    expect(query.overlaps).toHaveBeenCalledWith(
      "musician_profiles.instruments",
      ["guitar"]
    );
    expect(query.overlaps).toHaveBeenCalledWith(
      "musician_profiles.available_for",
      ["weekends"]
    );
    expect(query.eq).toHaveBeenCalledWith(
      "musician_profiles.experience_level",
      "pro"
    );
    expect(query.eq).toHaveBeenCalledWith(
      "musician_profiles.open_to_work",
      true
    );
  });

  it("skips filters that are empty/falsy", async () => {
    const query = useQuery(createQuery({ data: [], error: null }));
    await getMusicians({
      genres: [],
      instruments: [],
      availability: [],
      openToWork: false,
    });
    expect(query.or).not.toHaveBeenCalled();
    expect(query.ilike).not.toHaveBeenCalled();
    expect(query.overlaps).not.toHaveBeenCalled();
    expect(query.eq).not.toHaveBeenCalled();
  });

  it("throws when the query returns an error", async () => {
    useQuery(createQuery({ data: null, error: { message: "boom" } }));
    await expect(getMusicians()).rejects.toEqual({ message: "boom" });
  });
});

describe("getMusicianByUsername", () => {
  it("returns the musician when found", async () => {
    const data = { id: "p1", username: "ada" };
    useQuery(createQuery({ data, error: null }));
    await expect(getMusicianByUsername("ada")).resolves.toEqual(data);
  });

  it("returns null when not found (?? fallback)", async () => {
    useQuery(createQuery({ data: null, error: null }));
    await expect(getMusicianByUsername("nope")).resolves.toBeNull();
  });
});
