"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  // `userId` is the server-verified session id from supabase.auth.getUser(),
  // never a client-supplied value, and ownership is also enforced by RLS.
  // react-doctor-disable-next-line react-doctor/supabase-client-owned-authz-field
  return { supabase, userId: user.id };
}

/**
 * Find an existing 1:1 conversation between the current user and `otherId`,
 * or create one, then redirect into the thread.
 */
export async function startConversation(otherId: string) {
  const { supabase, userId } = await requireUserId();
  if (otherId === userId) redirect("/messages");

  // Conversations the current user is in…
  const { data: mine } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", userId);
  const myIds = (mine ?? []).map((r) => r.conversation_id);

  if (myIds.length) {
    // …that the other user is also in.
    const { data: shared } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("profile_id", otherId)
      .in("conversation_id", myIds)
      .limit(1);
    if (shared && shared.length) {
      redirect(`/messages/${shared[0].conversation_id}`);
    }
  }

  const { data: conv, error } = await supabase
    .from("conversations")
    .insert({})
    .select("id")
    .single();
  if (error || !conv) throw error ?? new Error("Could not start conversation");

  await supabase.from("conversation_participants").insert([
    { conversation_id: conv.id, profile_id: userId },
    { conversation_id: conv.id, profile_id: otherId },
  ]);

  redirect(`/messages/${conv.id}`);
}

export async function sendMessage(conversationId: string, body: string) {
  const trimmed = body.trim();
  if (!trimmed) return { error: "Message is empty." };
  const { supabase, userId } = await requireUserId();

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: userId,
    body: trimmed,
  });
  if (error) return { error: error.message };

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");
  return { ok: true };
}
