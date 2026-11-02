import Link from "next/link";
import { PlatformLogo } from "@/components/platforms/PlatformLogo";
import { getAllPlatforms } from "@/lib/platforms/catalog";
import { cn } from "@/lib/utils";

export const metadata = { title: "New LARP" };

export default function NewLarpPage() {
  // Ready + Soon hubs (skip the separate "Coming soon" roadmap bucket).
  const platforms = getAllPlatforms().filter(
    (p) => p.section !== "Coming soon",
  );

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <h1 className="page-title text-[clamp(1.75rem,3vw,2.25rem)]">
          New LARP
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
          Ready platforms open the editor. Grey ones are coming soon.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {platforms.map((platform) => {
          const soon = platform.tier === "coming_soon";
          const body = (
            <>
              <PlatformLogo
                slug={platform.slug}
                name={platform.name}
                size={48}
                className="rounded-[1.2rem]"
              />
              <span className="mt-3 text-center text-[15px] font-semibold leading-tight text-[var(--ink)]">
                {platform.name}
              </span>
              {soon ? (
                <span className="mt-1 text-xs text-[var(--text-muted)]">
                  Soon
                </span>
              ) : null}
            </>
          );

          if (soon) {
            return (
              <div
                key={platform.id}
                aria-disabled="true"
                className="flex min-h-[7.5rem] cursor-default flex-col items-center justify-center rounded-[1.5rem] border border-[var(--hairline)] bg-[var(--surface)] px-3 py-5 opacity-45"
              >
                {body}
              </div>
            );
          }

          return (
            <Link
              key={platform.id}
              href={`/platforms/${encodeURIComponent(platform.slug)}/new`}
              className={cn(
                "group flex min-h-[7.5rem] flex-col items-center justify-center rounded-[1.5rem] border border-[var(--hairline)] bg-[var(--surface)] px-3 py-5 transition hover:border-[var(--ink)]/30 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] active:scale-[0.98]",
              )}
            >
              {body}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
