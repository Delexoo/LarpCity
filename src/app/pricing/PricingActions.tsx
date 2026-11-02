"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useLocalPlan } from "@/hooks/useLocalPlan";

export function PricingActions() {
  const { isPro, setLocalPlan } = useLocalPlan();
  const [busy, setBusy] = useState(false);

  function activatePro() {
    setBusy(true);
    setLocalPlan("pro");
    setBusy(false);
  }

  function downgradeFree() {
    setLocalPlan("free");
  }

  if (isPro) {
    return (
      <div className="space-y-3">
        <p className="rounded-xl border border-[var(--hairline)] bg-[var(--surface-alt)] px-4 py-3 text-center text-sm text-[var(--ink)]">
          Pro is active on this device · watermark off
        </p>
        <Link href="/dashboard" className="block">
          <Button className="w-full">Open app</Button>
        </Link>
        <Button
          className="w-full"
          variant="ghost"
          size="sm"
          onClick={downgradeFree}
        >
          Switch back to Free (show watermark)
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button className="w-full" disabled={busy} onClick={activatePro}>
        {busy ? "Activating…" : "Get Pro · remove watermark forever"}
      </Button>
      <Button className="w-full" variant="secondary" disabled>
        Pay $29/mo · coming soon
      </Button>
      <p className="text-center text-xs text-[var(--text-muted)]">
        One-time lifetime unlock is the default. Monthly billing returns when
        Stripe is re-enabled.
      </p>
    </div>
  );
}
