jest.mock("@/utils/supabase/client", () => ({ createClient: jest.fn() }));
jest.mock("@/app/actions/messages", () => ({ sendMessage: jest.fn() }));

import { render, screen, userEvent, act, waitFor } from "@test/render";
import { createClient } from "@/utils/supabase/client";
import { sendMessage } from "@/app/actions/messages";
import { createSupabaseMock, type SupabaseMock } from "@test/supabase";
import type { Message, Profile } from "@/lib/types";
import { MessageThread } from "./message-thread";

const createClientMock = createClient as jest.Mock;
const sendMessageMock = sendMessage as jest.Mock;

function message(overrides: Partial<Message> = {}): Message {
  return {
    id: "m1",
    conversation_id: "c1",
    sender_id: "u1",
    body: "Hello",
    created_at: "2026-06-19T00:00:00.000Z",
    ...overrides,
  } as unknown as Message;
}

const other: Profile = {
  id: "u2",
  username: "ada",
  full_name: "Ada Lovelace",
  avatar_url: "https://img.test/a.jpg",
} as unknown as Profile;

let sb: SupabaseMock;

beforeEach(() => {
  jest.clearAllMocks();
  sb = createSupabaseMock({ user: { id: "u1" } });
  createClientMock.mockReturnValue(sb);
  sendMessageMock.mockResolvedValue(undefined);
});

describe("MessageThread", () => {
  it("renders the empty state and other-null header branch", () => {
    render(
      <MessageThread
        conversationId="c1"
        initialMessages={[]}
        currentUserId="u1"
        other={null}
      />
    );

    expect(screen.getByText(/Say hi/)).toBeInTheDocument();
    // No other → no profile link in the header.
    expect(
      screen.queryByRole("link", { name: /Ada Lovelace/i })
    ).not.toBeInTheDocument();
  });

  it("renders the header with the other participant and mine/theirs bubbles", () => {
    render(
      <MessageThread
        conversationId="c1"
        initialMessages={[
          message({ id: "m1", sender_id: "u1", body: "mine" }),
          message({ id: "m2", sender_id: "u2", body: "theirs" }),
        ]}
        currentUserId="u1"
        other={other}
      />
    );

    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("mine")).toBeInTheDocument();
    expect(screen.getByText("theirs")).toBeInTheDocument();
  });

  it("falls back to username when the other has no full name", () => {
    render(
      <MessageThread
        conversationId="c1"
        initialMessages={[]}
        currentUserId="u1"
        other={{ ...other, full_name: null, avatar_url: null } as Profile}
      />
    );

    expect(screen.getByText("ada")).toBeInTheDocument();
  });

  it("appends realtime inserts and ignores duplicates", async () => {
    render(
      <MessageThread
        conversationId="c1"
        initialMessages={[message({ id: "m1", body: "first" })]}
        currentUserId="u1"
        other={other}
      />
    );

    // A new message id is appended.
    act(() => {
      sb.__channel.__emit({
        new: message({ id: "m2", sender_id: "u2", body: "incoming" }),
      });
    });
    expect(await screen.findByText("incoming")).toBeInTheDocument();

    // Emitting an existing id is a no-op (dedupe branch).
    act(() => {
      sb.__channel.__emit({
        new: message({ id: "m2", sender_id: "u2", body: "incoming" }),
      });
    });
    expect(screen.getAllByText("incoming")).toHaveLength(1);
  });

  it("removes the channel on unmount", () => {
    const { unmount } = render(
      <MessageThread
        conversationId="c1"
        initialMessages={[]}
        currentUserId="u1"
        other={other}
      />
    );

    unmount();
    expect(sb.removeChannel).toHaveBeenCalledWith(sb.__channel);
  });

  it("sends a message, clearing the input on success", async () => {
    const user = userEvent.setup();
    render(
      <MessageThread
        conversationId="c1"
        initialMessages={[]}
        currentUserId="u1"
        other={other}
      />
    );

    const input = screen.getByPlaceholderText(/Write a message/i);
    await user.type(input, "  hey there  ");
    await user.click(screen.getByRole("button", { name: "" }));

    await waitFor(() =>
      expect(sendMessageMock).toHaveBeenCalledWith("c1", "hey there")
    );
    expect(input).toHaveValue("");
  });

  it("restores the input value when sending fails", async () => {
    sendMessageMock.mockResolvedValue({ error: "boom" });
    const user = userEvent.setup();
    render(
      <MessageThread
        conversationId="c1"
        initialMessages={[]}
        currentUserId="u1"
        other={other}
      />
    );

    const input = screen.getByPlaceholderText(/Write a message/i);
    await user.type(input, "oops");
    await user.click(screen.getByRole("button", { name: "" }));

    await waitFor(() => expect(input).toHaveValue("oops"));
  });

  it("does nothing when submitting an empty message", async () => {
    const { container } = render(
      <MessageThread
        conversationId="c1"
        initialMessages={[]}
        currentUserId="u1"
        other={other}
      />
    );

    // Submit the form directly (button is disabled when empty) to hit the
    // early-return guard.
    const form = container.querySelector("form")!;
    await act(async () => {
      form.requestSubmit();
    });

    expect(sendMessageMock).not.toHaveBeenCalled();
  });
});
