"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// Stable empty-array reference so the default value doesn't create a new array
// on every render (which would defeat memoization of children).
const EMPTY: string[] = [];

/**
 * Controlled multi-select rendered as chips. Emits a hidden input per selected
 * value so the values post with a native form `action`.
 */
export function ChipPicker({
  name,
  options,
  defaultValue = EMPTY,
}: {
  name: string;
  options: readonly string[] | readonly { value: string; label: string }[];
  defaultValue?: string[];
}) {
  const [selected, setSelected] = useState<string[]>(defaultValue);

  const normalized = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o
  );

  function toggle(value: string) {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {selected.map((v) => (
        <input key={v} type="hidden" name={name} value={v} />
      ))}
      {normalized.map(({ value, label }) => {
        const active = selected.includes(value);
        return (
          <button
            key={value}
            type="button"
            onClick={() => toggle(value)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground border-transparent"
                : "border-border hover:border-primary"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
