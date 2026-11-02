"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Portal failed");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Portal failed");
      setLoading(false);
    }
  }

  return (
    <div>
      <Button
        size="sm"
        variant="outline"
        onClick={openPortal}
        disabled={loading}
      >
        {loading ? "Opening…" : "Billing portal"}
      </Button>
      {error ? (
        <p className="mt-2 text-xs text-[var(--alert-dot)]">{error}</p>
      ) : null}
    </div>
  );
}
