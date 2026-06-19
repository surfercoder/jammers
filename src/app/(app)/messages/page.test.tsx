import { render, screen } from "@testing-library/react";
import MessagesIndexPage from "./page";

it("renders the empty-state prompt", () => {
  render(<MessagesIndexPage />);

  expect(
    screen.getByText(/Select a conversation to start chatting/i)
  ).toBeInTheDocument();
});
