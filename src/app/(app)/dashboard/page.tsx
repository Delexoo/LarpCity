import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getActivePlatforms } from "@/lib/platforms/catalog";
import { RecentLarpsClient } from "./RecentLarpsClient";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  const platforms = getActivePlatforms().slice(0, 12);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 border-b border-[var(--hairline)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="page-title">Dashboard</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Jump into a platform or continue a recent LARP.
          </p>
        </div>
        <Link href="/larps/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">New LARP</Button>
        </Link>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--ink)]">Platforms</h2>
          <Link
            href="/larps/new"
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--ink)]"
          >
            Browse all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {platforms.map((platform) => (
            <Link
              key={platform.id}
              href={platform.href}
              className="ll-stat-card flex items-center justify-between px-4 py-3 transition hover:border-[var(--ink)]/30"
            >
              <div>
                <p className="text-sm font-medium text-[var(--ink)]">
                  {platform.name}
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
                  {platform.section}
                </p>
              </div>
              {platform.tier === "free" ? (
                <Badge tone="accent">Free</Badge>
              ) : platform.tier === "coming_soon" ? (
                <Badge tone="muted">Soon</Badge>
              ) : (
                <Badge tone="pro">Pro</Badge>
              )}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--ink)]">
            Recent LARPs
          </h2>
          <Link
            href="/larps"
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--ink)]"
          >
            View all
          </Link>
        </div>
        <RecentLarpsClient />
      </section>
    </div>
  );
}
