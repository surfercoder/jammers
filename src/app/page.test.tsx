import { screen } from "@testing-library/react";
import { renderAsync } from "@test/render";
import type { Profile } from "@/lib/types";

jest.mock("@/lib/data/auth", () => ({ getCurrentProfile: jest.fn() }));
// SiteHeader is itself an async Server Component; React can't render a nested
// async component inside this render, so stub it to a sync placeholder.
jest.mock("@/components/site-header", () => ({
  SiteHeader: () => <header>site header</header>,
}));

import { getCurrentProfile } from "@/lib/data/auth";
import HomePage from "./page";

const profileMock = getCurrentProfile as jest.MockedFunction<
  typeof getCurrentProfile
>;

beforeEach(() => {
  jest.clearAllMocks();
});

it("renders the marketing page when signed out", async () => {
  profileMock.mockResolvedValue(null);
  await renderAsync(HomePage());
  expect(screen.getByRole("main")).toBeInTheDocument();
});

it("renders the marketing page when signed in", async () => {
  profileMock.mockResolvedValue({ id: "u1" } as unknown as Profile);
  await renderAsync(HomePage());
  expect(screen.getByRole("main")).toBeInTheDocument();
});
