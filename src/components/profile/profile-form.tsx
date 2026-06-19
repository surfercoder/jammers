"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateProfile, type ActionResult } from "@/app/actions/profile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { ChipPicker } from "./chip-picker";
import {
  GENRES,
  INSTRUMENTS,
  AVAILABILITY,
  EXPERIENCE_LEVELS,
} from "@/lib/constants";
import type { Profile, MusicianProfile } from "@/lib/types";

export function ProfileForm({
  profile,
  musician,
}: {
  profile: Profile;
  musician: MusicianProfile | null;
}) {
  const [state, action] = useActionState<ActionResult, FormData>(
    updateProfile,
    {}
  );

  useEffect(() => {
    if (state.ok) toast.success("Profile saved.");
  }, [state.ok]);

  const showMusician = profile.account_type !== "room_owner";

  return (
    <form action={action} className="space-y-8">
      {showMusician && <input type="hidden" name="has_musician" value="1" />}
      <FormError message={state.error} />

      {/* Basics */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Basics</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" name="full_name" defaultValue={profile.full_name ?? ""} required />
            <FieldError errors={state.fieldErrors?.full_name} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" defaultValue={profile.city ?? ""} placeholder="Buenos Aires" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="headline">Headline</Label>
          <Input
            id="headline"
            name="headline"
            defaultValue={profile.headline ?? ""}
            placeholder="Bassist · Rock & Funk · Available for gigs"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="avatar_url">Avatar URL</Label>
          <Input id="avatar_url" name="avatar_url" defaultValue={profile.avatar_url ?? ""} placeholder="https://…" />
          <FieldError errors={state.fieldErrors?.avatar_url} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" name="bio" rows={4} defaultValue={profile.bio ?? ""} placeholder="Tell the community about your sound and experience." />
        </div>
      </section>

      {showMusician && (
        <section className="space-y-5 border-t pt-6">
          <h2 className="text-lg font-semibold">Musician details</h2>

          <Label className="bg-card flex items-center justify-between rounded-lg border p-3">
            <span>
              <span className="block text-sm font-medium">Open to work</span>
              <span className="text-muted-foreground text-xs">
                Show an "open to work" badge on your profile.
              </span>
            </span>
            <Switch name="open_to_work" defaultChecked={musician?.open_to_work ?? true} />
          </Label>

          <div className="space-y-2">
            <Label>Instruments</Label>
            <ChipPicker name="instruments" options={INSTRUMENTS} defaultValue={musician?.instruments ?? []} />
          </div>

          <div className="space-y-2">
            <Label>Genres</Label>
            <ChipPicker name="genres" options={GENRES} defaultValue={musician?.genres ?? []} />
          </div>

          <div className="space-y-2">
            <Label>Available for</Label>
            <ChipPicker name="available_for" options={AVAILABILITY} defaultValue={musician?.available_for ?? []} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="experience_level">Experience</Label>
              <Select name="experience_level" defaultValue={musician?.experience_level ?? "intermediate"}>
                <SelectTrigger id="experience_level" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="years_experience">Years playing</Label>
              <Input id="years_experience" name="years_experience" type="number" min={0} defaultValue={musician?.years_experience ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hourly_rate">Rate / hour (ARS)</Label>
              <Input id="hourly_rate" name="hourly_rate" type="number" min={0} defaultValue={musician?.hourly_rate ?? ""} />
            </div>
          </div>
        </section>
      )}

      <SubmitButton className="w-auto">Save profile</SubmitButton>
    </form>
  );
}
