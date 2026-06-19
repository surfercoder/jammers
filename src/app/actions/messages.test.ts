import { createSupabaseMock, createQuery } from "@test/supabase";
import { revalidatePath } from "next/cache";

jest.mock("@/utils/supabase/server", () => ({ createClient: jest.fn() }));
import { createClient } from "@/utils/supabase/server";
import { startConversation, sendMessage } from "./messages";

const mockedCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

function useClient(mock: ReturnType<typeof createSupabaseMock>) {
  mockedCreateClient.mockResolvedValue(mock as never);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("startConversation", () => {
  it("redirects to /sign-in when there is no user", async () => {
    useClient(createSupabaseMock({ user: null }));
    await expect(startConversation("other")).rejects.toThrow(
      "NEXT_REDIRECT:/sign-in"
    );
  });

  it("redirects to /messages when starting with yourself", async () => {
    useClient(createSupabaseMock({ user: { id: "u1" } }));
    await expect(startConversation("u1")).rejects.toThrow(
      "NEXT_REDIRECT:/messages"
    );
  });

  it("redirects to an existing shared conversation", async () => {
    const from = (table: string) => {
      if (table === "conversation_participants") {
        // First call (mine) returns one id; second call (shared) returns a match.
        // Distinguish by whether `.in` is used — but the helper is stateless,
        // so return data that satisfies both: `mine` maps conversation_id,
        // `shared` checks length.
        return createQuery({
          data: [{ conversation_id: "conv-shared" }],
          error: null,
        });
      }
      return createQuery();
    };
    useClient(createSupabaseMock({ user: { id: "u1" }, from }));
    await expect(startConversation("other")).rejects.toThrow(
      "NEXT_REDIRECT:/messages/conv-shared"
    );
  });

  it("throws the supabase error when conversation creation fails", async () => {
    const from = (table: string) => {
      if (table === "conversation_participants") {
        return createQuery({ data: [], error: null });
      }
      if (table === "conversations") {
        return createQuery({ data: null, error: { message: "kaboom" } });
      }
      return createQuery();
    };
    useClient(createSupabaseMock({ user: { id: "u1" }, from }));
    await expect(startConversation("other")).rejects.toMatchObject({
      message: "kaboom",
    });
  });

  it("throws a fallback error when creation returns no row and no error", async () => {
    const from = (table: string) => {
      if (table === "conversation_participants") {
        return createQuery({ data: [], error: null });
      }
      if (table === "conversations") {
        return createQuery({ data: null, error: null });
      }
      return createQuery();
    };
    useClient(createSupabaseMock({ user: { id: "u1" }, from }));
    await expect(startConversation("other")).rejects.toThrow(
      "Could not start conversation"
    );
  });

  it("creates a new conversation, adds participants and redirects", async () => {
    const partsQuery = createQuery({ data: [], error: null });
    const convQuery = createQuery({ data: { id: "new-conv" }, error: null });
    const from = (table: string) => {
      if (table === "conversation_participants") return partsQuery;
      if (table === "conversations") return convQuery;
      return createQuery();
    };
    const supabase = createSupabaseMock({ user: { id: "u1" }, from });
    useClient(supabase);
    await expect(startConversation("other")).rejects.toThrow(
      "NEXT_REDIRECT:/messages/new-conv"
    );
    expect(partsQuery.insert).toHaveBeenCalledWith([
      { conversation_id: "new-conv", profile_id: "u1" },
      { conversation_id: "new-conv", profile_id: "other" },
    ]);
  });

  it("creates a conversation when the user has no existing conversations", async () => {
    // `mine` returns null so `myIds.length` is 0 and the shared-lookup is skipped.
    const convQuery = createQuery({ data: { id: "fresh" }, error: null });
    const from = (table: string) => {
      if (table === "conversation_participants") {
        return createQuery({ data: null, error: null });
      }
      if (table === "conversations") return convQuery;
      return createQuery();
    };
    useClient(createSupabaseMock({ user: { id: "u1" }, from }));
    await expect(startConversation("other")).rejects.toThrow(
      "NEXT_REDIRECT:/messages/fresh"
    );
  });

  it("creates a conversation when a shared lookup finds nothing", async () => {
    // `mine` has ids, but the shared query returns null → falls through to create.
    let call = 0;
    const convQuery = createQuery({ data: { id: "made" }, error: null });
    const from = (table: string) => {
      if (table === "conversation_participants") {
        call += 1;
        if (call === 1) {
          return createQuery({
            data: [{ conversation_id: "c-mine" }],
            error: null,
          });
        }
        // shared lookup -> empty / null
        return createQuery({ data: null, error: null });
      }
      if (table === "conversations") return convQuery;
      return createQuery();
    };
    useClient(createSupabaseMock({ user: { id: "u1" }, from }));
    await expect(startConversation("other")).rejects.toThrow(
      "NEXT_REDIRECT:/messages/made"
    );
  });
});

describe("sendMessage", () => {
  it("returns an error for an empty/whitespace body", async () => {
    useClient(createSupabaseMock({ user: { id: "u1" } }));
    const res = await sendMessage("conv1", "   ");
    expect(res).toEqual({ error: "Message is empty." });
  });

  it("redirects to /sign-in when there is no user", async () => {
    useClient(createSupabaseMock({ user: null }));
    await expect(sendMessage("conv1", "hi")).rejects.toThrow(
      "NEXT_REDIRECT:/sign-in"
    );
  });

  it("surfaces a Supabase insert error", async () => {
    const from = (table: string) =>
      table === "messages"
        ? createQuery({ data: null, error: { message: "fail" } })
        : createQuery();
    useClient(createSupabaseMock({ user: { id: "u1" }, from }));
    const res = await sendMessage("conv1", "hi");
    expect(res).toEqual({ error: "fail" });
  });

  it("inserts the message, bumps the conversation and revalidates", async () => {
    const messagesQuery = createQuery({ data: null, error: null });
    const conversationsQuery = createQuery({ data: null, error: null });
    const from = (table: string) =>
      table === "messages" ? messagesQuery : conversationsQuery;
    const supabase = createSupabaseMock({ user: { id: "u1" }, from });
    useClient(supabase);
    const res = await sendMessage("conv1", "  hello  ");
    expect(messagesQuery.insert).toHaveBeenCalledWith({
      conversation_id: "conv1",
      sender_id: "u1",
      body: "hello",
    });
    expect(conversationsQuery.update).toHaveBeenCalledWith(
      expect.objectContaining({ last_message_at: expect.any(String) })
    );
    expect(conversationsQuery.eq).toHaveBeenCalledWith("id", "conv1");
    expect(revalidatePath).toHaveBeenCalledWith("/messages/conv1");
    expect(revalidatePath).toHaveBeenCalledWith("/messages");
    expect(res).toEqual({ ok: true });
  });
});
