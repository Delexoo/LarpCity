import Link from "next/link";
import { Check } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui/Button";
import { PricingActions } from "./PricingActions";

export const metadata = {
  title: "Pricing",
};

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-[0.95rem] text-[var(--ink)]">
      <Check
        className="mt-0.5 size-4 shrink-0 text-[var(--ink)]"
        strokeWidth={2}
      />
      <span>{children}</span>
    </li>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <SiteHeader solid />

      <main className="mx-auto max-w-5xl px-5 pb-24 pt-[7.5rem] md:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="display-title text-[clamp(2.2rem,5vw,3.4rem)]">
            Simple pricing.
          </h1>
          <p className="lead mt-4 text-[1.05rem]">
            Free unlocks every platform with a watermark. Pro removes it —
            forever.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          <div className="rounded-[1.75rem] border border-[var(--hairline)] bg-[var(--surface)] p-8 md:p-10">
            <p className="text-sm font-semibold text-[var(--text-secondary)]">
              Free
            </p>
            <p className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-[var(--ink)]">
              $0
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              All platforms · watermark on every LARP
            </p>
            <ul className="mt-8 space-y-3">
              <Feature>Access to all active platforms</Feature>
              <Feature>Create and edit LARPs</Feature>
              <Feature>Desktop + mobile viewers</Feature>
              <Feature>Watermark on exports &amp; viewers</Feature>
            </ul>
            <Link href="/dashboard" className="mt-10 block">
              <Button variant="outline" className="w-full" size="lg">
                Continue free
              </Button>
            </Link>
          </div>

          <div className="rounded-[1.75rem] border-[1.5px] border-[var(--ink)] bg-[var(--surface)] p-8 md:p-10">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--ink)]">Pro</p>
              <span className="rounded-full bg-[var(--ink)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                No watermark
              </span>
            </div>
            <p className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-[var(--ink)]">
              Clean
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Same platforms · no LarpCity mark
            </p>
            <ul className="mt-8 space-y-3">
              <Feature>Everything in Free</Feature>
              <Feature>Watermark removed everywhere</Feature>
              <Feature>Home-screen installs look native</Feature>
              <Feature>Best for sharing &amp; screenshots</Feature>
            </ul>
            <div className="mt-10">
              <PricingActions />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
