import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { PlatformLogo } from "@/components/platforms/PlatformLogo";

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
      className="group flex items-center gap-3.5 rounded-[1.25rem] border border-[var(--hairline)] bg-[var(--surface)] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[var(--ink)]/25 hover:shadow-[var(--shadow-card)] active:scale-[0.99]"
    >
      <PlatformLogo
        slug={larp.platform_slug}
        name={larp.platform_slug}
        size={40}
        className="shrink-0 rounded-[0.9rem]"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--text-secondary)]">
              {larp.platform_slug.replace(/-/g, " ")}
            </p>
            <h3 className="mt-0.5 truncate text-[0.95rem] font-semibold tracking-tight text-[var(--ink)]">
              {larp.title}
            </h3>
          </div>
          {larp.is_public ? <Badge tone="accent">Public</Badge> : null}
        </div>
        {updated ? (
          <p className="mt-1.5 text-xs text-[var(--text-muted)]">
            Updated {updated}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
