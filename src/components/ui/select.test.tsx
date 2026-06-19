import { render, screen, userEvent } from "@test/render";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";

it("opens (item-aligned position) and selects an item, exercising label/separator/group", async () => {
  const onValueChange = jest.fn();
  render(
    <Select onValueChange={onValueChange}>
      <SelectTrigger className="custom-trigger" aria-label="fruit">
        <SelectValue placeholder="Pick one" />
      </SelectTrigger>
      <SelectContent className="custom-content">
        <SelectGroup className="custom-group">
          <SelectLabel className="custom-label">Fruits</SelectLabel>
          <SelectItem value="apple" className="custom-item">
            Apple
          </SelectItem>
          <SelectSeparator className="custom-sep" />
          <SelectItem value="banana">Banana</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );

  const trigger = screen.getByRole("combobox");
  expect(trigger).toHaveAttribute("data-size", "default");
  await userEvent.click(trigger);

  const apple = await screen.findByRole("option", { name: "Apple" });
  await userEvent.click(apple);
  expect(onValueChange).toHaveBeenCalledWith("apple");
});

it("renders with popper position and sm trigger size, forced open", () => {
  render(
    <Select open defaultValue="x">
      <SelectTrigger size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value="x">X</SelectItem>
      </SelectContent>
    </Select>
  );

  expect(
    document.querySelector("[data-slot='select-trigger']")
  ).toHaveAttribute("data-size", "sm");
  expect(screen.getByRole("option", { name: "X" })).toBeInTheDocument();
});

it("renders scroll up/down buttons directly", () => {
  render(
    <Select open defaultValue="x">
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectScrollUpButton className="up" />
        <SelectItem value="x">X</SelectItem>
        <SelectScrollDownButton className="down" />
      </SelectContent>
    </Select>
  );

  expect(screen.getByRole("option", { name: "X" })).toBeInTheDocument();
});
