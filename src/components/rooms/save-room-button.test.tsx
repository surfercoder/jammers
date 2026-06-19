jest.mock("@/app/actions/rooms", () => ({
  createBooking: jest.fn(),
  createReview: jest.fn(),
  createRoom: jest.fn(),
  toggleSaveRoom: jest.fn(),
}));

import { render, screen, userEvent } from "@test/render";
import { toggleSaveRoom } from "@/app/actions/rooms";
import { SaveRoomButton } from "./save-room-button";

const toggleMock = toggleSaveRoom as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SaveRoomButton", () => {
  it("toggles from unsaved to saved", async () => {
    toggleMock.mockResolvedValue({ ok: true });
    render(<SaveRoomButton roomId="r1" initialSaved={false} />);

    const btn = screen.getByRole("button", { name: /save room/i });
    await userEvent.click(btn);

    expect(toggleMock).toHaveBeenCalledWith("r1", false);
    expect(
      await screen.findByRole("button", { name: /remove from saved/i })
    ).toBeInTheDocument();
  });

  it("toggles from saved to unsaved", async () => {
    toggleMock.mockResolvedValue({ ok: true });
    render(<SaveRoomButton roomId="r2" initialSaved={true} className="extra" />);

    await userEvent.click(
      screen.getByRole("button", { name: /remove from saved/i })
    );

    expect(toggleMock).toHaveBeenCalledWith("r2", true);
    expect(
      await screen.findByRole("button", { name: /save room/i })
    ).toBeInTheDocument();
  });

  it("reverts the optimistic state when the action errors", async () => {
    toggleMock.mockResolvedValue({ error: "boom" });
    render(<SaveRoomButton roomId="r3" initialSaved={false} />);

    await userEvent.click(screen.getByRole("button", { name: /save room/i }));

    // Optimistically flipped to saved, then reverted back to unsaved on error.
    expect(
      await screen.findByRole("button", { name: /save room/i })
    ).toBeInTheDocument();
  });
});
