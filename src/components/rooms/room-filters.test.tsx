import { render, screen, userEvent } from "@test/render";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { RoomFilters } from "./room-filters";

const useRouterMock = useRouter as jest.Mock;
const useSearchParamsMock = useSearchParams as jest.Mock;
const usePathnameMock = usePathname as jest.Mock;

const replace = jest.fn();

function lastReplacedParams(): URLSearchParams {
  const url = replace.mock.calls.at(-1)?.[0] as string;
  return new URLSearchParams(url.split("?")[1] ?? "");
}

beforeEach(() => {
  jest.clearAllMocks();
  replace.mockReset();
  useRouterMock.mockReturnValue({ replace });
  usePathnameMock.mockReturnValue("/explore");
  useSearchParamsMock.mockReturnValue(new URLSearchParams());
});

describe("RoomFilters", () => {
  it("singularises the result count for one room", () => {
    render(<RoomFilters resultCount={1} />);
    expect(screen.getByText("1 room available")).toBeInTheDocument();
  });

  it("sets the q param when typing and deletes it when cleared", async () => {
    render(<RoomFilters resultCount={3} />);
    expect(screen.getByText("3 rooms available")).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/search rooms/i);
    await userEvent.type(input, "l");
    expect(lastReplacedParams().get("q")).toBe("l");

    await userEvent.clear(input);
    expect(lastReplacedParams().has("q")).toBe(false);
  });

  it("toggles a neighborhood on and off", async () => {
    render(<RoomFilters resultCount={3} />);

    await userEvent.click(screen.getByRole("button", { name: /^area$/i }));
    const palermo = await screen.findByRole("checkbox", { name: "Palermo" });

    await userEvent.click(palermo);
    expect(lastReplacedParams().getAll("hood")).toContain("Palermo");
  });

  it("toggles an amenity", async () => {
    render(<RoomFilters resultCount={3} />);

    await userEvent.click(screen.getByRole("button", { name: /gear/i }));
    const drumKit = await screen.findByRole("checkbox", { name: "Drum kit" });

    await userEvent.click(drumKit);
    expect(lastReplacedParams().getAll("amenity")).toContain("drum_kit");
  });

  it("removes a value already present via toggleMulti", async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("hood=Palermo"));
    render(<RoomFilters resultCount={3} />);

    // Active count badge shows the preselected hood.
    expect(screen.getByText("1")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /area/i }));
    const palermo = await screen.findByRole("checkbox", { name: "Palermo" });
    await userEvent.click(palermo);

    expect(lastReplacedParams().getAll("hood")).not.toContain("Palermo");
  });

  it("sets the price via the slider (set branch)", async () => {
    render(<RoomFilters resultCount={3} />);

    await userEvent.click(screen.getByRole("button", { name: /price/i }));
    const slider = await screen.findByRole("slider");
    slider.focus();
    // ArrowRight increases by one step (1000), exercising the set branch.
    await userEvent.keyboard("{ArrowRight}");
    expect(Number(lastReplacedParams().get("priceMax"))).toBeGreaterThan(0);
  });

  it("clears the price when the slider returns to zero (delete branch)", async () => {
    // Preselect a price so the controlled slider sits above zero.
    useSearchParamsMock.mockReturnValue(new URLSearchParams("priceMax=1000"));
    render(<RoomFilters resultCount={3} />);

    await userEvent.click(screen.getByRole("button", { name: /price/i }));
    const slider = await screen.findByRole("slider");
    slider.focus();
    // ArrowLeft back to 0 exercises the delete branch.
    await userEvent.keyboard("{ArrowLeft}");
    expect(lastReplacedParams().has("priceMax")).toBe(false);
  });

  it("shows preselected price label/value and the clear button which resets filters", async () => {
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams("priceMax=10000&hood=Palermo&amenity=drum_kit")
    );
    render(<RoomFilters resultCount={3} />);

    // priceMax set -> active count includes it, "Clear" button visible.
    const clear = screen.getByRole("button", { name: /clear/i });
    await userEvent.click(clear);

    const params = lastReplacedParams();
    expect(params.has("hood")).toBe(false);
    expect(params.has("amenity")).toBe(false);
    expect(params.has("priceMax")).toBe(false);
  });
});
