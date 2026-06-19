import { render, screen, userEvent } from "@test/render";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("renders unchecked by default", () => {
    render(<Checkbox aria-label="agree" />);
    const el = screen.getByRole("checkbox", { name: "agree" });
    expect(el).toHaveAttribute("data-slot", "checkbox");
    expect(el).toHaveAttribute("aria-checked", "false");
  });

  it("toggles when clicked", async () => {
    render(<Checkbox aria-label="agree" className="cx" />);
    const el = screen.getByRole("checkbox", { name: "agree" });
    expect(el).toHaveClass("cx");
    await userEvent.click(el);
    expect(el).toHaveAttribute("aria-checked", "true");
  });

  it("renders the indicator when checked", () => {
    render(<Checkbox aria-label="checked" checked />);
    expect(
      document.querySelector('[data-slot="checkbox-indicator"]')
    ).toBeInTheDocument();
  });
});
