import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieOptions = { path?: string };
type SetAllArg = {
  name: string;
  value: string;
  options?: CookieOptions;
}[];
type CookieHandlers = {
  getAll: () => { name: string; value: string }[];
  setAll: (cookies: SetAllArg) => void;
};

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(() => ({})),
}));

// Local override of the global next/headers mock so we can control `set`.
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

import { createClient } from "./server";

const mockedCreateServerClient = createServerClient as jest.MockedFunction<
  typeof createServerClient
>;
const mockedCookies = cookies as jest.MockedFunction<typeof cookies>;

/** Pull the cookies handlers passed into createServerClient by createClient. */
function capturedCookieHandlers(): CookieHandlers {
  const call = mockedCreateServerClient.mock.calls[0];
  const config = call[2] as { cookies: CookieHandlers };
  return config.cookies;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("createClient (server)", () => {
  it("creates a server client with the public env URL and key", async () => {
    mockedCookies.mockResolvedValue({
      getAll: jest.fn(() => []),
      set: jest.fn(),
    } as never);

    await createClient();

    expect(mockedCreateServerClient).toHaveBeenCalledWith(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      expect.objectContaining({ cookies: expect.any(Object) })
    );
  });

  it("getAll() reads from the cookie store", async () => {
    const stored = [{ name: "sb", value: "token" }];
    const getAll = jest.fn(() => stored);
    mockedCookies.mockResolvedValue({ getAll, set: jest.fn() } as never);

    await createClient();
    const handlers = capturedCookieHandlers();

    expect(handlers.getAll()).toBe(stored);
    expect(getAll).toHaveBeenCalled();
  });

  it("setAll() writes each cookie to the store", async () => {
    const set = jest.fn();
    mockedCookies.mockResolvedValue({
      getAll: jest.fn(() => []),
      set,
    } as never);

    await createClient();
    const handlers = capturedCookieHandlers();

    handlers.setAll([
      { name: "a", value: "1", options: { path: "/" } },
      { name: "b", value: "2", options: { path: "/x" } },
    ]);

    expect(set).toHaveBeenNthCalledWith(1, "a", "1", { path: "/" });
    expect(set).toHaveBeenNthCalledWith(2, "b", "2", { path: "/x" });
  });

  it("setAll() swallows errors thrown from a Server Component context", async () => {
    const set = jest.fn(() => {
      throw new Error("called from a Server Component");
    });
    mockedCookies.mockResolvedValue({
      getAll: jest.fn(() => []),
      set,
    } as never);

    await createClient();
    const handlers = capturedCookieHandlers();

    expect(() =>
      handlers.setAll([{ name: "a", value: "1", options: { path: "/" } }])
    ).not.toThrow();
    expect(set).toHaveBeenCalled();
  });
});
