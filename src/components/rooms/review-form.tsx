"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { createReview, type ActionResult } from "@/app/actions/rooms";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormError } from "@/components/auth/form-error";
import { cn } from "@/lib/utils";

export function ReviewForm({ roomId }: { roomId: string }) {
  const [state, action] = useActionState<ActionResult, FormData>(
    createReview,
    {}
  );
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    if (state.ok) toast.success("Thanks for your review!");
  }, [state.ok]);

  return (
    <form action={action} className="bg-card space-y-3 rounded-xl border p-4">
      <p className="text-sm font-medium">Leave a review</p>
      <input type="hidden" name="room_id" value={roomId} />
      <input type="hidden" name="rating" value={rating} />
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            aria-label={`${n} stars`}
          >
            <Star
              className={cn(
                "size-6 transition-colors",
                n <= (hover || rating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground"
              )}
            />
          </button>
        ))}
      </div>
      <FormError message={state.error} />
      <Textarea name="comment" rows={3} placeholder="How was the room, gear and vibe?" />
      <SubmitButton className="w-auto">Post review</SubmitButton>
    </form>
  );
}
