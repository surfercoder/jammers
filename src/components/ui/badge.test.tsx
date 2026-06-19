import { render, screen } from "@test/render";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders the default variant as a span", () => {
    render(<Badge>Default</Badge>);
    const el = screen.getByText("Default");
    expect(el.tagName).toBe("SPAN");
    expect(el).toHaveAttribute("data-variant", "default");
  });

  it.each([
    "secondary",
    "destructive",
    "outline",
    "ghost",
    "link",
  ] as const)("renders the %s variant", (variant) => {
    render(
      <Badge variant={variant} className="x">
        {variant}
      </Badge>
    );
    const el = screen.getByText(variant);
    expect(el).toHaveAttribute("data-variant", variant);
    expect(el).toHaveClass("x");
  });

  it("renders with asChild using a Slot", () => {
    render(
      <Badge asChild>
        <a href="/x">Link badge</a>
      </Badge>
    );
    const el = screen.getByRole("link", { name: "Link badge" });
    expect(el.tagName).toBe("A");
    expect(el).toHaveAttribute("data-slot", "badge");
  });
});
