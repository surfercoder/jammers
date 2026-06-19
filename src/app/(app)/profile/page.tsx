import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { requireProfile } from "@/lib/data/auth";
import { createClient } from "@/utils/supabase/server";
import { ProfileForm } from "@/components/profile/profile-form";
import { MediaManager } from "@/components/profile/media-manager";
import { Button } from "@/components/ui/button";
import type { MusicianProfile, Media } from "@/lib/types";

export const metadata: Metadata = { title: "Edit profile" };

export default async function ProfilePage() {
  const [profile, supabase] = await Promise.all([
    requireProfile(),
    createClient(),
  ]);

  const [{ data: musician }, { data: media }] = await Promise.all([
    supabase.from("musician_profiles").select("*").eq("profile_id", profile.id).maybeSingle(),
    supabase.from("media").select("*").eq("profile_id", profile.id).order("created_at", { ascending: false }),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit profile</h1>
          <p className="text-muted-foreground text-sm">
            This is how the community sees you.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/musicians/${profile.username}`}>
            <ExternalLink className="size-4" /> View public
          </Link>
        </Button>
      </div>

      <ProfileForm
        profile={profile}
        musician={(musician as MusicianProfile | null) ?? null}
      />

      {profile.account_type !== "room_owner" && (
        <MediaManager media={(media as Media[]) ?? []} />
      )}
    </div>
  );
}
