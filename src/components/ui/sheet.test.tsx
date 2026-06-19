import { render, screen, userEvent } from "@test/render";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

type Side = "top" | "right" | "bottom" | "left";

function renderSheet(side?: Side, showCloseButton = true) {
  return render(
    <Sheet defaultOpen>
      <SheetTrigger>Open</SheetTrigger>
      <SheetContent
        side={side}
        showCloseButton={showCloseButton}
        className="custom-content"
      >
        <SheetHeader className="custom-header">
          <SheetTitle className="custom-title">Title</SheetTitle>
          <SheetDescription className="custom-desc">Desc</SheetDescription>
        </SheetHeader>
        <SheetFooter className="custom-footer">
          <SheetClose>Done</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

it.each<Side>(["top", "right", "bottom", "left"])(
  "renders the %s side with content mounted",
  (side) => {
    renderSheet(side);
    const content = screen.getByRole("dialog");
    expect(content).toHaveAttribute("data-side", side);
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Desc")).toBeInTheDocument();
    // close button present
    expect(
      screen.getByRole("button", { name: /close/i })
    ).toBeInTheDocument();
  }
);

it("defaults to the right side when no side prop is given", () => {
  renderSheet(undefined);
  expect(screen.getByRole("dialog")).toHaveAttribute("data-side", "right");
});

it("hides the close button when showCloseButton is false", () => {
  renderSheet("right", false);
  expect(
    screen.queryByRole("button", { name: /close/i })
  ).not.toBeInTheDocument();
});

it("closes via trigger toggle (controlled by trigger)", async () => {
  render(
    <Sheet>
      <SheetTrigger>Open sheet</SheetTrigger>
      <SheetContent>
        <SheetTitle>Sheet Title</SheetTitle>
        <SheetDescription>Sheet Desc</SheetDescription>
      </SheetContent>
    </Sheet>
  );

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await userEvent.click(screen.getByText("Open sheet"));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
});
