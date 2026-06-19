import { screen } from "@testing-library/react";
import { renderAsync } from "@test/render";

jest.mock("@/app/actions/auth", () => ({
  signIn: jest.fn(),
  signInWithGoogle: jest.fn(),
}));

import SignInPage from "./page";

it("renders the sign-in form (with a next param)", async () => {
  await renderAsync(
    SignInPage({ searchParams: Promise.resolve({ next: "/rooms/x" }) })
  );
  expect(
    screen.getByRole("heading", { name: "Welcome back" })
  ).toBeInTheDocument();
});
