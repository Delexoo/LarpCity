import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type BadgeTone = "default" | "accent" | "pro" | "muted" | "success";

const tones: Record<BadgeTone, string> = {
  default: "bg-[var(--surface-alt)] text-[var(--ink)] border-[var(--hairline)]",
  accent:
    "bg-[var(--accent-select)] text-[var(--ink)] border-transparent",
  pro: "bg-[var(--ink)] text-[var(--on-ink)] border-[var(--ink)]",
  muted: "bg-[var(--free-chip)] text-[var(--text-secondary)] border-transparent",
  success: "bg-[var(--surface-alt)] text-[var(--ink)] border-[var(--hairline)]",
};

export function Badge({
  className,
  tone = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
