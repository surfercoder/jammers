jest.mock("@/lib/data/auth", () => ({ getCurrentProfile: jest.fn() }));
jest.mock("@/app/actions/auth", () => ({ signOut: jest.fn() }));

import { screen } from "@testing-library/react";
import { renderAsync } from "@test/render";
import { getCurrentProfile } from "@/lib/data/auth";
import type { Profile } from "@/lib/types";
import { SiteHeader } from "./site-header";

const getCurrentProfileMock = getCurrentProfile as jest.MockedFunction<
  typeof getCurrentProfile
>;

const profile = {
  id: "u1",
  username: "ada",
  full_name: "Ada Lovelace",
  avatar_url: null,
} as unknown as Profile;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SiteHeader", () => {
  it("renders sign-in / get-started links when signed out", async () => {
    getCurrentProfileMock.mockResolvedValue(null);

    await renderAsync(SiteHeader());

    expect(screen.getAllByRole("link", { name: /sign in/i }).length).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: /get started/i }).length
    ).toBeGreaterThan(0);
  });

  it("renders the user menu when signed in", async () => {
    getCurrentProfileMock.mockResolvedValue(profile);

    await renderAsync(SiteHeader());

    expect(
      screen.queryByRole("link", { name: /sign in/i })
    ).not.toBeInTheDocument();
    // The user menu avatar trigger replaces the auth links.
    expect(screen.getByText("AL")).toBeInTheDocument();
  });
});
