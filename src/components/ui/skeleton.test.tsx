import { render, screen } from "@test/render";
import { Skeleton } from "./skeleton";

it("renders with default and custom classes", () => {
  render(<Skeleton className="h-4 w-4" data-testid="sk" />);
  const el = screen.getByTestId("sk");
  expect(el).toHaveAttribute("data-slot", "skeleton");
  expect(el).toHaveClass("animate-pulse", "h-4", "w-4");
});
