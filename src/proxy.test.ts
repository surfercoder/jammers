import "@test/web-globals";
import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

jest.mock("@/utils/supabase/middleware", () => ({
  updateSession: jest.fn(),
}));

import { proxy, config } from "./proxy";

const mockedUpdateSession = updateSession as jest.MockedFunction<
  typeof updateSession
>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("proxy", () => {
  it("delegates to updateSession and returns its response", async () => {
    const request = new NextRequest("https://app.test/explore");
    const response = NextResponse.next();
    mockedUpdateSession.mockResolvedValue(response);

    const result = await proxy(request);

    expect(mockedUpdateSession).toHaveBeenCalledWith(request);
    expect(result).toBe(response);
  });

  it("exports a matcher config", () => {
    expect(config.matcher).toEqual([
      "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ]);
  });
});
