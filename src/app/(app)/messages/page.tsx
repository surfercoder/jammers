import type { Metadata } from "next";
import { MessagesSquare } from "lucide-react";

export const metadata: Metadata = { title: "Messages" };

export default function MessagesIndexPage() {
  return (
    <div className="text-muted-foreground hidden h-full flex-col items-center justify-center gap-2 lg:flex">
      <MessagesSquare className="size-10" />
      <p className="text-sm">Select a conversation to start chatting.</p>
    </div>
  );
}
