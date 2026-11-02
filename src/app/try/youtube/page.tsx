import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { YouTubeNewLarpForm } from "@/components/platforms/forms/YouTubeNewLarpForm";

export const metadata = {
  title: "Try YouTube Studio · LarpingKit",
  description:
    "Build a YouTube Studio LARP with your channel numbers — live form, no account required to start.",
};

export default function TryYouTubePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 pb-20 pt-[7.5rem] md:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-secondary)]">
          Live Studio build · no signup
        </p>
        <h1 className="page-title mt-3 text-[clamp(1.85rem,3vw,2.5rem)]">
          Your YouTube Studio, your numbers.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
          Set channel name, subs, and views — then open a Studio-style dashboard
          ready for screenshots. Same create flow as the app.
        </p>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          Prefer commerce?{" "}
          <Link
            href="/try/shopify"
            className="font-medium text-[var(--ink)] underline-offset-2 hover:underline"
          >
            Try Shopify
          </Link>
        </p>
        <div className="mt-10">
          <YouTubeNewLarpForm />
        </div>
      </main>
    </div>
  );
}
