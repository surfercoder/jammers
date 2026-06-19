import { render, screen, userEvent } from "@test/render";
import { Switch } from "./switch";

it("renders default size and toggles", async () => {
  render(<Switch className="custom" aria-label="toggle" />);
  const sw = screen.getByRole("switch");
  expect(sw).toHaveAttribute("data-slot", "switch");
  expect(sw).toHaveAttribute("data-size", "default");
  expect(sw).toHaveClass("custom");

  await userEvent.click(sw);
  expect(sw).toBeChecked();
});

it("renders sm size", () => {
  render(<Switch size="sm" aria-label="small" />);
  expect(screen.getByRole("switch")).toHaveAttribute("data-size", "sm");
});
