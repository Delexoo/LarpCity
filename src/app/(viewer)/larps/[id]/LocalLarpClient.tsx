"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { InstallLarpPrompt } from "@/components/larps/InstallLarpPrompt";
import { LarpWatermark } from "@/components/larps/LarpWatermark";
import { Button } from "@/components/ui/Button";
import { useLocalPlan } from "@/hooks/useLocalPlan";
import {
  resolveLocalLarp,
  type LocalLarp,
} from "@/lib/larps/local-store";
import {
  buildStripePayload,
  injectStripeViewerHtml,
  type StripePayload,
} from "@/lib/larps/stripe-payload";
import {
  buildVenmoPayload,
  injectVenmoViewerHtml,
  type VenmoPayload,
} from "@/lib/larps/venmo-payload";
import { getPlatformBySlug } from "@/lib/platforms/catalog";

function StripeProtectMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 512 214"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Stripe"
    >
      <path
        fill="#fff"
        d="M512 110.08c0-36.409-17.636-65.138-51.342-65.138-33.85 0-54.33 28.73-54.33 64.854 0 42.808 24.179 64.426 58.88 64.426 16.925 0 29.725-3.84 39.396-9.244v-28.445c-9.67 4.836-20.764 7.823-34.844 7.823-13.796 0-26.027-4.836-27.591-21.618h69.547c0-1.85.284-9.245.284-12.658m-70.258-13.511c0-16.071 9.814-22.756 18.774-22.756 8.675 0 17.92 6.685 17.92 22.756zm-90.31-51.627c-13.939 0-22.899 6.542-27.876 11.094l-1.85-8.818h-31.288v165.83l35.555-7.537.143-40.249c5.12 3.698 12.657 8.96 25.173 8.96 25.458 0 48.64-20.48 48.64-65.564-.142-41.245-23.609-63.716-48.498-63.716m-8.534 97.991c-8.391 0-13.37-2.986-16.782-6.684l-.143-52.765c3.698-4.124 8.818-6.968 16.925-6.968 12.942 0 21.902 14.506 21.902 33.137 0 19.058-8.818 33.28-21.902 33.28M241.493 36.551l35.698-7.68V0l-35.698 7.538zm0 10.809h35.698v124.444h-35.698zm-38.257 10.524L200.96 47.36h-30.72v124.444h35.556V87.467c8.39-10.951 22.613-8.96 27.022-7.396V47.36c-4.551-1.707-21.191-4.836-29.582 10.524m-71.112-41.386-34.702 7.395-.142 113.92c0 21.05 15.787 36.551 36.836 36.551 11.662 0 20.195-2.133 24.888-4.693V140.8c-4.55 1.849-27.022 8.391-27.022-12.658V77.653h27.022V47.36h-27.022zM35.982 83.484c0-5.546 4.551-7.68 12.09-7.68 10.808 0 24.461 3.272 35.27 9.103V51.484c-11.804-4.693-23.466-6.542-35.27-6.542C19.2 44.942 0 60.018 0 85.192c0 39.252 54.044 32.995 54.044 49.92 0 6.541-5.688 8.675-13.653 8.675-11.804 0-26.88-4.836-38.827-11.378v33.849c13.227 5.689 26.596 8.106 38.827 8.106 29.582 0 49.92-14.648 49.92-40.106-.142-42.382-54.329-34.845-54.329-50.774"
      />
    </svg>
  );
}

/** Official Stripe mobile splash: purple field, wordmark, indeterminate arc. */
function StripeSplashLoader() {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#635bff]"
      aria-busy="true"
      aria-label="Loading"
    >
      <style>{`
        @keyframes st-splash-rot {
          to { transform: rotate(360deg); }
        }
        @keyframes st-splash-arc {
          0%   { stroke-dasharray: 12 63.4; stroke-dashoffset: 0; }
          50%  { stroke-dasharray: 40 63.4; stroke-dashoffset: -18; }
          100% { stroke-dasharray: 12 63.4; stroke-dashoffset: -75.4; }
        }
        .st-splash-spin {
          position: absolute;
          left: 50%;
          top: calc(50% + 66px);
          width: 27px;
          height: 27px;
          margin: -13.5px 0 0 -13.5px;
          animation: st-splash-rot 1.15s linear infinite;
          will-change: transform;
        }
        .st-splash-spin .arc {
          fill: none;
          stroke: #fff;
          stroke-width: 3;
          stroke-linecap: round;
          animation: st-splash-arc 1.15s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .st-splash-spin .track {
          fill: none;
          stroke: #7561fd;
          stroke-width: 3;
        }
      `}</style>
      <StripeProtectMark className="w-[118px] -translate-y-3" />
      <svg className="st-splash-spin" viewBox="0 0 27 27" aria-hidden="true">
        <circle className="track" cx="13.5" cy="13.5" r="12" />
        <circle className="arc" cx="13.5" cy="13.5" r="12" />
      </svg>
    </div>
  );
}

function isMobileViewport() {
  if (typeof window === "undefined") return false;
  try {
    // Prefer the real Stripe phone app only on actual handset-sized viewports.
    // Narrow desktop panes keep the official desktop dashboard.
    const phoneWidth = window.matchMedia("(max-width: 480px)").matches;
    const tabletPhone =
      window.matchMedia("(max-width: 700px) and (pointer: coarse)").matches;
    return phoneWidth || tabletPhone;
  } catch {
    return window.innerWidth <= 480;
  }
}

