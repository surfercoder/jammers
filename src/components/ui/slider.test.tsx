import { render, screen } from "@test/render";
import { Slider } from "./slider";

it("renders with an explicit value array (multi-thumb branch)", () => {
  render(<Slider value={[20, 60]} className="custom" />);
  const thumbs = screen.getAllByRole("slider");
  expect(thumbs).toHaveLength(2);
  const root = thumbs[0].closest("[data-slot='slider']");
  expect(root).toHaveClass("custom");
});

it("renders with defaultValue array", () => {
  render(<Slider defaultValue={[10, 30, 50]} />);
  expect(screen.getAllByRole("slider")).toHaveLength(3);
});

it("renders with no value (default [min,max] branch)", () => {
  // With neither value nor defaultValue, the component falls back to
  // `[min, max]` internally; Radix renders a single uncontrolled thumb.
  render(<Slider />);
  expect(screen.getAllByRole("slider").length).toBeGreaterThanOrEqual(1);
});
