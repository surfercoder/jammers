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

import { render, screen, userEvent } from "@test/render";
import { createRoom } from "@/app/actions/rooms";
import { RoomForm } from "./room-form";

const createRoomMock = createRoom as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  resolvedTheme.value = "light";
});

describe("RoomForm", () => {
  it("renders fields, the map and amenity chips (light theme)", () => {
    render(<RoomForm />);
    expect(screen.getByLabelText("Room name")).toBeInTheDocument();
    expect(screen.getByTestId("map")).toBeInTheDocument();
    expect(screen.getByText("Drum kit")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /publish room/i })
    ).toBeInTheDocument();
  });

  it("updates the pin via a map click (dark theme)", async () => {
    resolvedTheme.value = "dark";
    const { container } = render(<RoomForm />);

    await userEvent.click(screen.getByTestId("map-click"));

    const lat = container.querySelector<HTMLInputElement>(
      'input[name="latitude"]'
    );
    const lng = container.querySelector<HTMLInputElement>(
      'input[name="longitude"]'
    );
    expect(lat?.value).toBe("-34.6");
    expect(lng?.value).toBe("-58.38");
  });

  it("renders field errors returned by the action on submit", async () => {
    createRoomMock.mockResolvedValue({
      fieldErrors: {
        name: ["Name required"],
        hourly_price: ["Bad price"],
        capacity: ["Bad capacity"],
        photos: ["Bad url"],
      },
    });

    render(<RoomForm />);
    // The name input is `required`; fill it so jsdom submits the form.
    await userEvent.type(screen.getByLabelText("Room name"), "My Studio");
    await userEvent.click(
      screen.getByRole("button", { name: /publish room/i })
    );

    expect(await screen.findByText("Name required")).toBeInTheDocument();
    expect(screen.getByText("Bad price")).toBeInTheDocument();
    expect(screen.getByText("Bad capacity")).toBeInTheDocument();
    expect(screen.getByText("Bad url")).toBeInTheDocument();
  });

  it("renders a form-level error returned by the action", async () => {
    createRoomMock.mockResolvedValue({ error: "Something broke" });

    render(<RoomForm />);
    await userEvent.type(screen.getByLabelText("Room name"), "My Studio");
    await userEvent.click(
      screen.getByRole("button", { name: /publish room/i })
    );

    expect(await screen.findByText("Something broke")).toBeInTheDocument();
  });
});
