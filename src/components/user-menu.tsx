"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  CalendarCheck,
  FileSignature,
  Music2,
  Building2,
  User,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/app/actions/auth";
import { initials } from "@/lib/format";
import type { Profile } from "@/lib/types";

export function UserMenu({ profile }: { profile: Profile }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus-visible:ring-ring rounded-full outline-none focus-visible:ring-2">
        <Avatar className="size-9 border">
          <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name ?? ""} />
          <AvatarFallback className="bg-brand-gradient text-xs text-white">
            {initials(profile.full_name ?? profile.username)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="truncate font-medium">{profile.full_name ?? profile.username}</span>
          <span className="text-muted-foreground truncate text-xs font-normal">
            @{profile.username}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard"><LayoutDashboard /> Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/musicians/${profile.username}`}><User /> My public profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile"><Music2 /> Edit profile</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/bookings"><CalendarCheck /> Bookings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/contracts"><FileSignature /> Contracts</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/host"><Building2 /> Host a room</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild variant="destructive">
          <button type="button" onClick={() => signOut()} className="w-full">
            <LogOut /> Sign out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
