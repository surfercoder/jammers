import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/data/auth";
import {
  getMessages,
  getConversationParticipants,
} from "@/lib/data/messages";
import { MessageThread } from "@/components/messages/message-thread";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const [{ conversationId }, profile] = await Promise.all([
    params,
    requireProfile(),
  ]);

  const participants = await getConversationParticipants(conversationId);
  // RLS guarantees the user only sees conversations they're part of.
  if (!participants.some((p) => p.id === profile.id)) notFound();

  const messages = await getMessages(conversationId);
  const other = participants.find((p) => p.id !== profile.id) ?? null;

  return (
    <MessageThread
      conversationId={conversationId}
      initialMessages={messages}
      currentUserId={profile.id}
      other={other}
    />
  );
}
