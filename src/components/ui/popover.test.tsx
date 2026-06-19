import { render, screen, userEvent } from "@test/render";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";

describe("Popover", () => {
  it("opens via the trigger and renders content with default align/offset", async () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent className="cc">
          <PopoverHeader className="hd">
            <PopoverTitle className="ti">Title</PopoverTitle>
            <PopoverDescription className="de">Desc</PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
    );

    await userEvent.click(screen.getByText("Open"));

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Desc")).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="popover-content"]')
    ).toHaveClass("cc");
  });

  it("supports an anchor and explicit align/offset props", () => {
    render(
      <Popover defaultOpen>
        <PopoverAnchor className="an">anchor</PopoverAnchor>
        <PopoverContent align="start" sideOffset={8}>
          Anchored
        </PopoverContent>
      </Popover>
    );

    expect(screen.getByText("Anchored")).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="popover-anchor"]')
    ).toBeInTheDocument();
  });
});
