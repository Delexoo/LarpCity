import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";
import { PricingActions } from "./PricingActions";

export const metadata = {
  title: "Pricing",
};

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-[var(--ink)]">
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
      <header className="flex items-center justify-between px-5 py-5 md:px-10">
        <Link href="/" className="wordmark text-xl">
          LarpCity
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" variant="outline">
              Open app
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-20 pt-10">
        <div className="text-center">
          <h1 className="page-title text-4xl">Simple pricing</h1>
          <p className="mx-auto mt-3 max-w-lg text-[var(--text-secondary)]">
            Free unlocks every platform with a LarpCity watermark. Pro keeps
            everything and removes the watermark forever.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-[1.5rem] border border-[var(--hairline)] bg-[var(--surface)] p-8 shadow-[var(--shadow-card)]">
            <p className="text-sm font-semibold text-[var(--text-secondary)]">
              Free
            </p>
            <p className="mt-3 text-4xl font-bold tracking-tight text-[var(--ink)]">
              $0
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              All platforms · watermark on every LARP
            </p>
            <ul className="mt-6 space-y-2">
              <Feature>Access to all active platforms</Feature>
              <Feature>Create and edit LARPs locally</Feature>
              <Feature>Desktop + mobile viewers</Feature>
              <Feature>LarpCity watermark on exports &amp; viewers</Feature>
            </ul>
            <Link href="/dashboard" className="mt-8 block">
              <Button variant="outline" className="w-full">
                Continue free
              </Button>
            </Link>
          </div>

          <div className="rounded-[1.5rem] border-[1.5px] border-[var(--ink)] bg-[var(--surface)] p-8 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--ink)]">Pro</p>
              <span className="rounded-full bg-[var(--ink)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--on-ink)]">
                No watermark
              </span>
            </div>
            <p className="mt-3 text-4xl font-bold tracking-tight text-[var(--ink)]">
              $99
              <span className="text-base font-medium text-[var(--text-secondary)]">
                {" "}
                once
              </span>
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Lifetime · or $29/mo when you prefer a subscription
            </p>
            <ul className="mt-6 space-y-2">
              <Feature>Everything in Free</Feature>
              <Feature>Watermark removed forever</Feature>
              <Feature>Clean screenshot-ready LARPs</Feature>
              <Feature>Priority platform updates</Feature>
              <Feature>Early access to new tools</Feature>
            </ul>
            <div className="mt-8">
              <PricingActions />
            </div>
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-[var(--text-muted)]">
          Stripe checkout turns on when billing is live. Until then you can
          preview Pro on this device (watermark off) or stay on Free with full
          platform access.
        </p>
      </main>
    </div>
  );
}
