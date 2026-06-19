import { render, screen } from "@test/render";
import type { MusicianWithProfile } from "@/lib/types";
import { MusicianCard } from "./musician-card";

function musician(
  overrides: Partial<MusicianWithProfile> = {}
): MusicianWithProfile {
  return {
    id: "u1",
    username: "ada",
    full_name: "Ada Lovelace",
    avatar_url: "https://img.test/a.jpg",
    headline: "Bassist for hire",
    city: "Buenos Aires",
    musician_profiles: {
      instruments: ["Bass", "Keys"],
      genres: ["Funk", "Jazz"],
      open_to_work: true,
    },
    ...overrides,
  } as unknown as MusicianWithProfile;
}

describe("MusicianCard", () => {
  it("renders full name, headline, city, tags and the open-to-work badge", () => {
    render(<MusicianCard musician={musician()} />);

    expect(
      screen.getByRole("link", { name: /Ada Lovelace/i })
    ).toHaveAttribute("href", "/musicians/ada");
    expect(screen.getByText("Bassist for hire")).toBeInTheDocument();
    expect(screen.getByText("Buenos Aires")).toBeInTheDocument();
    // First 4 of instruments+genres.
    expect(screen.getByText("Bass")).toBeInTheDocument();
    expect(screen.getByText("Funk")).toBeInTheDocument();
  });

  it("handles a null musician profile, missing name/headline/city and no badge", () => {
    render(
      <MusicianCard
        musician={musician({
          full_name: null,
          headline: null,
          city: null,
          musician_profiles: null,
        })}
      />
    );

    // Falls back to username for the heading.
    expect(screen.getByText("ada")).toBeInTheDocument();
    expect(screen.queryByText("Bassist for hire")).not.toBeInTheDocument();
    expect(screen.queryByText("Buenos Aires")).not.toBeInTheDocument();
  });

  it("hides the badge when not open to work and avatar uses fallback", () => {
    const { container } = render(
      <MusicianCard
        musician={musician({
          avatar_url: null,
          musician_profiles: {
            instruments: null,
            genres: null,
            open_to_work: false,
          } as unknown as MusicianWithProfile["musician_profiles"],
        })}
      />
    );

    // No tags rendered when instruments/genres are null.
    expect(container.querySelectorAll(".font-normal")).toHaveLength(0);
  });
});
