import { render, screen } from "@test/render";

jest.mock("@/app/actions/auth", () => ({
  requestPasswordReset: jest.fn(),
}));

import ForgotPasswordPage from "./page";

it("renders the forgot-password form", () => {
  render(<ForgotPasswordPage />);
  expect(
    screen.getByRole("heading", { name: "Reset password" })
  ).toBeInTheDocument();
});
