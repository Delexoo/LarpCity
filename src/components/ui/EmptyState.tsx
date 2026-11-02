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
        "relative isolate flex flex-col items-center justify-center overflow-hidden rounded-[1.5rem] border border-dashed border-[var(--dashed)] bg-[var(--surface)] px-6 py-14 text-center shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 text-[var(--text-secondary)]">{icon}</div>
      ) : null}
      <h3 className="page-title text-xl">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-[var(--text-secondary)]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
