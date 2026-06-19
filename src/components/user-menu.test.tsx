jest.mock("@/app/actions/auth", () => ({ signOut: jest.fn() }));

import { render, screen, userEvent } from "@test/render";
import { signOut } from "@/app/actions/auth";
import type { Profile } from "@/lib/types";
import { UserMenu } from "./user-menu";

const signOutMock = signOut as jest.Mock;

const profile = (overrides: Partial<Profile> = {}) =>
  ({
    id: "u1",
    username: "ada",
    full_name: "Ada Lovelace",
    avatar_url: "https://img.test/a.jpg",
    ...overrides,
  }) as unknown as Profile;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("UserMenu", () => {
  it("renders the full name and menu items, and signs out", async () => {
    render(<UserMenu profile={profile()} />);

    await userEvent.click(screen.getByRole("button"));

    expect(
      await screen.findByRole("menuitem", { name: /dashboard/i })
    ).toBeInTheDocument();
    expect(screen.getByText("@ada")).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /my public profile/i })
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("menuitem", { name: /sign out/i }));
    expect(signOutMock).toHaveBeenCalled();
  });

  it("falls back to the username when full_name and avatar are null", async () => {
    render(
      <UserMenu profile={profile({ full_name: null, avatar_url: null })} />
    );

    await userEvent.click(screen.getByRole("button"));

    expect(
      await screen.findByRole("menuitem", { name: /dashboard/i })
    ).toBeInTheDocument();
    expect(screen.getByText("@ada")).toBeInTheDocument();
  });
});
