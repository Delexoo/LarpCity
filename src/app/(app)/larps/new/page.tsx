import { Badge } from "@/components/ui/Badge";
import { getActivePlatforms } from "@/lib/platforms/catalog";
import { CreateLarpActions } from "./CreateLarpActions";

export const metadata = { title: "New LARP" };

export default function NewLarpPage() {
  const platforms = getActivePlatforms();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">New LARP</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Choose a platform to start editing.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {platforms.map((platform) => {
          const comingSoon = platform.tier === "coming_soon";
          return (
            <div key={platform.id} className="ll-panel p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    {platform.name}
                  </p>
                  <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
                    {platform.section}
                  </p>
                </div>
                {comingSoon ? (
                  <Badge tone="muted">Soon</Badge>
                ) : (
                  <Badge tone="accent">Included</Badge>
                )}
              </div>
              <div className="mt-4">
                {comingSoon ? (
                  <p className="text-xs text-[var(--text-muted)]">Coming soon</p>
                ) : (
                  <CreateLarpActions
                    platformSlug={platform.slug}
                    platformName={platform.name}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
