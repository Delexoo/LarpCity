import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ShopifyNewLarpForm } from "@/components/platforms/forms/ShopifyNewLarpForm";

export const metadata = {
  title: "Try Shopify · LarpingKit",
  description:
    "Build a Shopify admin LARP with your numbers in under a minute — live form, no account required to start.",
};

export default function TryShopifyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 pb-20 pt-[7.5rem] md:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-secondary)]">
          Live Shopify build · no signup
        </p>
        <h1 className="page-title mt-3 text-[clamp(1.85rem,3vw,2.5rem)]">
          Your Shopify admin, at the numbers you want.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
          Type a store name, set sales, pick a vibe. Same create flow as the app —
          saved on this device, screenshot-ready in under a minute.
        </p>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          Prefer Studio?{" "}
          <Link
            href="/try/youtube"
            className="font-medium text-[var(--ink)] underline-offset-2 hover:underline"
          >
            Try YouTube Studio
          </Link>
        </p>
        <div className="mt-10">
          <ShopifyNewLarpForm />
        </div>
      </main>
    </div>
  );
}
