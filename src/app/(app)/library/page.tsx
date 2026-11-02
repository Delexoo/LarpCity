import { EmptyState } from "@/components/ui/EmptyState";
import { Images, Plus } from "lucide-react";

export const metadata = { title: "Media Library" };

export default function LibraryPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Media Library</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Upload and reuse assets across your LARPs.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-white/15 text-[var(--text-muted)]"
          >
            <Plus className="size-5" strokeWidth={2} />
          </div>
        ))}
      </div>
      <EmptyState
        icon={<Images className="size-8" strokeWidth={2} />}
        title="Library coming online"
        description="A grid of your uploads, logos, and mock media will live here."
      />
    </div>
  );
}
