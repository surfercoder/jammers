"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send, ChevronLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { sendMessage } from "@/app/actions/messages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Message, Profile } from "@/lib/types";

export function MessageThread({
  conversationId,
  initialMessages,
  currentUserId,
  other,
}: {
  conversationId: string;
  initialMessages: Message[];
  currentUserId: string;
  other: Profile | null;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) =>
            prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = value.trim();
    if (!body || sending) return;
    setSending(true);
    setValue("");
    const res = await sendMessage(conversationId, body);
    if (res?.error) setValue(body);
    setSending(false);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b p-3">
        <Button asChild variant="ghost" size="icon" className="lg:hidden">
          <Link href="/messages">
            <ChevronLeft />
          </Link>
        </Button>
        {other && (
          <Link href={`/musicians/${other.username}`} className="flex items-center gap-2 hover:underline">
            <Avatar className="size-8">
              <AvatarImage src={other.avatar_url ?? undefined} />
              <AvatarFallback className="text-xs">
                {initials(other.full_name ?? other.username)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{other.full_name ?? other.username}</span>
          </Link>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-muted-foreground py-10 text-center text-sm">
            Say hi 👋
          </p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                  mine
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted rounded-bl-sm"
                )}
              >
                {m.body}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t p-3">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Write a message…"
          autoComplete="off"
        />
        <Button type="submit" size="icon" disabled={!value.trim() || sending}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
