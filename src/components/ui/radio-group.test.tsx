import { render, screen } from "@test/render";
import { RadioGroup, RadioGroupItem } from "./radio-group";

it("renders a radio group with items", () => {
  render(
    <RadioGroup defaultValue="a" className="custom-group">
      <RadioGroupItem value="a" className="custom-item" aria-label="a" />
      <RadioGroupItem value="b" aria-label="b" />
    </RadioGroup>
  );

  const items = screen.getAllByRole("radio");
  expect(items).toHaveLength(2);
  expect(items[0]).toHaveAttribute("data-slot", "radio-group-item");
  expect(items[0]).toHaveClass("custom-item");

  const group = items[0].closest("[data-slot='radio-group']");
  expect(group).toHaveClass("custom-group");
});
