import { requireProfile } from "@/lib/data/auth";
import { getConversations } from "@/lib/data/messages";
import { ConversationList } from "@/components/messages/conversation-list";
import { MessagesShell } from "@/components/messages/messages-shell";

export default async function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();
  const conversations = await getConversations(profile.id);

  return (
    <MessagesShell list={<ConversationList conversations={conversations} />}>
      {children}
    </MessagesShell>
  );
}
