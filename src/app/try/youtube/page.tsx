import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Try YouTube Studio · LarpCity",
  description: "Build a YouTube Studio LARP with your channel numbers.",
};

export default function TryYouTubePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 pb-20 pt-[7.5rem] md:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-secondary)]">
          Free try
        </p>
        <h1 className="page-title mt-3 text-[clamp(1.85rem,3vw,2.5rem)]">
          Your YouTube Studio, your numbers.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
          Set channel name, subs, and views — open a Studio-style dashboard ready
          for screenshots.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/platforms/youtube-studio/new">
            <Button size="lg">Build YouTube LARP</Button>
          </Link>
          <Link href="/try/shopify">
            <Button size="lg" variant="outline">
              Try Shopify
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
