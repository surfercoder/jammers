import { screen } from "@testing-library/react";
import { renderAsync } from "@test/render";
import type { ConversationSummary, Profile } from "@/lib/types";

jest.mock("@/lib/data/auth", () => ({ requireProfile: jest.fn() }));
jest.mock("@/lib/data/messages", () => ({ getConversations: jest.fn() }));

import { requireProfile } from "@/lib/data/auth";
import { getConversations } from "@/lib/data/messages";
import MessagesLayout from "./layout";

const requireProfileMock = requireProfile as jest.MockedFunction<
  typeof requireProfile
>;
const getConversationsMock = getConversations as jest.MockedFunction<
  typeof getConversations
>;

beforeEach(() => {
  jest.clearAllMocks();
});

it("loads the profile + conversations and renders the shell with children", async () => {
  requireProfileMock.mockResolvedValue({ id: "u1" } as unknown as Profile);
  getConversationsMock.mockResolvedValue([] as unknown as ConversationSummary[]);

  await renderAsync(
    MessagesLayout({ children: <div>messages child</div> })
  );

  expect(getConversationsMock).toHaveBeenCalledWith("u1");
  expect(screen.getByText("messages child")).toBeInTheDocument();
});
