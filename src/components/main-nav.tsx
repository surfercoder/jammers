"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Music2, MessagesSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/explore", label: "Explore rooms", icon: Map },
  { href: "/musicians", label: "Musicians", icon: Music2 },
  { href: "/messages", label: "Messages", icon: MessagesSquare },
];

export function MainNav({ orientation = "horizontal" }: { orientation?: "horizontal" | "vertical" }) {
  const pathname = usePathname();
  return (
    <nav
      className={cn(
        "items-center gap-1",
        orientation === "horizontal" ? "hidden md:flex" : "flex flex-col items-stretch gap-1"
      )}
    >
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
