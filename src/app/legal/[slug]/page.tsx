import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";

const PAGES: Record<string, { title: string; body: string }> = {
  privacy: {
    title: "Privacy",
    body: "LarpCity stores LARPs on your device by default. Account and billing data (when enabled) is processed by Supabase and Stripe. We do not sell personal information.",
  },
  terms: {
    title: "Terms",
    body: "LarpCity provides mock dashboard tools for content and screenshots. You are responsible for how you use generated visuals. Not affiliated with Stripe, Coinbase, Shopify, YouTube, or any referenced brand.",
  },
  "refund-policy": {
    title: "Refund policy",
    body: "Digital Pro unlocks are delivered immediately. Contact support for billing issues; statutory rights may apply in your region.",
  },
  security: {
    title: "Security",
    body: "Secrets stay in environment variables. Prefer device-local LARP storage. Report issues via Support.",
  },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = PAGES[slug];
  return { title: page ? `${page.title} · LarpCity` : "Legal" };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 pb-20 pt-[7.5rem] md:px-8">
        <h1 className="page-title">{page.title}</h1>
        <p className="mt-6 text-sm leading-relaxed text-[var(--text-secondary)]">
          {page.body}
        </p>
        <Link
          href="/"
          className="mt-10 inline-block text-sm font-semibold text-[var(--ink)] underline-offset-4 hover:underline"
        >
          Back home
        </Link>
      </main>
    </div>
  );
}
