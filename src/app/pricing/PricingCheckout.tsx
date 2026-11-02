"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function PricingCheckout() {
  const [loading, setLoading] = useState<"monthly" | "lifetime" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function checkout(plan: "monthly" | "lifetime") {
    setLoading(plan);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("No checkout URL returned");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        className="w-full"
        disabled={loading !== null}
        onClick={() => checkout("monthly")}
      >
        {loading === "monthly" ? "Redirecting…" : "Go Pro · $29/mo"}
      </Button>
      <Button
        className="w-full"
        variant="secondary"
        disabled={loading !== null}
        onClick={() => checkout("lifetime")}
      >
        {loading === "lifetime" ? "Redirecting…" : "Lifetime · $99"}
      </Button>
      {error ? <p className="text-center text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
