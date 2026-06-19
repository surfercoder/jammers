"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import { FileSignature } from "lucide-react";
import { createContract, type ActionResult } from "@/app/actions/contracts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormError } from "@/components/auth/form-error";
import { FieldError } from "@/components/auth/field-error";

export function ContractDialog({
  musicianId,
  musicianName,
}: {
  musicianId: string;
  musicianName: string;
}) {
  const [open, setOpen] = useState(false);
  // Handle success in the action itself (an event-driven update) rather than a
  // useEffect, so closing the dialog isn't a setState-in-effect render cascade.
  const [state, action] = useActionState<ActionResult, FormData>(
    async (prev, formData) => {
      const result = await createContract(prev, formData);
      if (result.ok) {
        toast.success(`Offer sent to ${musicianName}!`);
        setOpen(false);
      }
      return result;
    },
    {}
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <FileSignature className="size-4" /> Contract {musicianName.split(" ")[0]}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send a contract offer</DialogTitle>
          <DialogDescription>
            Describe the gig. {musicianName} can accept or decline.
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="space-y-4">
          <input type="hidden" name="musician_id" value={musicianId} />
          <FormError message={state.error} />

          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Support act for our show at Niceto" required />
            <FieldError errors={state.fieldErrors?.title} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Details</Label>
            <Textarea id="description" name="description" rows={3} placeholder="Set length, style, what you're looking for…" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="event_date">Event date</Label>
              <Input id="event_date" name="event_date" type="date" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budget">Budget (ARS)</Label>
              <Input id="budget" name="budget" type="number" min={0} placeholder="50000" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="venue">Venue</Label>
              <Input id="venue" name="venue" placeholder="Niceto Club" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue="Buenos Aires" />
            </div>
          </div>

          <DialogFooter>
            <SubmitButton>Send offer</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
