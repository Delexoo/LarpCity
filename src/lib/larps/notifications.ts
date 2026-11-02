import type { LocalLarp } from "@/lib/larps/local-store";
import { getPlatformBySlug } from "@/lib/platforms/catalog";

const KEY = (id: string) => `larpcity.larp.notifications.${id}`;

export type LarpNotificationPrefs = {
  enabled: boolean;
  updatedAt: number;
};

export function getLarpNotificationPrefs(id: string): LarpNotificationPrefs {
  if (typeof window === "undefined") return { enabled: false, updatedAt: 0 };
  try {
    const raw = localStorage.getItem(KEY(id));
    if (!raw) return { enabled: false, updatedAt: 0 };
    const parsed = JSON.parse(raw) as LarpNotificationPrefs;
    return {
      enabled: Boolean(parsed.enabled),
      updatedAt: Number(parsed.updatedAt) || 0,
    };
  } catch {
    return { enabled: false, updatedAt: 0 };
  }
}

export function setLarpNotificationPrefs(
  id: string,
  prefs: Partial<LarpNotificationPrefs>,
): LarpNotificationPrefs {
  const next: LarpNotificationPrefs = {
    ...getLarpNotificationPrefs(id),
    ...prefs,
    updatedAt: Date.now(),
  };
  try {
    localStorage.setItem(KEY(id), JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
  return next;
}

/** Absolute icon URL for Notification API (requires https / localhost). */
export function platformNotificationIcon(slug: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const map: Record<string, string> = {
    venmo: "/brand-logos/venmo.png",
    stripe: "/brand-logos/stripe.png",
    cashapp: "/brand-logos/cashapp.png",
    "cash-app": "/brand-logos/cash-app.png",
    paypal: "/brand-logos/paypal.png",
    zelle: "/brand-logos/zelle.png",
    bitcoin: "/brand-logos/bitcoin.png",
    "apple-pay": "/brand-logos/apple-pay.png",
    "google-pay": "/brand-logos/google-pay.png",
    discord: "/brand-logos/discord.jpg",
    gmail: "/brand-logos/gmail.jpg",
    instagram: "/brand-logos/instagram.svg",
  };
  const path = map[slug] || `/brand-logos/${slug}.png`;
  return `${origin}${path}`;
}

export function larpDisplayName(larp: LocalLarp): string {
  const data = larp.data ?? {};
  return (
    String(
      data.businessName || data.displayName || data.name || larp.title || "LARP",
    ).trim() || "LARP"
  );
}

export async function enableLarpNotifications(
  larp: LocalLarp,
): Promise<{ ok: boolean; reason?: string }> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return { ok: false, reason: "Notifications aren’t supported here." };
  }
  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }
  if (permission !== "granted") {
    return { ok: false, reason: "Permission denied." };
  }
  setLarpNotificationPrefs(larp.id, { enabled: true });
  await sendLarpNotification(larp, {
    body: "Notifications are on for this LARP.",
    tag: `larp-enabled-${larp.id}`,
  });
  return { ok: true };
}

export function disableLarpNotifications(id: string) {
  setLarpNotificationPrefs(id, { enabled: false });
}

export async function sendLarpNotification(
  larp: LocalLarp,
  opts?: { body?: string; tag?: string },
): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;
  if (!getLarpNotificationPrefs(larp.id).enabled) return false;

  const platform = getPlatformBySlug(larp.platform_slug);
  const name = larpDisplayName(larp);
  const platformName = platform?.name || larp.platform_slug;
  const title = name;
  const body =
    opts?.body ||
    `New activity in your ${platformName} dashboard.`;

  try {
    const n = new Notification(title, {
      body,
      icon: platformNotificationIcon(larp.platform_slug),
      badge: platformNotificationIcon(larp.platform_slug),
      tag: opts?.tag || `larp-${larp.id}`,
    });
    n.onclick = () => {
      window.focus();
      window.location.href = `/larps/${encodeURIComponent(larp.id)}`;
      n.close();
    };
    return true;
  } catch {
    return false;
  }
}
