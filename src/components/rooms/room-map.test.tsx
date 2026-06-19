jest.mock("@/app/actions/rooms", () => ({
  createBooking: jest.fn(),
  createReview: jest.fn(),
  createRoom: jest.fn(),
  toggleSaveRoom: jest.fn(),
}));

const resolvedTheme = { value: "light" };
jest.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: resolvedTheme.value }),
}));

// Extend the global react-map-gl/maplibre mock so the Popup exposes its
// `onClose` handler through a clickable button (the default mock drops it).
// We spread the project's manual mock and only override Popup.
jest.mock("react-map-gl/maplibre", () => {
  const manualMock = jest.requireActual(
    "../../../__mocks__/react-map-gl/maplibre"
  );
  return {
    ...manualMock,
    __esModule: true,
    Popup: ({
      children,
      onClose,
    }: {
      children?: React.ReactNode;
      onClose?: () => void;
    }) => (
      <div data-testid="popup">
        <button type="button" data-testid="popup-close" onClick={onClose}>
          close
        </button>
        {children}
      </div>
    ),
  };
});

import { render, screen, userEvent } from "@test/render";
import type { RoomWithMeta } from "@/lib/types";
import { RoomMap } from "./room-map";

const room = (overrides: Partial<RoomWithMeta> = {}): RoomWithMeta =>
  ({
    id: "r1",
    slug: "the-loft",
    name: "The Loft",
    neighborhood: "Palermo",
    hourly_price: 6000,
    currency: "ARS",
    photos: ["https://img.test/a.jpg"],
    latitude: -34.6,
    longitude: -58.4,
    ...overrides,
  }) as unknown as RoomWithMeta;

beforeEach(() => {
  resolvedTheme.value = "light";
});

describe("RoomMap", () => {
  it("renders markers and fires hover/select callbacks", async () => {
    const onHover = jest.fn();
    const onSelect = jest.fn();
    render(
      <RoomMap
        rooms={[room()]}
        hoveredId={null}
        selectedId={null}
        onHover={onHover}
        onSelect={onSelect}
      />
    );

    const marker = screen.getByRole("button", { name: /ARS/ });
    await userEvent.hover(marker);
    await userEvent.unhover(marker);
    await userEvent.click(marker);

    expect(onHover).toHaveBeenCalledWith("r1");
    expect(onHover).toHaveBeenCalledWith(null);
    expect(onSelect).toHaveBeenCalledWith("r1");
    // No room selected -> no popup.
    expect(screen.queryByTestId("popup")).not.toBeInTheDocument();
  });

  it("renders the active marker state and a popup (with photo) for the selected room", async () => {
    const onSelect = jest.fn();
    render(
      <RoomMap
        rooms={[room()]}
        hoveredId="r1"
        selectedId="r1"
        onHover={jest.fn()}
        onSelect={onSelect}
      />
    );

    expect(screen.getByTestId("popup")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "The Loft" })).toBeInTheDocument();
    expect(screen.getByText("The Loft")).toBeInTheDocument();

    // Closing the popup clears the selection (covers Popup onClose).
    await userEvent.click(screen.getByTestId("popup-close"));
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it("renders a popup without a photo when the selected room has none, in dark theme", () => {
    resolvedTheme.value = "dark";
    render(
      <RoomMap
        rooms={[room({ photos: [] })]}
        hoveredId={null}
        selectedId="r1"
        onHover={jest.fn()}
        onSelect={jest.fn()}
      />
    );

    expect(screen.getByTestId("popup")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
