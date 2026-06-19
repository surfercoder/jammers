import { createSupabaseMock, createQuery } from "@test/supabase";

jest.mock("@/utils/supabase/server", () => ({ createClient: jest.fn() }));
import { createClient } from "@/utils/supabase/server";
import { getCurrentProfile, requireProfile } from "./auth";

const mockedCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getCurrentProfile", () => {
  it("returns null when there is no authenticated user", async () => {
    mockedCreateClient.mockResolvedValue(
      createSupabaseMock({ user: null }) as never
    );
    await expect(getCurrentProfile()).resolves.toBeNull();
  });

  it("returns the joined profile row for the current user", async () => {
    const profile = { id: "u-profile", username: "ada" };
    mockedCreateClient.mockResolvedValue(
      createSupabaseMock({
        user: { id: "u-profile" },
        from: () => createQuery({ data: profile, error: null }),
      }) as never
    );
    await expect(getCurrentProfile()).resolves.toEqual(profile);
  });
});

describe("requireProfile", () => {
  it("returns the profile when present", async () => {
    const profile = { id: "u-req", username: "grace" };
    mockedCreateClient.mockResolvedValue(
      createSupabaseMock({
        user: { id: "u-req" },
        from: () => createQuery({ data: profile, error: null }),
      }) as never
    );
    await expect(requireProfile()).resolves.toEqual(profile);
  });

  it("redirects to /sign-in when there is no profile", async () => {
    mockedCreateClient.mockResolvedValue(
      createSupabaseMock({
        user: { id: "u-none" },
        from: () => createQuery({ data: null, error: null }),
      }) as never
    );
    await expect(requireProfile()).rejects.toThrow("NEXT_REDIRECT:/sign-in");
  });
});
