import { render, screen } from "@test/render";

jest.mock("@/app/actions/auth", () => ({
  updatePassword: jest.fn(),
}));

import ResetPasswordPage from "./page";

it("renders the reset-password form", () => {
  render(<ResetPasswordPage />);
  expect(
    screen.getByRole("heading", { name: "Set a new password" })
  ).toBeInTheDocument();
});
