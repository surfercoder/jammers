import { render, screen } from "@test/render";
import AuthLayout from "./layout";

it("renders the brand panel, highlights and children", () => {
  render(AuthLayout({ children: <div>auth child</div> }));
  expect(screen.getByText("auth child")).toBeInTheDocument();
  expect(
    screen.getByText("Where live music gets made.")
  ).toBeInTheDocument();
  expect(
    screen.getByText("Book rehearsal rooms across Buenos Aires")
  ).toBeInTheDocument();
});
