import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PlatformLogo } from "@/components/platforms/PlatformLogo";
import { Button } from "@/components/ui/Button";
import { getActivePlatforms } from "@/lib/platforms/catalog";

const FEATURED = [
  "stripe",
  "coinbase",
  "venmo",
  "cash-app",
  "youtube-studio",
  "shopify",
  "chase",
  "imessage",
];

const STEPS = [
  {
    n: "01",
    title: "Pick a platform",
    body: "Stripe, Coinbase, Venmo, Cash App, and more — choose the look you need.",
  },
  {
    n: "02",
    title: "Set your numbers",
    body: "Balances, names, and details fill in the dashboard. Change anything anytime.",
  },
  {
    n: "03",
    title: "Open and screenshot",
    body: "Desktop and phone views auto-fit. Install to the home screen when you want it.",
  },
] as const;

export default function HomePage() {
  const bySlug = new Map(getActivePlatforms().map((p) => [p.slug, p]));
  const platforms = FEATURED.map((slug) => bySlug.get(slug)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden px-5 pb-20 pt-[7.5rem] md:px-8 md:pb-28 md:pt-[9rem]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(0,0,0,0.045),transparent)]"
          />
          <div className="relative mx-auto max-w-[52rem] text-center">
            <p className="reveal text-[0.78rem] font-medium uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Mock dashboards
            </p>
            <h1 className="display-title reveal reveal-delay-1 mt-4">
              Screenshot-ready LARPs.
              <br />
              Clean. Simple. Fast.
            </h1>
            <p className="lead reveal reveal-delay-2 mx-auto mt-6 max-w-xl">
              Build mock financial and creator dashboards that look real. Free
              with a watermark — Pro removes it forever.
            </p>
            <div className="reveal reveal-delay-3 mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link href="/dashboard">
                <Button size="lg">Open app</Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline">
                  View pricing
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section
          id="platforms"
          className="border-t border-[var(--hairline)] bg-[var(--surface)] px-5 py-20 md:px-8 md:py-28"
        >
          <div className="mx-auto max-w-[68rem]">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="page-title text-[clamp(1.75rem,3vw,2.35rem)]">
                Platforms people actually need
              </h2>
              <p className="lead mt-3 text-[1.05rem]">
                One place for wallets, payments, creator tools, and receipts.
                Open a hub, create a LARP, done.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {platforms.map((platform) => (
                <Link
                  key={platform.id}
                  href={platform.href}
                  className="group flex min-h-[8.5rem] flex-col items-center justify-center gap-3 rounded-[1.35rem] border border-[var(--hairline)] bg-[var(--bg)] px-3 py-6 transition duration-300 hover:-translate-y-0.5 hover:border-[var(--ink)]/25 hover:bg-white hover:shadow-[var(--shadow-card)]"
                >
                  <PlatformLogo
                    slug={platform.slug}
                    name={platform.name}
                    size={48}
                    className="rounded-[1.1rem]"
                  />
                  <span className="text-center text-[0.95rem] font-semibold tracking-tight text-[var(--ink)]">
                    {platform.name}
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/larps/new"
                className="text-sm font-semibold text-[var(--ink)] underline-offset-4 hover:underline"
              >
                Browse all platforms
              </Link>
            </div>
          </div>
        </section>

        <section
          id="how"
          className="border-t border-[var(--hairline)] px-5 py-20 md:px-8 md:py-28"
        >
          <div className="mx-auto max-w-[68rem]">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="page-title text-[clamp(1.75rem,3vw,2.35rem)]">
                How it works
              </h2>
              <p className="lead mt-3 text-[1.05rem]">
                Three steps. No clutter. Built for quick screenshots.
              </p>
            </div>
            <div className="mt-14 grid gap-8 md:grid-cols-3 md:gap-6">
              {STEPS.map((step) => (
                <div
                  key={step.n}
                  className="rounded-[1.5rem] border border-[var(--hairline)] bg-[var(--surface)] p-7"
                >
                  <p className="text-xs font-semibold tracking-[0.12em] text-[var(--text-muted)]">
                    {step.n}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight text-[var(--ink)]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-[var(--text-secondary)]">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--hairline)] bg-[var(--ink)] px-5 py-20 text-white md:px-8 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-[clamp(1.85rem,3.5vw,2.6rem)] font-semibold tracking-[-0.04em]">
              Ready when you are.
            </h2>
            <p className="mt-4 text-[1.05rem] leading-relaxed text-white/65">
              Jump into the app and create your first LARP in under a minute.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-white text-[var(--ink)] hover:bg-white/90"
                >
                  Open app
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-white hover:bg-white/10 hover:text-white"
                >
                  Pricing
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--hairline)] bg-[var(--surface)] px-5 py-10 md:px-8">
        <div className="mx-auto flex max-w-[68rem] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-extrabold tracking-tight text-[var(--ink)]">
            LarpCity
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--text-secondary)]">
            <Link href="/pricing" className="hover:text-[var(--ink)]">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-[var(--ink)]">
              Sign in
            </Link>
            <Link href="/dashboard" className="hover:text-[var(--ink)]">
              App
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
