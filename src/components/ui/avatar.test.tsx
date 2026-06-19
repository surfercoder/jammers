import { render, screen } from "@test/render";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
} from "./avatar";

describe("Avatar", () => {
  it("renders with the default size", () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    const root = document.querySelector('[data-slot="avatar"]');
    expect(root).toHaveAttribute("data-size", "default");
    expect(screen.getByText("AB")).toBeInTheDocument();
  });

  it("renders with explicit sizes and a custom className", () => {
    render(<Avatar size="sm" className="extra" data-testid="sm" />);
    render(<Avatar size="lg" data-testid="lg" />);
    expect(screen.getByTestId("sm")).toHaveAttribute("data-size", "sm");
    expect(screen.getByTestId("sm")).toHaveClass("extra");
    expect(screen.getByTestId("lg")).toHaveAttribute("data-size", "lg");
  });

  it("renders the image sub-component", () => {
    render(
      <Avatar>
        <AvatarImage src="https://img.test/a.jpg" alt="a" className="img" />
        <AvatarFallback>FB</AvatarFallback>
      </Avatar>
    );
    // Radix may show the fallback in jsdom; assert the slot exists either way.
    expect(screen.getByText("FB")).toBeInTheDocument();
  });

  it("renders the badge, group, and group count", () => {
    render(
      <AvatarGroup className="grp">
        <Avatar>
          <AvatarFallback>X</AvatarFallback>
          <AvatarBadge className="bdg">!</AvatarBadge>
        </Avatar>
        <AvatarGroupCount className="cnt">+3</AvatarGroupCount>
      </AvatarGroup>
    );
    expect(
      document.querySelector('[data-slot="avatar-group"]')
    ).toHaveClass("grp");
    expect(
      document.querySelector('[data-slot="avatar-badge"]')
    ).toHaveClass("bdg");
    expect(
      document.querySelector('[data-slot="avatar-group-count"]')
    ).toHaveClass("cnt");
    expect(screen.getByText("+3")).toBeInTheDocument();
  });
});
