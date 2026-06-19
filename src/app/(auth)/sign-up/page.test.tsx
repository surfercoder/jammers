import { render, screen } from "@test/render";

jest.mock("@/app/actions/auth", () => ({
  signUp: jest.fn(),
  signInWithGoogle: jest.fn(),
}));

import SignUpPage from "./page";

it("renders the sign-up form", () => {
  render(<SignUpPage />);
  expect(
    screen.getByRole("heading", { name: "Join Jammers" })
  ).toBeInTheDocument();
});
