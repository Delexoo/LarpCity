import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(26,26,26,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,26,26,0.045) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 70% 55% at 50% 20%, black, transparent 75%)",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-5 py-5 md:px-10">
        <p className="wordmark text-xl">LarpCity</p>
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
        <p className="wordmark text-[3rem] leading-none sm:text-6xl md:text-7xl">
          LarpCity
        </p>
        <h1 className="page-title mt-6 max-w-xl text-balance text-2xl md:text-3xl">
          Mock dashboards that look like the real thing
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
