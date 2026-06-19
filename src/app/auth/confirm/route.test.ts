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

describe("GET /auth/confirm", () => {
  it("verifies the OTP and redirects to a safe next path", async () => {
    const res = await GET(
      new NextRequest(
        "https://app.test/auth/confirm?token_hash=th&type=email&next=/host"
      )
    );

    expect(supabase.auth.verifyOtp).toHaveBeenCalledWith({
      type: "email",
      token_hash: "th",
    });
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://app.test/host");
  });

  it("falls back to /explore when next is unsafe", async () => {
    const res = await GET(
      new NextRequest(
        "https://app.test/auth/confirm?token_hash=th&type=email&next=//evil.test"
      )
    );

    expect(res.headers.get("location")).toBe("https://app.test/explore");
  });

  it("redirects to an error page when verifyOtp fails", async () => {
    supabase.auth.verifyOtp.mockResolvedValueOnce({
      error: { message: "expired" },
    });

    const res = await GET(
      new NextRequest(
        "https://app.test/auth/confirm?token_hash=th&type=email"
      )
    );

    expect(res.headers.get("location")).toBe(
      "https://app.test/sign-in?error=invalid_or_expired_link"
    );
  });

  it("redirects to an error page when token_hash is missing", async () => {
    const res = await GET(
      new NextRequest("https://app.test/auth/confirm?type=email")
    );

    expect(supabase.auth.verifyOtp).not.toHaveBeenCalled();
    expect(res.headers.get("location")).toBe(
      "https://app.test/sign-in?error=invalid_or_expired_link"
    );
  });

  it("redirects to an error page when type is missing", async () => {
    const res = await GET(
      new NextRequest("https://app.test/auth/confirm?token_hash=th")
    );

    expect(supabase.auth.verifyOtp).not.toHaveBeenCalled();
    expect(res.headers.get("location")).toBe(
      "https://app.test/sign-in?error=invalid_or_expired_link"
    );
  });
});
