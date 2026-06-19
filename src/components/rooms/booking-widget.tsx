"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarClock } from "lucide-react";
import { createBooking, type ActionResult } from "@/app/actions/rooms";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormError } from "@/components/auth/form-error";
import { FieldError } from "@/components/auth/field-error";
import { formatMoney } from "@/lib/format";

const HOURS = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];

export function BookingWidget({
  roomId,
  hourlyPrice,
  currency,
}: {
  roomId: string;
  hourlyPrice: number;
  currency: string;
}) {
  const [state, action] = useActionState<ActionResult, FormData>(
    createBooking,
    {}
  );
  const [hours, setHours] = useState(2);

  useEffect(() => {
    if (state.ok) toast.success("Booking request sent! The owner will confirm.");
  }, [state.ok]);

  const today = new Date().toISOString().split("T")[0];

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="room_id" value={roomId} />
      <input type="hidden" name="hours" value={hours} />

      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-semibold">
          {formatMoney(hourlyPrice, currency)}
        </span>
        <span className="text-muted-foreground text-sm">per hour</span>
      </div>

      <FormError message={state.error} />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="date">Date</Label>
          <Input id="date" name="date" type="date" min={today} required />
          <FieldError errors={state.fieldErrors?.date} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="start">Start</Label>
          <Select name="start" defaultValue="18:00">
            <SelectTrigger id="start" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HOURS.map((h) => (
                <SelectItem key={h} value={h}>
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Duration</Label>
        <Select value={String(hours)} onValueChange={(v) => setHours(Number(v))}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 8].map((h) => (
              <SelectItem key={h} value={String(h)}>
                {h} {h === 1 ? "hour" : "hours"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={2}
          placeholder="Band name, gear needs, etc."
        />
      </div>

      <div className="flex items-center justify-between border-t pt-3 text-sm">
        <span className="text-muted-foreground">
          {formatMoney(hourlyPrice, currency)} × {hours}h
        </span>
        <span className="text-lg font-semibold">
          {formatMoney(hourlyPrice * hours, currency)}
        </span>
      </div>

      <SubmitButton>
        <CalendarClock className="size-4" />
        Request booking
      </SubmitButton>
      <p className="text-muted-foreground text-center text-xs">
        You won't be charged — the owner confirms availability first.
      </p>
    </form>
  );
}
