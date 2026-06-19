import { render, screen } from "@test/render";
import { usePathname } from "next/navigation";
import { MessagesShell } from "./messages-shell";

const usePathnameMock = usePathname as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("MessagesShell", () => {
  it("shows the list pane when on the messages index", () => {
    usePathnameMock.mockReturnValue("/messages");

    const { container } = render(
      <MessagesShell list={<div>LIST</div>}>
        <div>THREAD</div>
      </MessagesShell>
    );

    expect(screen.getByText("Messages")).toBeInTheDocument();
    expect(screen.getByText("LIST")).toBeInTheDocument();

    const aside = container.querySelector("aside")!;
    expect(aside.className).toContain("block");
    const section = container.querySelector("section")!;
    expect(section.className).toContain("hidden");
  });

  it("shows the thread pane when inside a thread", () => {
    usePathnameMock.mockReturnValue("/messages/c1");

    const { container } = render(
      <MessagesShell list={<div>LIST</div>}>
        <div>THREAD</div>
      </MessagesShell>
    );

    const aside = container.querySelector("aside")!;
    expect(aside.className).toContain("hidden");
    const section = container.querySelector("section")!;
    expect(section.className).toContain("block");
    expect(screen.getByText("THREAD")).toBeInTheDocument();
  });
});
