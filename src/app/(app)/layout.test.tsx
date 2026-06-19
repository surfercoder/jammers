import { render, screen } from "@test/render";

// SiteHeader is an async Server Component; stub it to a sync placeholder so the
// layout (and its children) render synchronously in jsdom.
jest.mock("@/components/site-header", () => ({
  SiteHeader: () => <header>site header</header>,
}));

import AppLayout from "./layout";

it("renders the site header and children", () => {
  render(AppLayout({ children: <div>app child</div> }));
  expect(screen.getByText("app child")).toBeInTheDocument();
});
