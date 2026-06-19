import { screen } from "@testing-library/react";
import { renderAsync } from "@test/render";
import type { Message, Profile } from "@/lib/types";

jest.mock("@/lib/data/auth", () => ({ requireProfile: jest.fn() }));
jest.mock("@/lib/data/messages", () => ({
  getMessages: jest.fn(),
  getConversationParticipants: jest.fn(),
}));

import { requireProfile } from "@/lib/data/auth";
import {
  getMessages,
  getConversationParticipants,
} from "@/lib/data/messages";
import ConversationPage from "./page";

const requireProfileMock = requireProfile as jest.MockedFunction<
  typeof requireProfile
>;
const getMessagesMock = getMessages as jest.MockedFunction<typeof getMessages>;
const getParticipantsMock =
  getConversationParticipants as jest.MockedFunction<
    typeof getConversationParticipants
  >;

const participant = (id: string, full_name: string | null = "Ada"): Profile =>
  ({
    id,
    full_name,
    username: "ada",
    avatar_url: null,
  }) as unknown as Profile;

const message = (id: string): Message =>
  ({
    id,
    conversation_id: "conv1",
    sender_id: "u1",
    body: "hi there",
    created_at: "2026-07-01T18:00:00.000Z",
  }) as unknown as Message;

const props = () => ({
  params: Promise.resolve({ conversationId: "conv1" }),
});

beforeEach(() => {
  jest.clearAllMocks();
  requireProfileMock.mockResolvedValue({ id: "u1" } as never);
});

it("calls notFound when the user is not a participant", async () => {
  getParticipantsMock.mockResolvedValue([participant("other")]);

  await expect(renderAsync(ConversationPage(props()))).rejects.toThrow(
    "NEXT_NOT_FOUND"
  );
});

it("renders the thread with the other participant", async () => {
  getParticipantsMock.mockResolvedValue([
    participant("u1", "Me"),
    participant("other", "Ada Lovelace"),
  ]);
  getMessagesMock.mockResolvedValue([message("m1")]);

  await renderAsync(ConversationPage(props()));

  expect(screen.getByText("hi there")).toBeInTheDocument();
});

it("renders the thread with no other participant (other defaults to null)", async () => {
  // Only the current user is a participant -> `find` returns undefined -> null.
  getParticipantsMock.mockResolvedValue([participant("u1", "Me")]);
  getMessagesMock.mockResolvedValue([]);

  await renderAsync(ConversationPage(props()));

  expect(getMessagesMock).toHaveBeenCalledWith("conv1");
});
