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
    title: "Pick the app",
    body: "Stripe, Cash App, Coinbase, Shopify, YouTube Studio, Chase, and more.",
  },
  {
    n: "02",
    title: "Type your numbers",
    body: "Balances, names, charts, and activity update every screen.",
  },
  {
    n: "03",
    title: "Open like an app",
    body: "Screenshot in the browser or install to the home screen for a clean chrome-free view.",
  },
] as const;

const FAQ = [
  {
    q: "How realistic are the mockups?",
    a: "Ready platforms are rebuilt screen-for-screen for screenshots. Unfinished hubs show as Soon in the sidebar.",
  },
  {
    q: "Do I need an account?",
    a: "You can create LARPs locally on this device right away. Auth and Pro billing hook in when you enable them.",
  },
  {
    q: "What is Pro?",
    a: "Free includes ready platforms with a small watermark. Pro removes the watermark.",
  },
  {
    q: "Are you affiliated with these brands?",
    a: "No. LarpCity is independent. All trademarks belong to their owners.",
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
              Look like you made it
            </p>
            <h1 className="display-title reveal reveal-delay-1 mt-4">
              Your numbers.
              <br />
              Real-looking apps.
            </h1>
            <p className="lead reveal reveal-delay-2 mx-auto mt-6 max-w-xl">
              Cash App, Coinbase, Stripe, Shopify, YouTube Studio, Chase, and
              more — screenshot-ready LARPs on your phone or in the browser.
            </p>
            <div className="reveal reveal-delay-3 mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link href="/dashboard">
                <Button size="lg">Start free</Button>
              </Link>
              <Link href="/try/shopify">
                <Button size="lg" variant="outline">
                  Try Shopify
                </Button>
              </Link>
            </div>
            <p className="reveal reveal-delay-3 mt-4 text-xs text-[var(--text-muted)]">
              No card needed · Try{" "}
              <Link href="/try/youtube" className="underline-offset-2 hover:underline">
                YouTube Studio
              </Link>{" "}
              too
            </p>
          </div>
        </section>

        <section
          id="platforms"
          className="border-t border-[var(--hairline)] bg-[var(--surface)] px-5 py-20 md:px-8 md:py-28"
        >
          <div className="mx-auto max-w-[68rem]">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="page-title text-[clamp(1.75rem,3vw,2.35rem)]">
                Everything you need to LARP
              </h2>
              <p className="lead mt-3 text-[1.05rem]">
                Ready platforms are live. The rest sit as clickable Soon in the
                app.
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
                Not just a screenshot. The app.
              </h2>
              <p className="lead mt-3 text-[1.05rem]">
                Three steps. Home-screen install when you want the full chrome-free
                look.
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

        <section
          id="faq"
          className="border-t border-[var(--hairline)] bg-[var(--surface)] px-5 py-20 md:px-8 md:py-28"
        >
          <div className="mx-auto max-w-3xl">
            <h2 className="page-title text-center text-[clamp(1.75rem,3vw,2.35rem)]">
              Questions, answered
            </h2>
            <div className="mt-12 space-y-4">
              {FAQ.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-[1.25rem] border border-[var(--hairline)] bg-[var(--bg)] px-5 py-4"
                >
                  <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--ink)]">
                    {item.q}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {item.a}
                  </p>
                </details>
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
            <Link href="/try/shopify" className="hover:text-[var(--ink)]">
              Try Shopify
            </Link>
            <Link href="/pricing" className="hover:text-[var(--ink)]">
              Pricing
            </Link>
            <Link href="/legal/terms" className="hover:text-[var(--ink)]">
              Terms
            </Link>
            <Link href="/legal/privacy" className="hover:text-[var(--ink)]">
              Privacy
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
