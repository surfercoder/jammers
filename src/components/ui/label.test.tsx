import { render, screen } from "@test/render";
import { Label } from "./label";

describe("Label", () => {
  it("renders with content and a custom className", () => {
    render(<Label className="cx">Name</Label>);
    const el = screen.getByText("Name");
    expect(el).toHaveAttribute("data-slot", "label");
    expect(el).toHaveClass("cx");
  });
});
