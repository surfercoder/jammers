const setThemeMock = jest.fn();

jest.mock("next-themes", () => ({
  useTheme: () => ({ setTheme: setThemeMock }),
}));

import { render, screen, userEvent } from "@test/render";
import { ModeToggle } from "./mode-toggle";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ModeToggle", () => {
  it.each([
    [/light/i, "light"],
    [/dark/i, "dark"],
    [/system/i, "system"],
  ])("sets the theme when %s is clicked", async (name, value) => {
    render(<ModeToggle />);

    await userEvent.click(screen.getByRole("button", { name: /toggle theme/i }));
    await userEvent.click(await screen.findByRole("menuitem", { name }));

    expect(setThemeMock).toHaveBeenCalledWith(value);
  });
});
