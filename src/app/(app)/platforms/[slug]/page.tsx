import { notFound } from "next/navigation";
import { NAV_CATALOG } from "@/lib/platforms/catalog";
import { CreateLarpActions } from "../../larps/new/CreateLarpActions";
import { PlatformLarpsClient } from "./PlatformLarpsClient";
import { PlatformLogo } from "@/components/platforms/PlatformLogo";

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
    <div className="mx-auto max-w-4xl space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex min-w-0 items-start gap-4">
          <PlatformLogo
            slug={platform.slug}
            name={platform.name}
            size={52}
            className="mt-0.5 shrink-0 rounded-[1.15rem]"
          />
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-[var(--text-secondary)]">
              {platform.section}
            </p>
            <h1 className="page-title mt-1 text-[clamp(1.65rem,2.5vw,2.1rem)]">
              {platform.name}
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-[var(--text-secondary)]">
              {platform.description ||
                `Create a ${platform.name} LARP, set the numbers, and open it.`}
            </p>
          </div>
        </div>
        {!comingSoon ? (
          <CreateLarpActions
            platformSlug={platform.slug}
            platformName={platform.name}
          />
        ) : null}
      </div>

      {comingSoon ? (
        <div className="rounded-[1.5rem] border border-[var(--hairline)] bg-[var(--surface)] px-6 py-14 text-center">
          <p className="page-title text-2xl">Coming soon</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--text-secondary)]">
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
