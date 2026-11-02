import Link from "next/link";
import { PlatformLogo } from "@/components/platforms/PlatformLogo";
import { Button } from "@/components/ui/Button";
import { getActivePlatforms } from "@/lib/platforms/catalog";
import { RecentLarpsClient } from "./RecentLarpsClient";

export const metadata = { title: "Dashboard" };

const FEATURED = [
  "stripe",
  "youtube-studio",
  "coinbase",
  "venmo",
  "cash-app",
  "shopify",
  "phantom",
  "revolut",
];

export default function DashboardPage() {
  const bySlug = new Map(getActivePlatforms().map((p) => [p.slug, p]));
  const platforms = FEATURED.map((slug) => bySlug.get(slug)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="page-title">Dashboard</h1>
        <Link href="/larps/new" className="w-full sm:w-auto">
          <Button size="lg" className="w-full min-w-[10.5rem] sm:w-auto">
            New LARP
          </Button>
        </Link>
      </div>

      <section>
        <div className="mb-5 flex items-baseline justify-between gap-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--text-secondary)]">
            Platforms
          </h2>
          <Link
            href="/larps/new"
            className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--ink)]"
          >
            See all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {platforms.map((platform) => (
            <Link
              key={platform.id}
              href={platform.href}
              className="ll-stat-card group flex min-h-[7.25rem] flex-col items-center justify-center gap-3 px-3 py-5 transition hover:border-[var(--ink)]/35 active:scale-[0.98]"
            >
              <PlatformLogo
                slug={platform.slug}
                name={platform.name}
                size={52}
                className="rounded-[1.15rem]"
              />
              <span className="text-center text-[15px] font-semibold leading-tight text-[var(--ink)]">
                {platform.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-baseline justify-between gap-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--text-secondary)]">
            Recent
          </h2>
          <Link
            href="/larps"
            className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--ink)]"
          >
            View all
          </Link>
        </div>
        <RecentLarpsClient />
      </section>
    </div>
  );
}
