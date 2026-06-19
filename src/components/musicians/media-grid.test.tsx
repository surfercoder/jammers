import { render, screen } from "@test/render";
import type { Media } from "@/lib/types";
import { MediaGrid } from "./media-grid";

function media(overrides: Partial<Media> = {}): Media {
  return {
    id: "med1",
    type: "video",
    url: "https://youtube.com/watch?v=abcdefghijk",
    title: "Live set",
    ...overrides,
  } as unknown as Media;
}

describe("MediaGrid", () => {
  it("returns null when there are no videos", () => {
    const { container } = render(
      <MediaGrid media={[media({ id: "a", type: "audio" })]} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders a video iframe with its caption", () => {
    render(<MediaGrid media={[media()]} />);

    const iframe = screen.getByTitle("Live set");
    expect(iframe).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/abcdefghijk"
    );
    expect(screen.getByText("Live set")).toBeInTheDocument();
  });

  it("uses the fallback title and omits the caption when title is null", () => {
    const { container } = render(
      <MediaGrid media={[media({ id: "b", title: null })]} />
    );

    expect(screen.getByTitle("Performance")).toBeInTheDocument();
    expect(container.querySelector("figcaption")).toBeNull();
  });
});
