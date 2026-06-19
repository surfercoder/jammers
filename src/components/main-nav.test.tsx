import { render, screen } from "@test/render";
import { usePathname } from "next/navigation";
import { MainNav } from "./main-nav";

const usePathnameMock = usePathname as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  usePathnameMock.mockReturnValue("/");
});

describe("MainNav", () => {
  it("renders all nav links inactive on an unrelated path", () => {
    render(<MainNav />);

    const explore = screen.getByRole("link", { name: /explore rooms/i });
    expect(explore).toHaveAttribute("href", "/explore");
    expect(explore).toHaveClass("text-muted-foreground");
    expect(screen.getByRole("link", { name: /musicians/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /messages/i })).toBeInTheDocument();
  });

  it("highlights the active link via exact match", () => {
    usePathnameMock.mockReturnValue("/explore");
    render(<MainNav />);

    expect(screen.getByRole("link", { name: /explore rooms/i })).toHaveClass(
      "bg-accent"
    );
  });

  it("highlights the active link via prefix match and renders vertically", () => {
    usePathnameMock.mockReturnValue("/musicians/ada");
    render(<MainNav orientation="vertical" />);

    expect(screen.getByRole("link", { name: /musicians/i })).toHaveClass(
      "bg-accent"
    );
    expect(screen.getByRole("navigation")).toHaveClass("flex-col");
  });
});
