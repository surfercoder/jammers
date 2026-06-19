import { render, screen } from "@test/render";
import { Logo } from "./logo";

describe("Logo", () => {
  it("renders the wordmark and default href", () => {
    render(<Logo />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/");
    expect(screen.getByText("Jam")).toBeInTheDocument();
    expect(screen.getByText("mers")).toBeInTheDocument();
  });

  it("hides the wordmark and applies a custom href + className", () => {
    render(<Logo href="/home" className="extra" showWordmark={false} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/home");
    expect(link).toHaveClass("extra");
    expect(screen.queryByText("Jam")).not.toBeInTheDocument();
  });
});
