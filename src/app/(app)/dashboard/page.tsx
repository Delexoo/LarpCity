import Link from "next/link";
import { InstallLarpPrompt } from "@/components/larps/InstallLarpPrompt";
import { PlatformLogo } from "@/components/platforms/PlatformLogo";
import { Button } from "@/components/ui/Button";
import { getActivePlatforms } from "@/lib/platforms/catalog";
import { LarpsListClient } from "../larps/LarpsListClient";

export const metadata = { title: "Home" };

const FEATURED = [
  "stripe",
  "youtube-studio",
  "coinbase",
  "venmo",
  "cash-app",
  "shopify",
  "chase",
  "imessage",
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const params = await searchParams;
  const bySlug = new Map(getActivePlatforms().map((p) => [p.slug, p]));
  const platforms = FEATURED.map((slug) => bySlug.get(slug)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title text-[clamp(1.75rem,3vw,2.25rem)]">Home</h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
            Your platforms and LARPs in one place.
          </p>
        </div>
        <Link href="/larps/new" className="w-full sm:w-auto">
          <Button size="lg" className="w-full min-w-[10.5rem] rounded-full sm:w-auto">
            New LARP
          </Button>
        </Link>
      </div>

      <section>
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold text-[var(--ink)]">Platforms</h2>
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
              className="group flex min-h-[7.5rem] flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-[var(--hairline)] bg-[var(--surface)] px-3 py-5 transition hover:border-[var(--ink)]/30 active:scale-[0.98]"
            >
              <PlatformLogo
                slug={platform.slug}
                name={platform.name}
                size={52}
                className="rounded-[1.25rem]"
              />
              <span className="text-center text-[15px] font-semibold leading-tight text-[var(--ink)]">
                {platform.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold text-[var(--ink)]">My LARPs</h2>
        </div>
        {params.created ? (
          <div className="mb-4 rounded-[1.25rem] border border-[var(--hairline)] bg-[var(--banner-bg)] px-4 py-3 text-sm text-[var(--banner-ink)]">
            LARP created — newest one is highlighted below.
          </div>
        ) : null}
        <LarpsListClient highlightId={params.created} />
        {params.created ? <InstallLarpPrompt larpId={params.created} /> : null}
      </section>
    </div>
  );
}
