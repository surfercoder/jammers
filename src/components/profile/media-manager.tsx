"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { addMedia, deleteMedia, type ActionResult } from "@/app/actions/profile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormError } from "@/components/auth/form-error";
import { youtubeEmbed } from "@/lib/format";
import type { Media } from "@/lib/types";

export function MediaManager({ media }: { media: Media[] }) {
  const [state, action] = useActionState<ActionResult, FormData>(addMedia, {});
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      toast.success("Video added.");
      formRef.current?.reset();
    }
  }, [state.ok]);

  return (
    <section className="space-y-4 border-t pt-6">
      <div>
        <h2 className="text-lg font-semibold">Performance videos</h2>
        <p className="text-muted-foreground text-sm">
          Paste YouTube links to show your playing.
        </p>
      </div>

      {media.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {media.map((m) => (
            <div key={m.id} className="space-y-2">
              <div className="relative aspect-video overflow-hidden rounded-xl border">
                <iframe
                  src={youtubeEmbed(m.url)}
                  title={m.title ?? "Video"}
                  sandbox="allow-scripts allow-presentation allow-popups"
                  className="size-full"
                  allowFullScreen
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground line-clamp-1 text-sm">
                  {m.title ?? m.url}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    startTransition(async () => {
                      await deleteMedia(m.id);
                      toast.success("Video removed.");
                    })
                  }
                >
                  <Trash2 className="text-destructive size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form ref={formRef} action={action} className="bg-card space-y-3 rounded-xl border p-4">
        <FormError message={state.error} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input name="url" placeholder="https://youtube.com/watch?v=…" required />
          <Input name="title" placeholder="Title (optional)" />
        </div>
        <SubmitButton className="w-auto">
          <Plus className="size-4" /> Add video
        </SubmitButton>
      </form>
    </section>
  );
}
