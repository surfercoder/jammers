import { render, screen } from "@test/render";
import { Input } from "./input";

describe("Input", () => {
  it("renders with no type provided", () => {
    render(<Input aria-label="plain" className="cx" />);
    const el = screen.getByLabelText("plain");
    expect(el).toHaveAttribute("data-slot", "input");
    expect(el).toHaveClass("cx");
  });

  it("renders with an explicit type", () => {
    render(<Input aria-label="email" type="email" />);
    expect(screen.getByLabelText("email")).toHaveAttribute("type", "email");
  });
});
