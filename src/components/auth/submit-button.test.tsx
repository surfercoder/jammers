let pending = false;

jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  useFormStatus: () => ({ pending, data: null, method: null, action: null }),
}));

import { render, screen } from "@test/render";
import { SubmitButton } from "./submit-button";

describe("SubmitButton", () => {
  afterEach(() => {
    pending = false;
  });

  it("renders an enabled submit button without a spinner when not pending", () => {
    pending = false;
    render(<SubmitButton className="extra">Sign in</SubmitButton>);

    const button = screen.getByRole("button", { name: "Sign in" });
    expect(button).toBeEnabled();
    expect(button).toHaveClass("extra");
    expect(button.querySelector("svg")).toBeNull();
  });

  it("renders a disabled submit button with a spinner when pending", () => {
    pending = true;
    render(<SubmitButton>Sign in</SubmitButton>);

    const button = screen.getByRole("button", { name: "Sign in" });
    expect(button).toBeDisabled();
    expect(button.querySelector("svg")).not.toBeNull();
  });
});
