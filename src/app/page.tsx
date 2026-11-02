import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--ink)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(204,255,0,0.12), transparent 55%), radial-gradient(ellipse 50% 40% at 80% 20%, rgba(255,255,255,0.04), transparent 50%)",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-5 py-5 md:px-10">
        <p className="wordmark text-lg">LarpCity</p>
        <div className="flex items-center gap-2">
          <Link href="/pricing">
            <Button variant="ghost" size="sm">
              Pricing
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm">Open app</Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-5 pb-24 text-center">
        <p className="wordmark text-[2.75rem] leading-none sm:text-5xl md:text-7xl">
          LarpCity
        </p>
        <h1 className="mt-6 max-w-xl text-balance text-xl font-medium text-[var(--paper)]/90 md:text-2xl">
          Mock dashboards that look like the real thing.
        </h1>
        <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
          Build screenshot-ready financial and social LARPs in minutes — Stripe,
          Coinbase, wallets, creator studios, and more.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button size="lg">Open app</Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline">
              View pricing
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
