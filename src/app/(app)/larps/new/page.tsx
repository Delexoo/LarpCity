import Link from "next/link";
import { PlatformLogo } from "@/components/platforms/PlatformLogo";
import { getActivePlatforms } from "@/lib/platforms/catalog";

export const metadata = { title: "New LARP" };

export default function NewLarpPage() {
  const platforms = getActivePlatforms();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="page-title">New LARP</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Choose a platform.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {platforms.map((platform) => {
          const comingSoon = platform.tier === "coming_soon";
          const href = comingSoon
            ? undefined
            : `/platforms/${encodeURIComponent(platform.slug)}/new`;

          const body = (
            <>
              <PlatformLogo
                slug={platform.slug}
                name={platform.name}
                size={48}
              />
              <span className="mt-3 text-center text-[15px] font-semibold leading-tight text-[var(--ink)]">
                {platform.name}
              </span>
              {comingSoon ? (
                <span className="mt-1 text-xs text-[var(--text-muted)]">
                  Soon
                </span>
              ) : null}
            </>
          );

          if (!href) {
            return (
              <div
                key={platform.id}
                className="ll-stat-card flex min-h-[7.5rem] flex-col items-center justify-center px-3 py-5 opacity-55"
              >
                {body}
              </div>
            );
          }

          return (
            <Link
              key={platform.id}
              href={href}
              className="ll-stat-card flex min-h-[7.5rem] flex-col items-center justify-center px-3 py-5 transition hover:border-[var(--ink)]/35 active:scale-[0.98]"
            >
              {body}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
