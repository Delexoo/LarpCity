import { EmptyState } from "@/components/ui/EmptyState";
import { Gift } from "lucide-react";

export const metadata = { title: "Refer a friend" };

export default function ReferPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Refer a friend</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Share LarpCity and earn rewards when friends upgrade.
        </p>
      </div>
      <EmptyState
        icon={<Gift className="size-8" strokeWidth={2} />}
        title="Referral program soon"
        description="Unique invite links and reward tracking will land here."
      />
    </div>
  );
}
