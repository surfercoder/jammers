jest.mock("@/app/actions/rooms", () => ({ setBookingStatus: jest.fn() }));
jest.mock("@/app/actions/contracts", () => ({ setContractStatus: jest.fn() }));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

import { render, screen, userEvent } from "@test/render";
import { setBookingStatus } from "@/app/actions/rooms";
import { setContractStatus } from "@/app/actions/contracts";
import { toast } from "sonner";
import { RequestActions } from "./request-actions";

const setBookingStatusMock = setBookingStatus as jest.Mock;
const setContractStatusMock = setContractStatus as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("RequestActions", () => {
  it.each(["declined", "cancelled", "completed"])(
    "renders nothing for terminal status %s",
    (status) => {
      const { container } = render(
        <RequestActions
          id="b1"
          kind="booking"
          direction="incoming"
          status={status}
        />
      );
      expect(container).toBeEmptyDOMElement();
    }
  );

  it("accepts an incoming pending booking and shows a success toast", async () => {
    setBookingStatusMock.mockResolvedValue({ ok: true });

    render(
      <RequestActions
        id="b1"
        kind="booking"
        direction="incoming"
        status="pending"
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /accept/i }));

    expect(setBookingStatusMock).toHaveBeenCalledWith("b1", "accepted");
    expect(toast.success).toHaveBeenCalledWith("Accepted.");
  });

  it("declines an incoming pending booking", async () => {
    setBookingStatusMock.mockResolvedValue({ ok: true });

    render(
      <RequestActions
        id="b1"
        kind="booking"
        direction="incoming"
        status="pending"
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /decline/i }));

    expect(setBookingStatusMock).toHaveBeenCalledWith("b1", "declined");
    expect(toast.success).toHaveBeenCalledWith("Declined.");
  });

  it("marks an incoming accepted booking complete", async () => {
    setBookingStatusMock.mockResolvedValue({ ok: true });

    render(
      <RequestActions
        id="b1"
        kind="booking"
        direction="incoming"
        status="accepted"
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: /mark completed/i })
    );

    expect(setBookingStatusMock).toHaveBeenCalledWith("b1", "completed");
    expect(toast.success).toHaveBeenCalledWith("Marked complete.");
  });

  it("cancels an outgoing pending contract and shows an error toast", async () => {
    setContractStatusMock.mockResolvedValue({ error: "Nope" });

    render(
      <RequestActions
        id="c1"
        kind="contract"
        direction="outgoing"
        status="pending"
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: /cancel request/i })
    );

    expect(setContractStatusMock).toHaveBeenCalledWith("c1", "cancelled");
    expect(toast.error).toHaveBeenCalledWith("Nope");
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("renders no buttons for an outgoing accepted booking", () => {
    const { container } = render(
      <RequestActions
        id="b1"
        kind="booking"
        direction="outgoing"
        status="accepted"
      />
    );
    expect(container.querySelector("button")).toBeNull();
  });
});
