import { render, screen, userEvent } from "@test/render";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";

describe("DropdownMenu", () => {
  it("renders the full menu content with all item variants when open", async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent className="cc" align="end" sideOffset={8}>
          <DropdownMenuLabel inset className="lbl">
            Section
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem className="it">
              Default item
              <DropdownMenuShortcut className="sc">⌘K</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem inset variant="destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="sep" />
          <DropdownMenuCheckboxItem checked inset className="ck">
            Checked box
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={false}>
            Unchecked box
          </DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="a">
            <DropdownMenuRadioItem value="a" inset className="ri">
              Radio A
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="b">Radio B</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(screen.getByText("Section")).toBeInTheDocument();
    expect(screen.getByText("Default item")).toBeInTheDocument();
    expect(screen.getByText("⌘K")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Checked box")).toBeInTheDocument();
    expect(screen.getByText("Unchecked box")).toBeInTheDocument();
    expect(screen.getByText("Radio A")).toBeInTheDocument();
    expect(screen.getByText("Radio B")).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="dropdown-menu-separator"]')
    ).toHaveClass("sep");
  });

  it("renders the default label (no inset) and the explicit portal", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuLabel>Plain label</DropdownMenuLabel>
            <DropdownMenuItem>Only item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    );

    expect(screen.getByText("Plain label")).toBeInTheDocument();
    expect(screen.getByText("Only item")).toBeInTheDocument();
  });

  it("expands a submenu revealing the sub content", async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger inset className="st">
              More
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="sub">
              <DropdownMenuItem>Sub item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await userEvent.click(screen.getByText("More"));
    expect(await screen.findByText("Sub item")).toBeInTheDocument();
  });
});
