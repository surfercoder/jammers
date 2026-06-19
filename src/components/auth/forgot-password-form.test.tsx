jest.mock("@/app/actions/auth", () => ({
  requestPasswordReset: jest.fn(),
}));

import { render, screen, fireEvent } from "@test/render";
import { requestPasswordReset } from "@/app/actions/auth";
import { ForgotPasswordForm } from "./forgot-password-form";

const requestPasswordResetMock = requestPasswordReset as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ForgotPasswordForm", () => {
  it("renders the empty initial state", () => {
    render(<ForgotPasswordForm />);

    expect(
      screen.getByRole("heading", { name: /reset password/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send reset link/i })
    ).toBeInTheDocument();
  });

  it("renders the error and field error returned by the action", async () => {
    requestPasswordResetMock.mockResolvedValue({
      error: "No such user",
      fieldErrors: { email: ["Invalid email"] },
    });

    const { container } = render(<ForgotPasswordForm />);
    fireEvent.submit(container.querySelector("form.space-y-4")!);

    expect(await screen.findByText("No such user")).toBeInTheDocument();
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
  });

  it("renders the success message returned by the action", async () => {
    requestPasswordResetMock.mockResolvedValue({ message: "Reset link sent" });

    const { container } = render(<ForgotPasswordForm />);
    fireEvent.submit(container.querySelector("form.space-y-4")!);

    expect(await screen.findByText("Reset link sent")).toBeInTheDocument();
  });
});