function injectMobileHtml(template: string, payload: StripePayload) {
  const themeClass = payload.x.theme === "dark" ? "dk" : "lt";
  let html = template;
  html = html.replace(
    /<title>[\s\S]*?<\/title>/,
    `<title>${payload.biz} – Stripe</title>`,
  );
  html = html.replace(
    /<body class="[^"]*">/,
    `<body class="${themeClass}">`,
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
    // Avoid sticky stale mobile/desktop shells after deploys.
    fetch(templatePath, { cache: "no-store" }),
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

async function loadVenmoHtml(
  larp: LocalLarp,
  mobile: boolean,
): Promise<string> {
  // Phone viewport → Venmo iPhone app; desktop → account.venmo.com website.
  const templatePath = mobile
    ? "/larp-viewers/venmo/mobile.html"
    : "/larp-viewers/venmo/home.html";
  const res = await fetch(templatePath, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load Venmo viewer assets");
  const template = await res.text();
  const m = template.match(
    /<script id="payload" type="application\/json">([\s\S]*?)<\/script>/,
  );
  if (!m) throw new Error("Venmo payload missing");
  const base = JSON.parse(m[1]) as VenmoPayload;
  const payload = buildVenmoPayload(base, larp.data ?? {}, {
    id: larp.id,
    title: larp.title,
  });
  return injectVenmoViewerHtml(template, payload, { mobile });
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
  const { isPro, ready: planReady } = useLocalPlan();
  const [larp, setLarp] = useState<LocalLarp | null | undefined>(undefined);
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [protect, setProtect] = useState(false);
  const [frameReady, setFrameReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLarp(undefined);
    // localStorage → install cookie (iOS) → cloud snapshot
    resolveLocalLarp(id).then((found) => {
      if (!cancelled) setLarp(found);
    });
    const sync = () => setMobile(isMobileViewport());
    sync();
    window.addEventListener("resize", sync);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", sync);
    };
  }, [id]);

  // Purple Stripe cover when leaving/returning (app switcher + tab hide).
  useEffect(() => {
    if (!mobile || larp?.platform_slug !== "stripe") return;
    let hideT: ReturnType<typeof setTimeout> | null = null;
    const post = (type: "lc-protect-show" | "lc-protect-hide") => {
      try {
        iframeRef.current?.contentWindow?.postMessage({ type }, "*");
      } catch {
        /* ignore */
      }
    };
    const onHide = () => {
      if (hideT) clearTimeout(hideT);
      setProtect(true);
      post("lc-protect-show");
    };
    const onShow = () => {
      post("lc-protect-hide");
      hideT = setTimeout(() => setProtect(false), 380);
    };
    const onVis = () => {
      if (document.hidden) onHide();
      else onShow();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", onHide);
    window.addEventListener("pageshow", onShow);
    return () => {
      if (hideT) clearTimeout(hideT);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("pageshow", onShow);
    };
  }, [mobile, larp?.platform_slug]);

  useEffect(() => {
    if (!larp) return;
    let cancelled = false;
    setHtml(null);
    setFrameReady(false);
    setError(null);

    const loader =
      larp.platform_slug === "stripe"
        ? () => loadStripeHtml(larp, mobile)
        : larp.platform_slug === "venmo"
          ? () => loadVenmoHtml(larp, mobile)
          : () => loadGenericHtml(larp);

    loader()
      .then((doc) => {
        if (cancelled) return;
        setHtml(doc);
        const platform = getPlatformBySlug(larp.platform_slug);
        const name =
          String(
            larp.data?.businessName || larp.title || platform?.name || "LARP",
          ).trim() || "LARP";
        const brand = platform?.name || larp.platform_slug;
        document.title =
          larp.platform_slug === "stripe"
            ? `Home – ${name} – Stripe`
            : larp.platform_slug === "venmo"
              ? `${name} – Venmo`
              : `${name} – ${brand}`;
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
    // Quiet shell until platform is known (Stripe then paints its purple splash).
    return <div className="min-h-screen bg-[var(--bg)]" aria-busy="true" />;
  }

  if (!larp) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 bg-[var(--bg)] px-6 text-center text-[var(--ink)]">
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
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 bg-[var(--bg)] px-6 text-center text-[var(--ink)]">
        <h1 className="page-title">Couldn&apos;t open dashboard</h1>
        <p className="text-sm text-[var(--text-secondary)]">{error}</p>
        <Link href="/larps">
          <Button>Back to my larps</Button>
        </Link>
      </div>
    );
  }

  const isStripe = larp.platform_slug === "stripe";
  const showStripeSplash = isStripe && (!html || !frameReady);

  if (!html && !isStripe) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[var(--bg)]"
        aria-busy="true"
        aria-label="Loading"
      />
    );
  }

  return (
    <>
      {html ? (
        <iframe
          ref={iframeRef}
          title={`${larp.title} dashboard`}
          className="fixed inset-0 h-full w-full border-0 bg-white"
          srcDoc={html}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation-by-user-activation"
          onLoad={() => setFrameReady(true)}
        />
      ) : null}
      {showStripeSplash ? <StripeSplashLoader /> : null}
      {mobile && isStripe && protect ? (
        <button
          type="button"
          aria-label="Unlock Stripe"
          onClick={() => setProtect(false)}
          className="fixed inset-0 z-[70] flex items-center justify-center border-0 bg-[#635bff]"
        >
          <StripeProtectMark className="w-[118px] -translate-y-3" />
        </button>
      ) : null}
      {planReady && !isPro ? <LarpWatermark /> : null}
      <InstallLarpPrompt larpId={larp.id} />
    </>
  );
}
