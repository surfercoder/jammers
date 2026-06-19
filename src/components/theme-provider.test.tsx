import { render, screen } from "@test/render";
import { ThemeProvider } from "./theme-provider";

describe("ThemeProvider", () => {
  it("renders its children", () => {
    render(
      <ThemeProvider>
        <span>child content</span>
      </ThemeProvider>
    );

    expect(screen.getByText("child content")).toBeInTheDocument();
  });
});
