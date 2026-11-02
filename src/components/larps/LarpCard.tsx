import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

export type LarpCardData = {
  id: string;
  title: string;
  platform_slug: string;
  updated_at?: string | null;
  is_public?: boolean;
};

export function LarpCard({ larp }: { larp: LarpCardData }) {
  const updated = larp.updated_at
    ? new Date(larp.updated_at).toLocaleDateString()
    : null;

  return (
    <Link
      href={`/larps/${larp.id}`}
      className="group block rounded-[1rem] border border-[var(--hairline)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] transition hover:border-[var(--ink)]/25"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
            {larp.platform_slug.replace(/-/g, " ")}
          </p>
          <h3 className="mt-1 text-sm font-semibold text-[var(--ink)] group-hover:underline">
            {larp.title}
          </h3>
        </div>
        {larp.is_public ? <Badge tone="accent">Public</Badge> : null}
      </div>
      {updated ? (
        <p className="mt-4 text-xs text-[var(--text-secondary)]">
          Updated {updated}
        </p>
      ) : null}
    </Link>
  );
}
