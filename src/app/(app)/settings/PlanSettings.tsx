"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useLocalPlan } from "@/hooks/useLocalPlan";

export function PlanSettings() {
  const { plan, isPro, setLocalPlan } = useLocalPlan();

  return (
    <section className="ll-panel p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-[var(--ink)]">Plan</h2>
        <Badge tone={isPro ? "pro" : "muted"}>{isPro ? "Pro" : "Free"}</Badge>
      </div>
      <p className="mt-3 text-sm text-[var(--text-secondary)]">
        {isPro
          ? "Watermark removed on this device. Screenshot-ready LARPs across every platform."
          : "All platforms unlocked. Free LARPs show a LarpingKit watermark until you upgrade."}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {isPro ? (
          <Button size="sm" variant="outline" onClick={() => setLocalPlan("free")}>
            Switch to Free
          </Button>
        ) : (
          <Link href="/pricing">
            <Button size="sm">Remove watermark · Pro</Button>
          </Link>
        )}
        <p className="w-full text-xs text-[var(--text-muted)]">
          Current plan: {plan}
        </p>
      </div>
    </section>
  );
}
