"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getLocalLarp, type LocalLarp } from "@/lib/larps/local-store";
import {
  buildStripePayload,
  injectStripeViewerHtml,
  type StripePayload,
} from "@/lib/larps/stripe-payload";
import { getPlatformBySlug } from "@/lib/platforms/catalog";

function isMobileViewport() {
  if (typeof window === "undefined") return false;
  try {
    return (
      window.matchMedia("(max-width: 768px)").matches ||
      window.matchMedia("(max-width: 1024px) and (pointer: coarse)").matches
    );
  } catch {
    return window.innerWidth < 768;
  }
}

function injectMobileHtml(template: string, payload: StripePayload) {
  let html = template;
  html = html.replace(
    /<title>[\s\S]*?<\/title>/,
    `<title>${payload.biz} – Stripe</title>`,
  );
  html = html.replace(
    /<script id="payload" type="application\/json">[\s\S]*?<\/script>/,
    `<script id="payload" type="application/json">${JSON.stringify(payload)}</script>`,
  );
  return html;
}

async function loadStripeHtml(larp: LocalLarp, mobile: boolean): Promise<string> {
  const templatePath = mobile
    ? "/larp-viewers/stripe/mobile.html"
    : "/larp-viewers/stripe/home.html";
  const [templateRes, payloadRes] = await Promise.all([
    fetch(templatePath, { cache: "force-cache" }),
    fetch("/larp-viewers/stripe/base-payload.json", { cache: "force-cache" }),
  ]);
  if (!templateRes.ok || !payloadRes.ok) {
    throw new Error("Failed to load Stripe viewer assets");
  }
  const template = await templateRes.text();
  const base = (await payloadRes.json()) as StripePayload;
  const payload = buildStripePayload(base, larp.data ?? {}, {
    id: larp.id,
    title: larp.title,
  });
  return mobile
    ? injectMobileHtml(template, payload)
    : injectStripeViewerHtml(template, payload);
}

async function loadGenericHtml(larp: LocalLarp): Promise<string> {
  const res = await fetch("/larp-viewers/generic/home.html", {
    cache: "force-cache",
  });
  if (!res.ok) throw new Error("Failed to load generic viewer");
  let html = await res.text();
  const platform = getPlatformBySlug(larp.platform_slug);
  const data = larp.data ?? {};
  const payload = {
    biz: String(data.businessName || data.username || larp.title || "Business"),
    platform: platform?.name || larp.platform_slug,
    balance: String(data.balance || "$0.00"),
    gross: String(data.gross || data.balance || "$0.00"),
    net: String(data.net || data.balance || "$0.00"),
  };
  html = html.replace(
    /<script id="payload" type="application\/json">[\s\S]*?<\/script>/,
    `<script id="payload" type="application/json">${JSON.stringify(payload)}</script>`,
  );
  html = html.replace(
    /<title>[\s\S]*?<\/title>/,
    `<title>${payload.biz} – ${payload.platform}</title>`,
  );
  return html;
}

export function LocalLarpClient({ id }: { id: string }) {
  const [larp, setLarp] = useState<LocalLarp | null | undefined>(undefined);
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setLarp(getLocalLarp(id));
    const sync = () => setMobile(isMobileViewport());
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [id]);

  useEffect(() => {
    if (!larp) return;
    let cancelled = false;
    setHtml(null);
    setError(null);

    const loader =
      larp.platform_slug === "stripe"
        ? () => loadStripeHtml(larp, mobile)
        : () => loadGenericHtml(larp);

    loader()
      .then((doc) => {
        if (!cancelled) setHtml(doc);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to open LARP");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [larp, mobile]);

  if (larp === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b] text-sm text-white/50">
        Opening LARP…
      </div>
    );
  }

  if (!larp) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 bg-[#0a0a0b] px-6 text-center text-[var(--paper)]">
        <h1 className="page-title">LARP not found</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          That local LARP isn&apos;t on this device anymore.
        </p>
        <Link href="/larps">
          <Button>Back to my larps</Button>
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 bg-[#0a0a0b] px-6 text-center text-[var(--paper)]">
        <h1 className="page-title">Couldn&apos;t open dashboard</h1>
        <p className="text-sm text-[var(--text-secondary)]">{error}</p>
        <Link href="/larps">
          <Button>Back to my larps</Button>
        </Link>
      </div>
    );
  }

  if (!html) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-slate-500">
        Building {mobile ? "mobile" : "desktop"} {larp.platform_slug}{" "}
        dashboard…
      </div>
    );
  }

  return (
    <iframe
      title={`${larp.title} dashboard`}
      className="fixed inset-0 h-full w-full border-0 bg-white"
      srcDoc={html}
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation-by-user-activation"
    />
  );
}
