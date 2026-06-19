import { render, screen, userEvent } from "@test/render";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

describe("Dialog", () => {
  it("opens via the trigger and renders content with the close button", async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent className="cc">
          <DialogHeader className="hd">
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Desc</DialogDescription>
          </DialogHeader>
          <DialogFooter className="ft" showCloseButton>
            <button type="button">Action</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    await userEvent.click(screen.getByText("Open"));

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Desc")).toBeInTheDocument();
    // showCloseButton default true on content (icon, sr-only "Close") + footer Close text.
    expect(screen.getAllByRole("button", { name: "Close" }).length).toBe(2);
    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="dialog-overlay"]')
    ).toBeInTheDocument();
  });

  it("renders content without the close button and footer without its close", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent showCloseButton={false}>
          <DialogTitle>NoClose</DialogTitle>
          <DialogFooter>Footer only</DialogFooter>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText("NoClose")).toBeInTheDocument();
    expect(screen.getByText("Footer only")).toBeInTheDocument();
    expect(screen.queryByText("Close")).not.toBeInTheDocument();
  });

  it("renders the explicit portal/overlay/close subcomponents", async () => {
    render(
      <Dialog>
        <DialogTrigger>Trigger</DialogTrigger>
        <DialogPortal>
          <DialogOverlay className="ov" />
          <DialogContent showCloseButton={false}>
            <DialogTitle>Manual</DialogTitle>
            <DialogClose>Dismiss</DialogClose>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    );

    await userEvent.click(screen.getByText("Trigger"));
    expect(screen.getByText("Manual")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Dismiss"));
    expect(screen.queryByText("Manual")).not.toBeInTheDocument();
  });
});
