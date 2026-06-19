jest.mock("@/app/actions/auth", () => ({
  signIn: jest.fn(),
  signInWithGoogle: jest.fn(),
}));

import { render, screen, fireEvent } from "@test/render";
import { signIn } from "@/app/actions/auth";
import { SignInForm } from "./sign-in-form";

const signInMock = signIn as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SignInForm", () => {
  it("renders the empty initial state without a next field", () => {
    render(<SignInForm />);

    expect(
      screen.getByRole("heading", { name: /welcome back/i })
    ).toBeInTheDocument();
    expect(
      document.querySelector('input[name="next"]')
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it("renders a hidden next field when the next prop is provided", () => {
    render(<SignInForm next="/host" />);

    const hidden = document.querySelector('input[name="next"]');
    expect(hidden).toHaveValue("/host");
  });

  it("renders the form error and field errors returned by the action", async () => {
    signInMock.mockResolvedValue({
      error: "Invalid credentials",
      fieldErrors: { email: ["Bad email"], password: ["Bad password"] },
    });

    const { container } = render(<SignInForm />);
    fireEvent.submit(container.querySelector("form.space-y-4")!);

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
    expect(screen.getByText("Bad email")).toBeInTheDocument();
    expect(screen.getByText("Bad password")).toBeInTheDocument();
  });
});
