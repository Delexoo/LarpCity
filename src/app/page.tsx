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
  "instagram",
];

export default function HomePage() {
  const bySlug = new Map(getActivePlatforms().map((p) => [p.slug, p]));
  const platforms = FEATURED.map((slug) => bySlug.get(slug)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <SiteHeader />

      <main>
        {/* Full first viewport — brand, one line, one CTA */}
        <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-5 pb-16 pt-24 md:px-8">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_20%,rgba(0,0,0,0.05),transparent_70%)]"
          />
          <div className="relative mx-auto w-full max-w-[40rem] text-center">
            <p className="wordmark text-[clamp(2.4rem,8vw,4.25rem)] leading-none tracking-[-0.04em] text-[var(--ink-pure)]">
              LarpingKit
            </p>
            <h1 className="mt-5 text-[clamp(1.15rem,2.4vw,1.45rem)] font-medium tracking-tight text-[var(--ink)]">
              Screenshot-ready mock dashboards.
            </h1>
            <p className="mx-auto mt-3 max-w-md text-[0.95rem] leading-relaxed text-[var(--text-secondary)]">
              Stripe, Cash App, Coinbase, Shopify, and more — your numbers, in
              under a minute.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/dashboard">
                <Button size="lg">Open app</Button>
              </Link>
              <Link href="/try/shopify">
                <Button size="lg" variant="outline">
                  Try Shopify
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-[var(--text-muted)]">
              Or{" "}
              <Link
                href="/try/youtube"
                className="underline-offset-2 hover:underline"
              >
                try YouTube Studio
              </Link>{" "}
              · no card needed
            </p>
          </div>
        </section>

        <section className="border-t border-[var(--hairline)] bg-[var(--bg)] px-5 py-14 md:px-8">
          <div className="mx-auto grid max-w-[56rem] gap-8 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Pick the app",
                b: "Stripe, Cash App, Coinbase, Shopify, YouTube Studio, Chase, and more.",
              },
              {
                n: "02",
                t: "Type your numbers",
                b: "Balances, names, charts, and activity update every screen.",
              },
              {
                n: "03",
                t: "Screenshot or install",
                b: "Open in the browser or add to the home screen for a clean view.",
              },
            ].map((s) => (
              <div key={s.n}>
                <p className="text-xs font-semibold tracking-[0.12em] text-[var(--text-muted)]">
                  {s.n}
                </p>
                <h2 className="mt-2 text-[1.05rem] font-semibold tracking-tight text-[var(--ink)]">
                  {s.t}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {s.b}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="platforms"
          className="border-t border-[var(--hairline)] bg-[var(--surface)] px-5 py-16 md:px-8 md:py-20"
        >
          <div className="mx-auto max-w-[56rem]">
            <h2 className="page-title text-center text-[clamp(1.5rem,2.5vw,1.9rem)]">
              Ready platforms
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {platforms.map((platform) => (
                <Link
                  key={platform.id}
                  href={platform.href}
                  className="flex min-h-[6.5rem] flex-col items-center justify-center gap-2.5 rounded-[1.25rem] border border-[var(--hairline)] bg-[var(--bg)] px-3 py-4 transition hover:border-[var(--ink)]/25 active:scale-[0.98]"
                >
                  <PlatformLogo
                    slug={platform.slug}
                    name={platform.name}
                    size={40}
                    className="rounded-[0.9rem]"
                  />
                  <span className="text-center text-[0.88rem] font-semibold tracking-tight text-[var(--ink)]">
                    {platform.name}
                  </span>
                </Link>
              ))}
            </div>
            <p className="mt-8 text-center">
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-[var(--ink)] underline-offset-4 hover:underline"
              >
                Go to Home
              </Link>
            </p>
          </div>
        </section>

        <section
          id="faq"
          className="border-t border-[var(--hairline)] bg-[var(--bg)] px-5 py-16 md:px-8"
        >
          <div className="mx-auto max-w-[40rem]">
            <h2 className="page-title text-center text-[clamp(1.5rem,2.5vw,1.9rem)]">
              Questions
            </h2>
            <dl className="mt-8 space-y-5">
              {[
                {
                  q: "How realistic are the mockups?",
                  a: "Ready platforms are rebuilt screen-for-screen for screenshots. Unfinished hubs show as Soon in the sidebar.",
                },
                {
                  q: "Do I need an account?",
                  a: "You can create LARPs locally on this device right away — including the free Shopify and YouTube try builders.",
                },
                {
                  q: "What is Pro?",
                  a: "Free includes ready platforms with a small watermark. Pro removes the watermark.",
                },
                {
                  q: "Are you affiliated with these brands?",
                  a: "No. LarpingKit is independent. All trademarks belong to their owners.",
                },
              ].map((item) => (
                <div key={item.q}>
                  <dt className="text-sm font-semibold text-[var(--ink)]">
                    {item.q}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {item.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="border-t border-[var(--hairline)] bg-[var(--ink)] px-5 py-16 text-white md:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-[-0.03em]">
              Free to start.
            </h2>
            <p className="mt-3 text-[0.95rem] text-white/65">
              Watermark on Free. Pro removes it.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-white text-[var(--ink)] hover:bg-white/90"
                >
                  Start free
                </Button>
              </Link>
              <Link href="/try/shopify">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Try Shopify
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--hairline)] bg-[var(--surface)] px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-[56rem] flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-extrabold tracking-tight text-[var(--ink)]">
            LarpingKit
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--text-secondary)]">
            <Link href="/pricing" className="hover:text-[var(--ink)]">
              Pricing
            </Link>
            <Link href="/legal/terms" className="hover:text-[var(--ink)]">
              Terms
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
