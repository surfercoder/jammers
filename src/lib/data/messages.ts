import "server-only";
import { createClient } from "@/utils/supabase/server";
import type { ConversationSummary, Message, Profile } from "@/lib/types";

/** All conversations the user participates in, with the other party + last message. */
export async function getConversations(
  userId: string
): Promise<ConversationSummary[]> {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", userId);
  const convIds = (rows ?? []).map((r) => r.conversation_id);
  if (!convIds.length) return [];

  const { data: convs } = await supabase
    .from("conversations")
    .select(
      `*, conversation_participants (
         profile:profiles (id, username, full_name, avatar_url)
       ),
       messages (*)`
    )
    .in("id", convIds)
    .order("last_message_at", { ascending: false });

  return (convs ?? []).map((c) => {
    const participants = (
      c.conversation_participants as unknown as { profile: Profile }[]
    ).flatMap((p) => (p.profile.id !== userId ? [p.profile] : []));
    const messages = (c.messages as unknown as Message[]) ?? [];
    const last_message = messages.reduce<Message | null>(
      (latest, m) =>
        !latest || m.created_at > latest.created_at ? m : latest,
      null
    );
    return {
      id: c.id,
      created_at: c.created_at,
      last_message_at: c.last_message_at,
      participants,
      last_message,
    };
  });
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

/** Participants of a conversation (used to render the thread header). */
export async function getConversationParticipants(
  conversationId: string
): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("conversation_participants")
    .select("profile:profiles (*)")
    .eq("conversation_id", conversationId);
  return (data ?? []).map(
    (r) => (r as unknown as { profile: Profile }).profile
  );
}
