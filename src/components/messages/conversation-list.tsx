"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ConversationSummary } from "@/lib/types";

export function ConversationList({
  conversations,
}: {
  conversations: ConversationSummary[];
}) {
  const pathname = usePathname();

  if (!conversations.length) {
    return (
      <p className="text-muted-foreground p-6 text-center text-sm">
        No conversations yet. Message a room owner or musician to start one.
      </p>
    );
  }

  return (
    <div className="divide-y">
      {conversations.map((c) => {
        const other = c.participants[0];
        const active = pathname === `/messages/${c.id}`;
        return (
          <Link
            key={c.id}
            href={`/messages/${c.id}`}
            className={cn(
              "hover:bg-accent flex items-center gap-3 p-3 transition-colors",
              active && "bg-accent"
            )}
          >
            <Avatar className="size-10 shrink-0">
              <AvatarImage src={other?.avatar_url ?? undefined} />
              <AvatarFallback>{initials(other?.full_name ?? other?.username)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {other?.full_name ?? other?.username ?? "Unknown"}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {c.last_message?.body ?? "New conversation"}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
