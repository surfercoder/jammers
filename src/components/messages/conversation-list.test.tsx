import { render, screen } from "@test/render";
import { usePathname } from "next/navigation";
import type { ConversationSummary } from "@/lib/types";
import { ConversationList } from "./conversation-list";

const usePathnameMock = usePathname as jest.Mock;

function conversation(
  overrides: Partial<ConversationSummary> = {}
): ConversationSummary {
  return {
    id: "c1",
    participants: [
      {
        id: "u2",
        username: "ada",
        full_name: "Ada Lovelace",
        avatar_url: "https://img.test/a.jpg",
      },
    ],
    last_message: {
      id: "m1",
      conversation_id: "c1",
      sender_id: "u2",
      body: "Hello there",
      created_at: "2026-06-19T00:00:00.000Z",
    },
    ...overrides,
  } as unknown as ConversationSummary;
}

beforeEach(() => {
  jest.clearAllMocks();
  usePathnameMock.mockReturnValue("/messages");
});

describe("ConversationList", () => {
  it("renders the empty state when there are no conversations", () => {
    render(<ConversationList conversations={[]} />);

    expect(screen.getByText(/No conversations yet/i)).toBeInTheDocument();
  });

  it("renders a conversation with full name, last message and active styling", () => {
    usePathnameMock.mockReturnValue("/messages/c1");

    render(<ConversationList conversations={[conversation()]} />);

    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("Hello there")).toBeInTheDocument();
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/messages/c1");
    expect(link.className).toContain("bg-accent");
  });

  it("falls back to username, the 'New conversation' label and is not active", () => {
    render(
      <ConversationList
        conversations={[
          conversation({
            id: "c2",
            participants: [
              {
                id: "u3",
                username: "neo",
                full_name: null,
                avatar_url: null,
              },
            ],
            last_message: null,
          }),
        ]}
      />
    );

    expect(screen.getByText("neo")).toBeInTheDocument();
    expect(screen.getByText("New conversation")).toBeInTheDocument();
  });

  it("falls back to 'Unknown' when there is no participant", () => {
    render(
      <ConversationList
        conversations={[
          conversation({
            id: "c3",
            participants: [],
            last_message: null,
          }),
        ]}
      />
    );

    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });
});
