import { screen } from "@testing-library/react";
import { renderAsync } from "@test/render";

jest.mock("@/lib/data/auth", () => ({ requireProfile: jest.fn() }));

import { requireProfile } from "@/lib/data/auth";
import NewRoomPage from "./page";

const requireProfileMock = requireProfile as jest.MockedFunction<
  typeof requireProfile
>;

beforeEach(() => {
  jest.clearAllMocks();
  requireProfileMock.mockResolvedValue({ id: "u1" } as never);
});

it("renders the new-room form and back link", async () => {
  await renderAsync(NewRoomPage());

  expect(
    screen.getByRole("heading", { name: "List a rehearsal room" })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /Back to your rooms/i })
  ).toBeInTheDocument();
  expect(requireProfileMock).toHaveBeenCalled();
});
