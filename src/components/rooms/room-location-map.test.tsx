const resolvedTheme = { value: "light" };
jest.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: resolvedTheme.value }),
}));

import { render, screen } from "@test/render";
import { RoomLocationMap } from "./room-location-map";

describe("RoomLocationMap", () => {
  it("renders the map and marker in light theme", () => {
    resolvedTheme.value = "light";
    render(<RoomLocationMap latitude={-34.6} longitude={-58.4} />);
    expect(screen.getByTestId("map")).toBeInTheDocument();
    expect(screen.getByTestId("marker")).toBeInTheDocument();
  });

  it("renders in dark theme", () => {
    resolvedTheme.value = "dark";
    render(<RoomLocationMap latitude={-34.6} longitude={-58.4} />);
    expect(screen.getByTestId("map")).toBeInTheDocument();
  });
});
