import { render, screen, userEvent, within } from "@test/render";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MusicianFilters } from "./musician-filters";

const useRouterMock = useRouter as jest.Mock;
const usePathnameMock = usePathname as jest.Mock;
const useSearchParamsMock = useSearchParams as jest.Mock;

const replace = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  useRouterMock.mockReturnValue({ replace });
  usePathnameMock.mockReturnValue("/musicians");
  useSearchParamsMock.mockReturnValue(new URLSearchParams());
});

function lastReplaceParams(): URLSearchParams {
  const url = replace.mock.calls.at(-1)![0] as string;
  return new URLSearchParams(url.split("?")[1] ?? "");
}

describe("MusicianFilters", () => {
  it("sets the search query", async () => {
    const user = userEvent.setup();
    render(<MusicianFilters />);

    const search = screen.getByPlaceholderText(/Search musicians/i);
    await user.type(search, "a");
    expect(lastReplaceParams().get("q")).toBe("a");
  });

  it("clears the search query when emptied (delete branch)", async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("q=ab"));
    const user = userEvent.setup();
    render(<MusicianFilters />);

    const search = screen.getByPlaceholderText(/Search musicians/i);
    await user.clear(search);
    expect(lastReplaceParams().has("q")).toBe(false);
  });

  it("turns the open-to-work switch on", async () => {
    const user = userEvent.setup();
    render(<MusicianFilters />);

    await user.click(screen.getByRole("switch"));
    expect(lastReplaceParams().get("open")).toBe("1");
  });

  it("turns the open-to-work switch off (delete branch)", async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("open=1"));
    const user = userEvent.setup();
    render(<MusicianFilters />);

    await user.click(screen.getByRole("switch"));
    expect(lastReplaceParams().has("open")).toBe(false);
  });

  it("adds an instrument chip (toggleMulti add branch)", async () => {
    const user = userEvent.setup();
    render(<MusicianFilters />);

    await user.click(screen.getByRole("button", { name: "Bass" }));
    expect(lastReplaceParams().getAll("instrument")).toContain("Bass");
  });

  it("removes an already-selected instrument chip (toggleMulti delete branch)", async () => {
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams("instrument=Bass&instrument=Keys")
    );
    const user = userEvent.setup();
    render(<MusicianFilters />);

    await user.click(screen.getByRole("button", { name: "Bass" }));
    const result = lastReplaceParams().getAll("instrument");
    expect(result).not.toContain("Bass");
    expect(result).toContain("Keys");
  });

  it("renders an active chip and toggles a genre", async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("genre=Funk"));
    const user = userEvent.setup();
    render(<MusicianFilters />);

    // Active genre chip carries the primary background styling.
    const funk = screen.getByRole("button", { name: "Funk" });
    expect(funk.className).toContain("bg-primary");
    await user.click(funk);
    expect(lastReplaceParams().getAll("genre")).not.toContain("Funk");
  });

  it("toggles an availability checkbox", async () => {
    const user = userEvent.setup();
    render(<MusicianFilters />);

    await user.click(screen.getByLabelText("Session work"));
    expect(lastReplaceParams().getAll("avail")).toContain("session");
  });

  it("sets the experience level", async () => {
    const user = userEvent.setup();
    render(<MusicianFilters />);

    await user.click(screen.getByLabelText("Beginner"));
    expect(lastReplaceParams().get("exp")).toBe("beginner");
  });

  it("clears the experience when the same level is re-clicked (delete branch)", async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("exp=beginner"));
    const user = userEvent.setup();
    render(<MusicianFilters />);

    await user.click(screen.getByLabelText("Beginner"));
    expect(lastReplaceParams().has("exp")).toBe(false);
  });

  it("switches to a different experience level", async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("exp=beginner"));
    const user = userEvent.setup();
    render(<MusicianFilters />);

    await user.click(screen.getByLabelText("Professional"));
    expect(lastReplaceParams().get("exp")).toBe("professional");
  });

  it("does not render the clear button when there are no filters", () => {
    render(<MusicianFilters />);

    expect(
      screen.queryByRole("button", { name: /Clear all filters/i })
    ).not.toBeInTheDocument();
  });

  it("clears all filters via the reset button", async () => {
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams("genre=Funk&instrument=Bass&avail=gigs&exp=beginner&open=1")
    );
    const user = userEvent.setup();
    render(<MusicianFilters />);

    const clear = screen.getByRole("button", { name: /Clear all filters/i });
    await user.click(clear);
    expect(replace).toHaveBeenLastCalledWith("/musicians");
  });

  it("shows the clear button when only the experience filter is set", () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("exp=beginner"));
    render(<MusicianFilters />);

    expect(
      screen.getByRole("button", { name: /Clear all filters/i })
    ).toBeInTheDocument();
  });

  it("preselects a checked availability checkbox", () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("avail=gigs"));
    render(<MusicianFilters />);

    const oneOff = within(
      screen.getByText("One-off gigs").closest("label")!
    ).getByRole("checkbox");
    expect(oneOff).toBeChecked();
  });
});
