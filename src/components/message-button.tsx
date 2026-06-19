import { MessageCircle } from "lucide-react";
import { startConversation } from "@/app/actions/messages";
import { Button } from "@/components/ui/button";

/**
 * Server component: a one-click "Message" button that finds-or-creates a
 * conversation with `targetId` and redirects into the thread.
 */
export function MessageButton({
  targetId,
  label = "Message",
  variant = "outline",
  className,
}: {
  targetId: string;
  label?: string;
  variant?: "default" | "outline" | "secondary";
  className?: string;
}) {
  return (
    <form action={startConversation.bind(null, targetId)} className={className}>
      <Button type="submit" variant={variant} className="w-full">
        <MessageCircle className="size-4" />
        {label}
      </Button>
    </form>
  );
}
