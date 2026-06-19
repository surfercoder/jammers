"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MessagesShell({
  list,
  children,
}: {
  list: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const inThread = pathname !== "/messages";

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-6xl border-x">
      <aside
        className={cn(
          "w-full shrink-0 overflow-y-auto border-r lg:w-80",
          inThread ? "hidden lg:block" : "block"
        )}
      >
        <div className="border-b p-4">
          <h1 className="font-semibold">Messages</h1>
        </div>
        {list}
      </aside>
      <section className={cn("flex-1", inThread ? "block" : "hidden lg:block")}>
        {children}
      </section>
    </div>
  );
}
