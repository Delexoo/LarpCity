import { notFound } from "next/navigation";
import { NAV_CATALOG } from "@/lib/platforms/catalog";
import { CreateLarpActions } from "../../larps/new/CreateLarpActions";
import { PlatformLarpsClient } from "./PlatformLarpsClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const platform = NAV_CATALOG.find((i) => i.slug === slug);
  return { title: platform?.name || "Platform" };
}

export default async function PlatformHubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const platform = NAV_CATALOG.find(
    (i) => i.slug === slug && i.href === `/platforms/${slug}`,
  );
  if (!platform) notFound();

  const comingSoon = platform.tier === "coming_soon";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">
            {platform.section}
          </p>
          <h1 className="page-title mt-1">{platform.name}</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {platform.description ||
              `Create mock ${platform.name} dashboards for screenshots.`}
          </p>
        </div>
        {!comingSoon ? (
          <CreateLarpActions
            platformSlug={platform.slug}
            platformName={platform.name}
          />
        ) : null}
      </div>

      {comingSoon ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-12 text-center">
          <p className="font-[family-name:var(--font-display)] text-lg text-[var(--paper)]">
            Coming soon
          </p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {platform.name} is on the roadmap. Check back soon.
          </p>
        </div>
      ) : (
        <PlatformLarpsClient
          slug={platform.slug}
          platformName={platform.name}
        />
      )}
    </div>
  );
}
