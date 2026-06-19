import { render, screen, userEvent } from "@test/render";
import { Textarea } from "./textarea";

it("renders and accepts input", async () => {
  render(<Textarea className="custom" placeholder="type here" />);
  const ta = screen.getByPlaceholderText("type here");
  expect(ta).toHaveAttribute("data-slot", "textarea");
  expect(ta).toHaveClass("custom");

  await userEvent.type(ta, "hello");
  expect(ta).toHaveValue("hello");
});
