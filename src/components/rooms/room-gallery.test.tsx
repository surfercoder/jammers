import { render, screen, userEvent, within } from "@test/render";
import { RoomGallery } from "./room-gallery";

describe("RoomGallery", () => {
  it("renders a placeholder when there are no photos", () => {
    const { container } = render(<RoomGallery photos={[]} name="Studio" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(container.querySelector(".bg-muted")).toBeInTheDocument();
  });

  it("renders a single photo with the full-width hero and no thumbs", () => {
    render(<RoomGallery photos={["https://img.test/0.jpg"]} name="Studio" />);
    // Only the hero button is present (no thumbnails from slice(1,5)).
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getByRole("img", { name: "Studio" })).toBeInTheDocument();
  });

  it("renders the hero plus up to four thumbnails and opens the lightbox", async () => {
    render(
      <RoomGallery
        photos={[
          "https://img.test/0.jpg",
          "https://img.test/1.jpg",
          "https://img.test/2.jpg",
          "https://img.test/3.jpg",
          "https://img.test/4.jpg",
          "https://img.test/5.jpg",
        ]}
        name="Studio"
      />
    );

    // 1 hero + 4 thumbs (slice 1..5 caps at four).
    expect(screen.getAllByRole("button")).toHaveLength(5);

    // Open the lightbox via the hero button (covers its onClick).
    await userEvent.click(screen.getByRole("img", { name: "Studio" }));

    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByRole("img", { name: "Studio" })
    ).toBeInTheDocument();

    // Close it (covers the Dialog onOpenChange handler).
    await userEvent.click(
      within(dialog).getByRole("button", { name: /close/i })
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Reopen via a thumbnail (covers the slice thumb onClick).
    await userEvent.click(screen.getByRole("img", { name: "Studio 3" }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });
});
