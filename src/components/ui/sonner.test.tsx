import { render } from "@test/render";

const useThemeMock = jest.fn();

jest.mock("next-themes", () => ({
  useTheme: () => useThemeMock(),
}));

import { Toaster } from "./sonner";

afterEach(() => {
  useThemeMock.mockReset();
});

it("renders with an explicit theme", () => {
  useThemeMock.mockReturnValue({ theme: "dark" });
  const { container } = render(<Toaster />);
  expect(container).toBeInTheDocument();
});

it("falls back to system when theme is undefined", () => {
  useThemeMock.mockReturnValue({ theme: undefined });
  const { container } = render(<Toaster />);
  expect(container).toBeInTheDocument();
});
