jest.mock("@/app/actions/auth", () => ({
  updatePassword: jest.fn(),
}));

import { render, screen, fireEvent } from "@test/render";
import { updatePassword } from "@/app/actions/auth";
import { ResetPasswordForm } from "./reset-password-form";

const updatePasswordMock = updatePassword as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ResetPasswordForm", () => {
  it("renders the empty initial state", () => {
    render(<ResetPasswordForm />);

    expect(
      screen.getByRole("heading", { name: /set a new password/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /update password/i })
    ).toBeInTheDocument();
  });

  it("renders the error and field error returned by the action", async () => {
    updatePasswordMock.mockResolvedValue({
      error: "Could not update",
      fieldErrors: { password: ["Too weak"] },
    });

    const { container } = render(<ResetPasswordForm />);
    fireEvent.submit(container.querySelector("form.space-y-4")!);

    expect(await screen.findByText("Could not update")).toBeInTheDocument();
    expect(screen.getByText("Too weak")).toBeInTheDocument();
  });
});
