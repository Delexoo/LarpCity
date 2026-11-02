import { Badge } from "@/components/ui/Badge";
import { Lock } from "lucide-react";
import type { PlatformTier } from "@/lib/platforms/catalog";

export function LockBadge({ tier }: { tier: PlatformTier }) {
  if (tier === "free") return null;

  if (tier === "coming_soon") {
    return (
      <Badge
        tone="muted"
        className="normal-case tracking-normal text-[var(--text-muted)]"
      >
        Soon
      </Badge>
    );
  }

  return (
    <Badge tone="pro" className="gap-1 normal-case tracking-normal">
      <Lock className="size-2.5" strokeWidth={2} />
      Pro
    </Badge>
  );
}
