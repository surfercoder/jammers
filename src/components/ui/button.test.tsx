import { render, screen } from "@test/render";
import { Button } from "./button";

const variants = [
  "default",
  "outline",
  "secondary",
  "ghost",
  "destructive",
  "link",
] as const;

const sizes = [
  "default",
  "xs",
  "sm",
  "lg",
  "icon",
  "icon-xs",
  "icon-sm",
  "icon-lg",
] as const;

describe("Button", () => {
  it("renders the default button", () => {
    render(<Button>Click</Button>);
    const el = screen.getByRole("button", { name: "Click" });
    expect(el).toHaveAttribute("data-variant", "default");
    expect(el).toHaveAttribute("data-size", "default");
  });

  it.each(variants)("renders the %s variant", (variant) => {
    render(
      <Button variant={variant} className="cx">
        {variant}
      </Button>
    );
    const el = screen.getByRole("button", { name: variant });
    expect(el).toHaveAttribute("data-variant", variant);
    expect(el).toHaveClass("cx");
  });

  it.each(sizes)("renders the %s size", (size) => {
    render(<Button size={size}>{`size-${size}`}</Button>);
    expect(
      screen.getByRole("button", { name: `size-${size}` })
    ).toHaveAttribute("data-size", size);
  });

  it("renders with asChild using a Slot", () => {
    render(
      <Button asChild>
        <a href="/x">Anchor</a>
      </Button>
    );
    const el = screen.getByRole("link", { name: "Anchor" });
    expect(el.tagName).toBe("A");
    expect(el).toHaveAttribute("data-slot", "button");
  });
});
