import { render, screen } from "@test/render";
import { CtaBand, Footer } from "./cta";

describe("CtaBand", () => {
  it("links to sign-up when the visitor is signed out", () => {
    render(<CtaBand signedIn={false} />);

    const link = screen.getByRole("link", {
      name: /create your free account/i,
    });
    expect(link).toHaveAttribute("href", "/sign-up");
  });

  it("links to explore when the visitor is signed in", () => {
    render(<CtaBand signedIn />);

    const link = screen.getByRole("link", { name: /open the app/i });
    expect(link).toHaveAttribute("href", "/explore");
  });
});

describe("Footer", () => {
  it("renders the current year and the footer links", () => {
    render(<Footer />);

    const year = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`© ${year} Jammers`))
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Rooms" })).toHaveAttribute(
      "href",
      "/explore"
    );
    expect(screen.getByRole("link", { name: "Musicians" })).toHaveAttribute(
      "href",
      "/musicians"
    );
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute(
      "href",
      "/sign-up"
    );
  });
});
