jest.mock("@/app/actions/auth", () => ({
  signUp: jest.fn(),
  signInWithGoogle: jest.fn(),
}));

import { render, screen, fireEvent } from "@test/render";
import { signUp } from "@/app/actions/auth";
import { SignUpForm } from "./sign-up-form";

const signUpMock = signUp as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SignUpForm", () => {
  it("renders the empty initial state with all account types", () => {
    render(<SignUpForm />);

    expect(
      screen.getByRole("heading", { name: /join jammers/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Musician")).toBeInTheDocument();
    expect(screen.getByText("Manager / Band")).toBeInTheDocument();
    expect(screen.getByText("Rehearsal room owner")).toBeInTheDocument();
  });

  it("renders the form error and field errors returned by the action", async () => {
    signUpMock.mockResolvedValue({
      error: "Something went wrong",
      fieldErrors: {
        full_name: ["Name required"],
        username: ["Username taken"],
        email: ["Bad email"],
        password: ["Weak password"],
      },
    });

    const { container } = render(<SignUpForm />);
    fireEvent.submit(container.querySelector("form.space-y-4")!);

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Name required")).toBeInTheDocument();
    expect(screen.getByText("Username taken")).toBeInTheDocument();
    expect(screen.getByText("Bad email")).toBeInTheDocument();
    expect(screen.getByText("Weak password")).toBeInTheDocument();
  });

  it("renders the check-your-email success view when a message is returned", async () => {
    signUpMock.mockResolvedValue({ message: "Confirm your email to continue" });

    const { container } = render(<SignUpForm />);
    fireEvent.submit(container.querySelector("form.space-y-4")!);

    expect(
      await screen.findByRole("heading", { name: /check your email/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Confirm your email to continue")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /back to sign in/i })
    ).toBeInTheDocument();
  });
});
