import { EmptyState } from "@/components/ui/EmptyState";
import { Users } from "lucide-react";

export const metadata = { title: "Community" };

export default function CommunityPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Community</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Browse public LARPs shared by other creators.
        </p>
      </div>
      <EmptyState
        icon={<Users className="size-8" strokeWidth={2} />}
        title="Feed coming soon"
        description="Shared templates and community screenshots will appear here."
      />
    </div>
  );
}
