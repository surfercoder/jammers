import { createBrowserClient } from "@supabase/ssr";

jest.mock("@supabase/ssr", () => ({
  createBrowserClient: jest.fn(() => ({})),
}));

import { createClient } from "./client";

const mockedCreateBrowserClient =
  createBrowserClient as jest.MockedFunction<typeof createBrowserClient>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("createClient (browser)", () => {
  it("creates a browser client with the public env URL and key", () => {
    const client = createClient();

    expect(mockedCreateBrowserClient).toHaveBeenCalledWith(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );
    expect(client).toEqual({});
  });
});
