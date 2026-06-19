import Link from "next/link";
import { AudioLines } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  className,
  showWordmark = true,
}: {
  href?: string;
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2", className)}
    >
      <span className="bg-brand-gradient grid size-8 place-items-center rounded-lg text-white shadow-sm transition-transform group-hover:scale-105">
        <AudioLines className="size-5" />
      </span>
      {showWordmark && (
        <span className="text-lg font-semibold tracking-tight">
          Jam<span className="text-gradient">mers</span>
        </span>
      )}
    </Link>
  );
}
