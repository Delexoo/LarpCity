"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { getLocalLarp, syncLarpSnapshot } from "@/lib/larps/local-store";
import { getPlatformBrand } from "@/lib/larps/platform-brand";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function dismissKey(id: string) {
  const next = `larpingkit.pwa.dismissed.${id}`;
  try {
    if (
      typeof window !== "undefined" &&
      window.localStorage.getItem(next) == null
    ) {
      const legacy = window.localStorage.getItem(
        `larpcity.pwa.dismissed.${id}`,
      );
      if (legacy != null) window.localStorage.setItem(next, legacy);
    }
  } catch {
    /* ignore */
  }
  return next;
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  try {
    if (window.matchMedia("(display-mode: standalone)").matches) return true;
    const nav = window.navigator as Navigator & { standalone?: boolean };
    if (nav.standalone) return true;
  } catch {
    /* ignore */
  }
  return false;
}

function pwaIcon(brandIcon: string): string {
  if (/\.(png|jpe?g|webp)$/i.test(brandIcon)) return brandIcon;
  return brandIcon.replace(/\.svg$/i, ".png");
}

function ensurePwaMeta(opts: {
  appName: string;
  larpId: string;
  slug: string;
  iconPath: string;
  themeColor: string;
}) {
  // Remove every manifest so a prior LARP (or iframe inject) can't win install.
  document
    .querySelectorAll('link[rel="manifest"]')
    .forEach((node) => node.remove());

  const params = new URLSearchParams({
    name: opts.appName,
    slug: opts.slug,
    v: opts.larpId.slice(0, 8),
  });
  const link = document.createElement("link");
  link.id = "lc-larp-manifest";
  link.rel = "manifest";
  link.href = `/api/pwa/manifest/${encodeURIComponent(opts.larpId)}?${params}`;
  document.head.appendChild(link);

  const setMeta = (name: string, content: string) => {
    let el = document.querySelector(
      `meta[name="${name}"]`,
    ) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement("meta");
      el.name = name;
      document.head.appendChild(el);
    }
    el.content = content;
  };

  setMeta("theme-color", opts.themeColor);
  setMeta("apple-mobile-web-app-capable", "yes");
  setMeta("mobile-web-app-capable", "yes");
  setMeta("apple-mobile-web-app-status-bar-style", "default");
  setMeta("apple-mobile-web-app-title", opts.appName.slice(0, 12));

  let apple = document.querySelector(
    'link[rel="apple-touch-icon"]',
  ) as HTMLLinkElement | null;
  if (!apple) {
    apple = document.createElement("link");
    apple.rel = "apple-touch-icon";
    document.head.appendChild(apple);
  }
  apple.href = opts.iconPath;

  let icon = document.querySelector(
    'link[rel="icon"][data-lc-brand]',
  ) as HTMLLinkElement | null;
  if (!icon) {
    icon = document.createElement("link");
    icon.rel = "icon";
    icon.setAttribute("data-lc-brand", "1");
    document.head.appendChild(icon);
  }
  icon.href = opts.iconPath;
}

export function InstallLarpPrompt({
  larpId,
  className,
}: {
  larpId?: string;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const deferredForId = useRef<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [brandLabel, setBrandLabel] = useState("App");
  const [iconPath, setIconPath] = useState("/larplabslogo.png");
  const [themeColor, setThemeColor] = useState("#111111");

  useEffect(() => {
    if (!larpId) return;

    // Never reuse a BIP captured for a different LARP.
    setDeferred(null);
    deferredForId.current = null;
    setHint(null);

    const hideForever = () => {
      window.localStorage.setItem(dismissKey(larpId), "1");
      setVisible(false);
    };

    if (isStandalone()) {
      hideForever();
      return;
    }
    if (window.localStorage.getItem(dismissKey(larpId))) {
      setVisible(false);
      return;
    }

    const larp = getLocalLarp(larpId);
    const brand = getPlatformBrand(larp?.platform_slug || "");
    const appName = brand.name;
    const icon = pwaIcon(brand.iconPath);
    setBrandLabel(appName);
    setIconPath(icon);
    setThemeColor(brand.themeColor);

    ensurePwaMeta({
      appName,
      larpId,
      slug: larp?.platform_slug || "",
      iconPath: icon,
      themeColor: brand.themeColor,
    });

    // Seed cookie + cloud snapshot before the user installs (iOS only copies cookies).
    if (larp) void syncLarpSnapshot(larp);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    setVisible(true);

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      deferredForId.current = larpId;
    };
    const onInstalled = () => hideForever();

    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [larpId]);

  if (!visible || !larpId) return null;

  async function onInstall() {
    setHint(null);
    const larp = getLocalLarp(larpId!);
    if (larp) await syncLarpSnapshot(larp);

    // Re-assert this LARP's manifest right before prompting.
    const brand = getPlatformBrand(larp?.platform_slug || "");
    ensurePwaMeta({
      appName: brand.name,
      larpId: larpId!,
      slug: larp?.platform_slug || "",
      iconPath: pwaIcon(brand.iconPath),
      themeColor: brand.themeColor,
    });

    if (deferred && deferredForId.current === larpId) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        window.localStorage.setItem(dismissKey(larpId!), "1");
        setVisible(false);
      }
      setDeferred(null);
      deferredForId.current = null;
      return;
    }

    const ua = navigator.userAgent || "";
    const ios = /iPad|iPhone|iPod/.test(ua);
    setHint(
      ios
        ? "Tap Share, then Add to Home Screen."
        : deferred
          ? "Reload this LARP, then tap Install again so the correct app is used."
          : "Use your browser menu → Install app / Add to Home Screen.",
    );
  }

  function onDismiss() {
    window.localStorage.setItem(dismissKey(larpId!), "1");
    setVisible(false);
  }

  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-3 left-3 z-[80] flex max-w-[min(220px,calc(100vw-1.25rem))] flex-col items-start gap-1",
        className,
      )}
    >
      {hint ? (
        <p className="pointer-events-auto rounded-2xl border border-[var(--hairline)] bg-[#111]/95 px-2.5 py-1.5 text-[10px] leading-snug text-white shadow-md">
          {hint}
        </p>
      ) : null}
      <div
        className="pointer-events-auto flex h-8 items-center rounded-full pl-1.5 pr-0.5 text-white shadow-[0_6px_16px_rgba(0,0,0,.2)]"
        style={{ backgroundColor: `${themeColor}f2` }}
      >
        <button
          type="button"
          onClick={onInstall}
          className="inline-flex h-full items-center gap-1.5 rounded-full px-1.5 text-[11px] font-semibold leading-none tracking-tight"
        >
          <img
            src={iconPath}
            alt=""
            width={18}
            height={18}
            className="size-[18px] shrink-0 rounded-[5px] object-cover"
          />
          Install {brandLabel}
        </button>
        <button
          type="button"
          aria-label="Dismiss install prompt"
          onClick={onDismiss}
          className="grid size-6 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          <X className="size-3" strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}
