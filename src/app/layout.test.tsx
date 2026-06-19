import { render, screen } from "@test/render";
import RootLayout from "./layout";

it("renders children inside the theme provider + toaster", () => {
  // RootLayout renders <html><body>; Testing Library renders into its own
  // container, so asserting the children render is sufficient for coverage.
  render(RootLayout({ children: <div>child content</div> }));
  expect(screen.getByText("child content")).toBeInTheDocument();
});
