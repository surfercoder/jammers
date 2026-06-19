import { render, screen, userEvent } from "@test/render";
import { ChipPicker } from "./chip-picker";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ChipPicker", () => {
  it("renders string options and toggles selection on/off", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ChipPicker name="tags" options={["Rock", "Jazz"]} />
    );

    // Nothing selected initially → no hidden inputs.
    expect(container.querySelectorAll('input[type="hidden"]')).toHaveLength(0);

    const rock = screen.getByRole("button", { name: "Rock" });
    await user.click(rock);
    expect(rock.className).toContain("bg-primary");
    const hidden = container.querySelector('input[name="tags"]')!;
    expect(hidden).toHaveValue("Rock");

    // Click again to deselect (filter branch).
    await user.click(rock);
    expect(container.querySelectorAll('input[name="tags"]')).toHaveLength(0);
  });

  it("renders {value,label} options with a default selection", () => {
    const { container } = render(
      <ChipPicker
        name="avail"
        options={[
          { value: "gigs", label: "One-off gigs" },
          { value: "session", label: "Session work" },
        ]}
        defaultValue={["gigs"]}
      />
    );

    expect(screen.getByRole("button", { name: "One-off gigs" })).toBeInTheDocument();
    const hidden = container.querySelector('input[name="avail"]')!;
    expect(hidden).toHaveValue("gigs");
  });
});
