jest.mock("@/app/actions/rooms", () => ({
  createBooking: jest.fn(),
  createReview: jest.fn(),
  createRoom: jest.fn(),
  toggleSaveRoom: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

import { render, screen, userEvent, waitFor } from "@test/render";
import { toast } from "sonner";
import { createBooking } from "@/app/actions/rooms";
import { BookingWidget } from "./booking-widget";

const createBookingMock = createBooking as jest.Mock;
const toastSuccess = toast.success as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("BookingWidget", () => {
  it("renders the price, total and lets the user change the duration", async () => {
    render(<BookingWidget roomId="r1" hourlyPrice={6000} currency="ARS" />);

    // Default 2 hours -> total line present.
    expect(screen.getByText(/× 2h/)).toBeInTheDocument();

    // Change the duration select.
    const triggers = screen.getAllByRole("combobox");
    await userEvent.click(triggers[1]);
    await userEvent.click(await screen.findByRole("option", { name: "1 hour" }));

    expect(screen.getByText(/× 1h/)).toBeInTheDocument();
  });

  it("shows a success toast when the booking succeeds", async () => {
    createBookingMock.mockResolvedValue({ ok: true });

    render(<BookingWidget roomId="r1" hourlyPrice={6000} currency="ARS" />);
    // The date input is `required`; fill it so jsdom doesn't block submission.
    await userEvent.type(screen.getByLabelText("Date"), "2026-07-01");
    await userEvent.click(
      screen.getByRole("button", { name: /request booking/i })
    );

    await waitFor(() =>
      expect(toastSuccess).toHaveBeenCalledWith(
        expect.stringMatching(/booking request sent/i)
      )
    );
  });

  it("renders form and field errors returned by the action", async () => {
    createBookingMock.mockResolvedValue({
      error: "Room not found.",
      fieldErrors: { date: ["Pick a date"] },
    });

    render(<BookingWidget roomId="r1" hourlyPrice={6000} currency="ARS" />);
    await userEvent.type(screen.getByLabelText("Date"), "2026-07-01");
    await userEvent.click(
      screen.getByRole("button", { name: /request booking/i })
    );

    expect(await screen.findByText("Room not found.")).toBeInTheDocument();
    expect(screen.getByText("Pick a date")).toBeInTheDocument();
    expect(toastSuccess).not.toHaveBeenCalled();
  });
});
