import { render, screen } from "@test/render";
import { Hero } from "./hero";

describe("Hero", () => {
  it("renders the signed-out primary CTA pointing to sign-up", () => {
    render(<Hero signedIn={false} />);

    expect(
      screen.getByRole("heading", { name: /where live music gets made/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /get started — it's free/i })
    ).toHaveAttribute("href", "/sign-up");
  });

  it("renders the signed-in primary CTA pointing to explore", () => {
    render(<Hero signedIn />);

    expect(
      screen.getByRole("link", { name: /open the app/i })
    ).toHaveAttribute("href", "/explore");
  });

  it("renders the waveform equalizer bars", () => {
    const { container } = render(<Hero signedIn={false} />);

    expect(container.querySelectorAll(".equalizer-bar")).toHaveLength(32);
  });
});
