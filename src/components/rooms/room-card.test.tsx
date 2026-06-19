jest.mock("@/app/actions/rooms", () => ({
  createBooking: jest.fn(),
  createReview: jest.fn(),
  createRoom: jest.fn(),
  toggleSaveRoom: jest.fn(),
}));

import { render, screen, userEvent } from "@test/render";
import type { RoomWithMeta } from "@/lib/types";
import { RoomCard } from "./room-card";

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
    amenities: ["drum_kit", "pa_system", "guitar_amp", "wifi"],
    photos: ["https://img.test/a.jpg"],
    latitude: -34.6,
    longitude: -58.4,
    ...overrides,
  }) as unknown as RoomWithMeta;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("RoomCard", () => {
  it("renders rating, capacity, the first three amenities and a +N overflow badge", () => {
    render(<RoomCard room={room()} active saved showSave />);

    expect(screen.getByText("The Loft")).toBeInTheDocument();
    expect(screen.getByText("4.8")).toBeInTheDocument();
    expect(screen.getByText("(12)")).toBeInTheDocument();
    expect(screen.getByText("Palermo")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Drum kit")).toBeInTheDocument();
    // 4 amenities -> 3 shown + "+1" overflow.
    expect(screen.getByText("+1")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "The Loft" })).toBeInTheDocument();
    // showSave true mounts the save button (saved -> "remove" label).
    expect(
      screen.getByRole("button", { name: /remove from saved/i })
    ).toBeInTheDocument();
  });

  it("omits rating, capacity, overflow, save button and image when absent", () => {
    render(
      <RoomCard
        room={room({
          rating: null,
          capacity: null,
          amenities: ["drum_kit"],
          photos: [],
        })}
        showSave={false}
      />
    );

    expect(screen.queryByText("4.8")).not.toBeInTheDocument();
    expect(screen.queryByText("+1")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /save room/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("invokes onHover on mouse enter and leave", async () => {
    const onHover = jest.fn();
    render(<RoomCard room={room()} onHover={onHover} />);

    const link = screen.getByRole("link");
    await userEvent.hover(link);
    await userEvent.unhover(link);

    expect(onHover).toHaveBeenCalledWith("r1");
    expect(onHover).toHaveBeenCalledWith(null);
  });

  it("does not throw when onHover is not provided", async () => {
    render(<RoomCard room={room()} />);
    const link = screen.getByRole("link");
    await userEvent.hover(link);
    await userEvent.unhover(link);
    expect(link).toBeInTheDocument();
  });
});
