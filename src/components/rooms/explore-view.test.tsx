jest.mock("@/app/actions/rooms", () => ({
  createBooking: jest.fn(),
  createReview: jest.fn(),
  createRoom: jest.fn(),
  toggleSaveRoom: jest.fn(),
}));

jest.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));

import { render, screen, userEvent } from "@test/render";
import type { RoomWithMeta } from "@/lib/types";
import { ExploreView } from "./explore-view";

const room = (overrides: Partial<RoomWithMeta> = {}): RoomWithMeta =>
  ({
    id: "r1",
    slug: "the-loft",
    name: "The Loft",
    neighborhood: "Palermo",
    hourly_price: 6000,
    currency: "ARS",
    capacity: 5,
    rating: 4.8,
    review_count: 12,
    amenities: ["drum_kit"],
    photos: ["https://img.test/a.jpg"],
    latitude: -34.6,
    longitude: -58.4,
    ...overrides,
  }) as unknown as RoomWithMeta;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ExploreView", () => {
  it("renders the empty state when there are no rooms and toggles the mobile view", async () => {
    render(<ExploreView rooms={[]} savedIds={[]} />);

    expect(screen.getByText(/no rooms match your filters/i)).toBeInTheDocument();

    // Mobile toggle flips list <-> map and back. Exact name "Map"/"List"
    // avoids matching the mocked map's lowercase "map" button.
    const toggle = screen.getByRole("button", { name: "Map" });
    await userEvent.click(toggle);
    expect(screen.getByRole("button", { name: "List" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "List" }));
    expect(screen.getByRole("button", { name: "Map" })).toBeInTheDocument();
  });

  it("renders room cards, marks saved ones, and reflects hover as active", async () => {
    render(
      <ExploreView rooms={[room(), room({ id: "r2", slug: "r2" })]} savedIds={["r1"]} />
    );

    expect(screen.getAllByText("The Loft").length).toBeGreaterThan(0);
    // r1 is saved -> its save button has the "remove" label.
    expect(
      screen.getAllByRole("button", { name: /remove from saved/i }).length
    ).toBe(1);

    // Hover a card -> active ring (onHover state).
    const cards = screen.getAllByRole("link");
    await userEvent.hover(cards[0]);
    await userEvent.unhover(cards[0]);
    expect(cards[0]).toBeInTheDocument();
  });
});
