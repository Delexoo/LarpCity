import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";

export const metadata = {
  title: "Pricing",
};

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-[var(--ink)]">
      <Check className="mt-0.5 size-4 shrink-0 text-[var(--ink)]" strokeWidth={2} />
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
          <p className="mt-3 text-[var(--text-secondary)]">
            Start free. Upgrade when you need every platform.
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
            <ul className="mt-6 space-y-2">
              <Feature>6 free apps</Feature>
              <Feature>1 LARP per month</Feature>
              <Feature>Core editors & previews</Feature>
            </ul>
            <Link href="/dashboard" className="mt-8 block">
              <Button variant="outline" className="w-full">
                Open app
              </Button>
            </Link>
          </div>

          <div className="rounded-[1.5rem] border-[1.5px] border-[var(--ink)] bg-[var(--surface)] p-8 shadow-[var(--shadow-card)]">
            <p className="text-sm font-semibold text-[var(--ink)]">Pro</p>
            <p className="mt-3 text-4xl font-bold tracking-tight text-[var(--ink)]">
              $29
              <span className="text-base font-medium text-[var(--text-secondary)]">
                /mo
              </span>
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              or lifetime for $99
            </p>
            <ul className="mt-6 space-y-2">
              <Feature>All active platforms</Feature>
              <Feature>Unlimited LARPs</Feature>
              <Feature>Priority updates</Feature>
            </ul>
            <div className="mt-8 space-y-3">
              <Button className="w-full" disabled>
                Billing paused
              </Button>
              <Link href="/dashboard" className="block">
                <Button className="w-full" variant="secondary">
                  Preview Pro UI
                </Button>
              </Link>
              <p className="text-center text-xs text-[var(--text-muted)]">
                Stripe checkout will return when services are re-enabled.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
