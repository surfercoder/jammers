import { render, screen } from "@test/render";
import { Features } from "./features";

describe("Features", () => {
  it("renders both feature bands with their CTAs", () => {
    render(<Features />);

    expect(
      screen.getByRole("heading", {
        name: /book the perfect room, on a live map/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /find players\. get hired/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /explore rooms/i })
    ).toHaveAttribute("href", "/explore");
    expect(
      screen.getByRole("link", { name: /find musicians/i })
    ).toHaveAttribute("href", "/musicians");
  });

  it("renders the feature band bullet points", () => {
    render(<Features />);

    expect(
      screen.getByText("Interactive map with instant previews")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Showcase performance videos")
    ).toBeInTheDocument();
  });

  it("renders the perks grid", () => {
    render(<Features />);

    expect(screen.getByText("Powerful filters")).toBeInTheDocument();
    expect(screen.getByText("Show your sound")).toBeInTheDocument();
    expect(screen.getByText("Direct messaging")).toBeInTheDocument();
    expect(screen.getByText("Request & confirm")).toBeInTheDocument();
  });

  it("renders the roles row", () => {
    render(<Features />);

    expect(screen.getByText("Room owners")).toBeInTheDocument();
    expect(screen.getByText("Managers & bands")).toBeInTheDocument();
  });
});
