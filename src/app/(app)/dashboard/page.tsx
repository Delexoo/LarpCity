import Link from "next/link";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
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
  "instagram",
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
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="page-title text-[clamp(1.5rem,2.5vw,1.85rem)]">Home</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Platforms and your LARPs.
          </p>
        </div>
        <Link href="/larps/new">
          <Button size="md" className="rounded-full">
            New LARP
          </Button>
        </Link>
      </div>

      <OnboardingChecklist />

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold text-[var(--ink)]">Platforms</h2>
          <Link
            href="/larps/new"
            className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--ink)]"
          >
            See all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {platforms.map((platform) => (
            <Link
              key={platform.id}
              href={platform.href}
              className="flex min-h-[6.25rem] flex-col items-center justify-center gap-2 rounded-[1.2rem] border border-[var(--hairline)] bg-[var(--surface)] px-2 py-4 transition hover:border-[var(--ink)]/25 active:scale-[0.98]"
            >
              <PlatformLogo
                slug={platform.slug}
                name={platform.name}
                size={40}
                className="rounded-[0.85rem]"
              />
              <span className="text-center text-[13px] font-semibold leading-tight text-[var(--ink)]">
                {platform.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-[var(--ink)]">My LARPs</h2>
        {params.created ? (
          <div className="mb-3 rounded-[1.1rem] border border-[var(--hairline)] bg-[var(--banner-bg)] px-3.5 py-2.5 text-sm text-[var(--banner-ink)]">
            LARP created — highlighted below.
          </div>
        ) : null}
        <LarpsListClient highlightId={params.created} />
        {params.created ? <InstallLarpPrompt larpId={params.created} /> : null}
      </section>
    </div>
  );
}
