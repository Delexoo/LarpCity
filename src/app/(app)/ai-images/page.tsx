import { EmptyState } from "@/components/ui/EmptyState";
import { Plus, Sparkles } from "lucide-react";

export const metadata = { title: "AI Images" };

export default function AiImagesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">AI Images</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Generate mock profile photos, product shots, and scene fills.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex aspect-square items-center justify-center rounded-[1rem] border-2 border-dashed border-[var(--dashed)] bg-[var(--surface)] text-[var(--text-muted)]"
          >
            <Plus className="size-5" strokeWidth={2} />
          </div>
        ))}
      </div>
      <EmptyState
        icon={<Sparkles className="size-8" strokeWidth={2} />}
        title="AI studio placeholder"
        description="Prompt-based image generation will plug in here."
      />
    </div>
  );
}
