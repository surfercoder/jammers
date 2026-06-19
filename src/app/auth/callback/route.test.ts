import "@test/web-globals";
import { NextRequest } from "next/server";
import { createSupabaseMock, type SupabaseMock } from "@test/supabase";

jest.mock("@/utils/supabase/server", () => ({ createClient: jest.fn() }));
import { createClient } from "@/utils/supabase/server";
import { GET } from "./route";

const mockedCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

let supabase: SupabaseMock;

function useClient(mock: SupabaseMock) {
  supabase = mock;
  mockedCreateClient.mockResolvedValue(mock as never);
}

beforeEach(() => {
  jest.clearAllMocks();
  useClient(createSupabaseMock({ user: { id: "u1" } }));
});

describe("GET /auth/callback", () => {
  it("exchanges the code and redirects to a safe next path", async () => {
    const res = await GET(
      new NextRequest("https://app.test/auth/callback?code=abc&next=/host")
    );

    expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://app.test/host");
  });

  it("falls back to /explore when next is unsafe", async () => {
    const res = await GET(
      new NextRequest(
        "https://app.test/auth/callback?code=abc&next=https://evil.test"
      )
    );

    expect(res.headers.get("location")).toBe("https://app.test/explore");
  });

  it("redirects to sign-in with an error when the exchange fails", async () => {
    supabase.auth.exchangeCodeForSession.mockResolvedValueOnce({
      error: { message: "bad code" },
    });

    const res = await GET(
      new NextRequest("https://app.test/auth/callback?code=abc")
    );

    expect(res.headers.get("location")).toBe(
      "https://app.test/sign-in?error=oauth_failed"
    );
  });

  it("redirects to sign-in with an error when the code is missing", async () => {
    const res = await GET(new NextRequest("https://app.test/auth/callback"));

    expect(supabase.auth.exchangeCodeForSession).not.toHaveBeenCalled();
    expect(res.headers.get("location")).toBe(
      "https://app.test/sign-in?error=oauth_failed"
    );
  });
});
