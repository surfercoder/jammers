import { createSupabaseMock, createQuery, type QueryMock } from "@test/supabase";

jest.mock("@/utils/supabase/server", () => ({ createClient: jest.fn() }));
import { createClient } from "@/utils/supabase/server";
import {
  getConversations,
  getMessages,
  getConversationParticipants,
} from "./messages";

const mockedCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

function useFrom(from: (table: string) => QueryMock) {
  mockedCreateClient.mockResolvedValue(
    createSupabaseMock({ from }) as never
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getConversations", () => {
  it("returns [] when the user participates in no conversations", async () => {
    useFrom((table) => {
      if (table === "conversation_participants") {
        return createQuery({ data: [], error: null });
      }
      return createQuery({ data: null, error: null });
    });
    await expect(getConversations("u1")).resolves.toEqual([]);
  });

  it("treats null participant rows as empty (?? [] fallback)", async () => {
    useFrom((table) => {
      if (table === "conversation_participants") {
        return createQuery({ data: null, error: null });
      }
      return createQuery({ data: null, error: null });
    });
    await expect(getConversations("u1")).resolves.toEqual([]);
  });

  it("maps conversations with participants and last message", async () => {
    const me = { id: "u1", username: "me", full_name: "Me", avatar_url: null };
    const other = {
      id: "u2",
      username: "you",
      full_name: "You",
      avatar_url: null,
    };
    const convs = [
      {
        id: "c1",
        created_at: "2024-01-01",
        last_message_at: "2024-01-03",
        conversation_participants: [{ profile: me }, { profile: other }],
        messages: [
          { id: "m1", created_at: "2024-01-02" },
          { id: "m2", created_at: "2024-01-03" },
          { id: "m3", created_at: "2024-01-01" },
        ],
      },
    ];
    useFrom((table) => {
      if (table === "conversation_participants") {
        return createQuery({
          data: [{ conversation_id: "c1" }],
          error: null,
        });
      }
      if (table === "conversations") {
        return createQuery({ data: convs, error: null });
      }
      return createQuery({ data: null, error: null });
    });

    const result = await getConversations("u1");
    expect(result).toHaveLength(1);
    expect(result[0].participants).toEqual([other]);
    expect(result[0].last_message).toEqual({ id: "m2", created_at: "2024-01-03" });
    expect(result[0].id).toBe("c1");
  });

  it("handles null conversations data and missing messages (both ?? fallbacks)", async () => {
    const me = { id: "u1", username: "me", full_name: "Me", avatar_url: null };
    const convsWithNullMessages = [
      {
        id: "c2",
        created_at: "2024-02-01",
        last_message_at: "2024-02-01",
        conversation_participants: [{ profile: me }],
        messages: null,
      },
    ];

    // First: convs data is null → outer ?? [] yields [].
    useFrom((table) => {
      if (table === "conversation_participants") {
        return createQuery({
          data: [{ conversation_id: "c2" }],
          error: null,
        });
      }
      if (table === "conversations") {
        return createQuery({ data: null, error: null });
      }
      return createQuery({ data: null, error: null });
    });
    await expect(getConversations("u1")).resolves.toEqual([]);

    // Then: messages null → inner ?? [] yields [] and reduce returns null.
    useFrom((table) => {
      if (table === "conversation_participants") {
        return createQuery({
          data: [{ conversation_id: "c2" }],
          error: null,
        });
      }
      if (table === "conversations") {
        return createQuery({ data: convsWithNullMessages, error: null });
      }
      return createQuery({ data: null, error: null });
    });
    const result = await getConversations("u1");
    expect(result[0].participants).toEqual([]);
    expect(result[0].last_message).toBeNull();
  });
});

describe("getMessages", () => {
  it("returns the messages ordered", async () => {
    const msgs = [{ id: "m1" }, { id: "m2" }];
    useFrom(() => createQuery({ data: msgs, error: null }));
    await expect(getMessages("c1")).resolves.toEqual(msgs);
  });

  it("returns [] when data is null (?? fallback)", async () => {
    useFrom(() => createQuery({ data: null, error: null }));
    await expect(getMessages("c1")).resolves.toEqual([]);
  });
});

describe("getConversationParticipants", () => {
  it("maps profile rows", async () => {
    const a = { id: "p1" };
    const b = { id: "p2" };
    useFrom(() =>
      createQuery({ data: [{ profile: a }, { profile: b }], error: null })
    );
    await expect(getConversationParticipants("c1")).resolves.toEqual([a, b]);
  });

  it("returns [] when data is null (?? fallback)", async () => {
    useFrom(() => createQuery({ data: null, error: null }));
    await expect(getConversationParticipants("c1")).resolves.toEqual([]);
  });
});
