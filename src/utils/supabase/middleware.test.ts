import "@test/web-globals";
import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";
import { createSupabaseMock, type SupabaseMock } from "@test/supabase";

type CookieHandlers = {
  getAll: () => { name: string; value: string }[];
  setAll: (
    cookies: { name: string; value: string; options?: unknown }[]
  ) => void;
};

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(),
}));

import { updateSession } from "./middleware";

const mockedCreateServerClient = createServerClient as jest.MockedFunction<
  typeof createServerClient
>;

function useClient(mock: SupabaseMock) {
  mockedCreateServerClient.mockReturnValue(mock as never);
}

function capturedCookieHandlers(): CookieHandlers {
  const call = mockedCreateServerClient.mock.calls[0];
  const config = call[2] as { cookies: CookieHandlers };
  return config.cookies;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("updateSession", () => {
  it("creates the server client with the public env URL and key", async () => {
    useClient(createSupabaseMock({ user: { id: "u1" } }));
    await updateSession(new NextRequest("https://app.test/explore"));

    expect(mockedCreateServerClient).toHaveBeenCalledWith(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      expect.objectContaining({ cookies: expect.any(Object) })
    );
  });

  it("passes a request without redirect for an authed user on a protected route", async () => {
    useClient(createSupabaseMock({ user: { id: "u1" } }));
    const res = await updateSession(new NextRequest("https://app.test/explore"));

    // NextResponse.next() has no Location redirect.
    expect(res.headers.get("location")).toBeNull();
  });

  it("matches a protected prefix exactly (no trailing slash)", async () => {
    useClient(createSupabaseMock({ user: null }));
    const res = await updateSession(new NextRequest("https://app.test/rooms"));

    expect(res.status).toBe(307);
    const location = res.headers.get("location") as string;
    expect(new URL(location).pathname).toBe("/sign-in");
    expect(new URL(location).searchParams.get("next")).toBe("/rooms");
  });

  it("redirects an unauthenticated user away from a nested protected route", async () => {
    useClient(createSupabaseMock({ user: null }));
    const res = await updateSession(
      new NextRequest("https://app.test/rooms/123")
    );

    const location = res.headers.get("location") as string;
    expect(new URL(location).pathname).toBe("/sign-in");
    expect(new URL(location).searchParams.get("next")).toBe("/rooms/123");
  });

  it("redirects a signed-in user away from an auth page to /explore", async () => {
    useClient(createSupabaseMock({ user: { id: "u1" } }));
    const res = await updateSession(
      new NextRequest("https://app.test/sign-in?next=/foo")
    );

    const location = res.headers.get("location") as string;
    expect(new URL(location).pathname).toBe("/explore");
    expect(new URL(location).search).toBe("");
  });

  it("lets an unauthenticated user through a public path", async () => {
    useClient(createSupabaseMock({ user: null }));
    const res = await updateSession(new NextRequest("https://app.test/"));

    expect(res.headers.get("location")).toBeNull();
  });

  it("setAll() updates request and response cookies", async () => {
    useClient(createSupabaseMock({ user: { id: "u1" } }));
    const request = new NextRequest("https://app.test/explore");
    await updateSession(request);

    const handlers = capturedCookieHandlers();
    handlers.setAll([
      { name: "sb", value: "tok", options: { path: "/" } },
      { name: "sb2", value: "tok2", options: { path: "/" } },
    ]);

    expect(request.cookies.get("sb")?.value).toBe("tok");
    expect(request.cookies.get("sb2")?.value).toBe("tok2");
  });

  it("getAll() reads cookies from the request", async () => {
    useClient(createSupabaseMock({ user: { id: "u1" } }));
    const request = new NextRequest("https://app.test/explore");
    request.cookies.set("sb", "tok");
    await updateSession(request);

    const handlers = capturedCookieHandlers();
    expect(handlers.getAll().some((c) => c.name === "sb")).toBe(true);
  });
});
