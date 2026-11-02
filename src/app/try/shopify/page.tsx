import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Try Shopify · LarpCity",
  description: "Build a Shopify admin LARP with your numbers in under a minute.",
};

export default function TryShopifyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 pb-20 pt-[7.5rem] md:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-secondary)]">
          Free try
        </p>
        <h1 className="page-title mt-3 text-[clamp(1.85rem,3vw,2.5rem)]">
          Your Shopify admin, at the numbers you want.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
          Type a store name and sales figure, then open a screenshot-ready Shopify
          home. Same flow as the full create form — no account required to start.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/platforms/shopify/new">
            <Button size="lg">Build Shopify LARP</Button>
          </Link>
          <Link href="/try/youtube">
            <Button size="lg" variant="outline">
              Try YouTube Studio
            </Button>
          </Link>
        </div>
        <ul className="mt-10 space-y-3 text-sm text-[var(--text-secondary)]">
          <li>· Presets for $1K → $1M sales vibes</li>
          <li>· Desktop + mobile viewers</li>
          <li>· Saved locally on this device</li>
        </ul>
      </main>
    </div>
  );
}
