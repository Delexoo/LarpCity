import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type BadgeTone = "default" | "accent" | "pro" | "muted" | "success";

const tones: Record<BadgeTone, string> = {
  default: "bg-white/8 text-white/80 border-white/10",
  accent:
    "bg-[var(--acid)]/15 text-[var(--acid)] border-[var(--acid)]/25",
  pro: "bg-[var(--acid)]/15 text-[var(--acid)] border-[var(--acid)]/30",
  muted: "bg-white/5 text-[var(--text-muted)] border-white/8",
  success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
};

export function Badge({
  className,
  tone = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
