import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative isolate flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-14 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 text-[var(--text-secondary)] opacity-80">{icon}</div>
      ) : null}
      <h3 className="font-[family-name:var(--font-display)] text-lg tracking-tight text-[var(--paper)]">
        {title}
      </h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-[var(--text-secondary)]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
