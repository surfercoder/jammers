"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Check, X, Ban, CircleCheck } from "lucide-react";
import { setBookingStatus } from "@/app/actions/rooms";
import { setContractStatus } from "@/app/actions/contracts";
import { Button } from "@/components/ui/button";

export function RequestActions({
  id,
  kind,
  direction,
  status,
}: {
  id: string;
  kind: "booking" | "contract";
  direction: "incoming" | "outgoing";
  status: string;
}) {
  const [pending, startTransition] = useTransition();
  const update = kind === "booking" ? setBookingStatus : setContractStatus;

  function act(next: string, msg: string) {
    startTransition(async () => {
      const res = await update(id, next);
      if (res?.error) toast.error(res.error);
      else toast.success(msg);
    });
  }

  if (status === "declined" || status === "cancelled" || status === "completed") {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {direction === "incoming" && status === "pending" && (
        <>
          <Button size="sm" disabled={pending} onClick={() => act("accepted", "Accepted.")}>
            <Check className="size-4" /> Accept
          </Button>
          <Button size="sm" variant="outline" disabled={pending} onClick={() => act("declined", "Declined.")}>
            <X className="size-4" /> Decline
          </Button>
        </>
      )}
      {direction === "incoming" && status === "accepted" && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => act("completed", "Marked complete.")}>
          <CircleCheck className="size-4" /> Mark completed
        </Button>
      )}
      {direction === "outgoing" && status === "pending" && (
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => act("cancelled", "Cancelled.")}>
          <Ban className="size-4" /> Cancel request
        </Button>
      )}
    </div>
  );
}
