jest.mock("@/app/actions/profile", () => ({
  addMedia: jest.fn(),
  deleteMedia: jest.fn(),
}));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

import { render, screen, userEvent, waitFor } from "@test/render";
import { addMedia, deleteMedia } from "@/app/actions/profile";
import { toast } from "sonner";
import type { Media } from "@/lib/types";
import { MediaManager } from "./media-manager";

const addMediaMock = addMedia as jest.Mock;
const deleteMediaMock = deleteMedia as jest.Mock;
const toastSuccessMock = toast.success as jest.Mock;

function media(overrides: Partial<Media> = {}): Media {
  return {
    id: "med1",
    type: "video",
    url: "https://youtube.com/watch?v=abcdefghijk",
    title: "Live set",
    ...overrides,
  } as unknown as Media;
}

beforeEach(() => {
  jest.clearAllMocks();
  // useActionState's initial pass leaves state empty; default the action.
  addMediaMock.mockResolvedValue({});
  deleteMediaMock.mockResolvedValue(undefined);
});

describe("MediaManager", () => {
  it("renders an empty form when there is no media", () => {
    render(<MediaManager media={[]} />);

    expect(screen.getByText("Performance videos")).toBeInTheDocument();
    expect(screen.queryByTitle("Live set")).not.toBeInTheDocument();
  });

  it("renders existing media with iframe and title, and the url fallback", () => {
    render(
      <MediaManager
        media={[media(), media({ id: "med2", title: null })]}
      />
    );

    expect(screen.getByTitle("Live set")).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/abcdefghijk"
    );
    // Second item without a title falls back to its url + "Video" iframe title.
    expect(screen.getByTitle("Video")).toBeInTheDocument();
    expect(
      screen.getByText("https://youtube.com/watch?v=abcdefghijk")
    ).toBeInTheDocument();
  });

  it("deletes a video and toasts on success", async () => {
    const user = userEvent.setup();
    render(<MediaManager media={[media()]} />);

    const deleteButton = screen
      .getByText("Live set")
      .closest("div")!
      .querySelector("button")!;
    await user.click(deleteButton);

    await waitFor(() => expect(deleteMediaMock).toHaveBeenCalledWith("med1"));
    await waitFor(() =>
      expect(toastSuccessMock).toHaveBeenCalledWith("Video removed.")
    );
  });

  it("toasts and resets the form when adding a video succeeds", async () => {
    addMediaMock.mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    render(<MediaManager media={[]} />);

    await user.type(
      screen.getByPlaceholderText(/youtube.com\/watch/i),
      "https://youtu.be/abcdefghijk"
    );
    await user.click(screen.getByRole("button", { name: /Add video/i }));

    await waitFor(() =>
      expect(toastSuccessMock).toHaveBeenCalledWith("Video added.")
    );
  });

  it("shows a form error when adding a video fails", async () => {
    addMediaMock.mockResolvedValue({ error: "Invalid URL" });
    const user = userEvent.setup();
    render(<MediaManager media={[]} />);

    await user.type(
      screen.getByPlaceholderText(/youtube.com\/watch/i),
      "not-a-url"
    );
    await user.click(screen.getByRole("button", { name: /Add video/i }));

    expect(await screen.findByText("Invalid URL")).toBeInTheDocument();
    expect(toastSuccessMock).not.toHaveBeenCalled();
  });
});
