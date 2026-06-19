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
import { createReview } from "@/app/actions/rooms";
import { ReviewForm } from "./review-form";

const createReviewMock = createReview as jest.Mock;
const toastSuccess = toast.success as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ReviewForm", () => {
  it("lets the user hover and pick a star rating", async () => {
    render(<ReviewForm roomId="r1" />);

    const star3 = screen.getByRole("button", { name: "3 stars" });
    // Hover then leave exercises the hover state branches.
    await userEvent.hover(star3);
    await userEvent.unhover(star3);
    await userEvent.click(star3);

    const rating = document.querySelector<HTMLInputElement>(
      'input[name="rating"]'
    );
    expect(rating?.value).toBe("3");
  });

  it("shows a success toast when the review posts", async () => {
    createReviewMock.mockResolvedValue({ ok: true });

    render(<ReviewForm roomId="r1" />);
    await userEvent.click(screen.getByRole("button", { name: /post review/i }));

    await waitFor(() =>
      expect(toastSuccess).toHaveBeenCalledWith(
        expect.stringMatching(/thanks for your review/i)
      )
    );
  });

  it("renders an error returned by the action", async () => {
    createReviewMock.mockResolvedValue({ error: "Already reviewed" });

    render(<ReviewForm roomId="r1" />);
    await userEvent.click(screen.getByRole("button", { name: /post review/i }));

    expect(await screen.findByText("Already reviewed")).toBeInTheDocument();
    expect(toastSuccess).not.toHaveBeenCalled();
  });
});
