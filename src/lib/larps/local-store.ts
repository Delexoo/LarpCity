export type LocalLarp = {
  id: string;
  title: string;
  platform_slug: string;
  updated_at: string;
  created_at: string;
  is_public?: boolean;
  data: Record<string, unknown>;
};

const STORAGE_KEY = "larpcity.larps.v1";

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function listLocalLarps(): LocalLarp[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalLarp[];
    if (!Array.isArray(parsed)) return [];
    return parsed.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
  } catch {
    return [];
  }
}

export function getLocalLarp(id: string): LocalLarp | null {
  return listLocalLarps().find((larp) => larp.id === id) ?? null;
}

export function saveLocalLarps(larps: LocalLarp[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(larps));
}

export function createLocalLarp(input: {
  title: string;
  platform_slug: string;
  data?: Record<string, unknown>;
}): LocalLarp {
  const now = new Date().toISOString();
  const larp: LocalLarp = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `larp_${Date.now()}`,
    title: input.title.trim() || "Untitled LARP",
    platform_slug: input.platform_slug,
    created_at: now,
    updated_at: now,
    is_public: false,
    data: input.data ?? {},
  };

  const next = [larp, ...listLocalLarps().filter((item) => item.id !== larp.id)];
  saveLocalLarps(next);
  return larp;
}

export function listLocalLarpsForPlatform(slug: string): LocalLarp[] {
  return listLocalLarps().filter((larp) => larp.platform_slug === slug);
}

export function updateLocalLarp(
  id: string,
  patch: Partial<Pick<LocalLarp, "title" | "data" | "is_public">>,
): LocalLarp | null {
  const all = listLocalLarps();
  const idx = all.findIndex((larp) => larp.id === id);
  if (idx < 0) return null;
  const current = all[idx];
  const next: LocalLarp = {
    ...current,
    title: patch.title?.trim() || current.title,
    data: patch.data ? { ...current.data, ...patch.data } : current.data,
    is_public: patch.is_public ?? current.is_public,
    updated_at: new Date().toISOString(),
  };
  const list = [...all];
  list[idx] = next;
  saveLocalLarps(list);
  return next;
}

export function deleteLocalLarp(id: string): boolean {
  const all = listLocalLarps();
  const next = all.filter((larp) => larp.id !== id);
  if (next.length === all.length) return false;
  saveLocalLarps(next);
  return true;
}

/** Upsert a LARP into the local list (used when hydrating from cookie/API). */
export function upsertLocalLarp(larp: LocalLarp): LocalLarp {
  const next = [larp, ...listLocalLarps().filter((item) => item.id !== larp.id)];
  saveLocalLarps(next);
  return larp;
}

function cookieName(id: string) {
  return `lc_larp_${id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 48)}`;
}

function encodeLarpCookie(larp: LocalLarp): string | null {
  try {
    const json = JSON.stringify(larp);
    const b64 = btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
    // Stay under typical 4KB cookie limits.
    if (b64.length > 3500) return null;
    return b64;
  } catch {
    return null;
  }
}

function decodeLarpCookie(raw: string): LocalLarp | null {
  try {
    const pad = raw.length % 4 === 0 ? "" : "=".repeat(4 - (raw.length % 4));
    const b64 = raw.replace(/-/g, "+").replace(/_/g, "/") + pad;
    const json = decodeURIComponent(escape(atob(b64)));
    const parsed = JSON.parse(json) as LocalLarp;
    if (!parsed?.id || !parsed.platform_slug) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** iOS copies cookies (not localStorage) into Home Screen web apps at install. */
export function writeInstallCookie(larp: LocalLarp) {
  if (typeof document === "undefined") return;
  const value = encodeLarpCookie(larp);
  if (!value) return;
  const secure = typeof location !== "undefined" && location.protocol === "https:";
  document.cookie = `${cookieName(larp.id)}=${value}; Path=/; Max-Age=31536000; SameSite=Lax${secure ? "; Secure" : ""}`;
}

export function readInstallCookie(id: string): LocalLarp | null {
  if (typeof document === "undefined") return null;
  const key = `${cookieName(id)}=`;
  const hit = document.cookie.split("; ").find((row) => row.startsWith(key));
  if (!hit) return null;
  return decodeLarpCookie(hit.slice(key.length));
}

/** Push LARP to cloud snapshot so installed PWAs can hydrate without localStorage. */
export async function syncLarpSnapshot(larp: LocalLarp): Promise<boolean> {
  writeInstallCookie(larp);
  try {
    const res = await fetch(`/api/larp-snapshots/${encodeURIComponent(larp.id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ larp }),
      keepalive: true,
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchLarpSnapshot(id: string): Promise<LocalLarp | null> {
  try {
    const res = await fetch(`/api/larp-snapshots/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { larp?: LocalLarp };
    if (!body.larp?.id) return null;
    return body.larp;
  } catch {
    return null;
  }
}

/**
 * Resolve a LARP for the viewer / installed PWA.
 * localStorage → install cookie (iOS handoff) → cloud snapshot.
 */
export async function resolveLocalLarp(id: string): Promise<LocalLarp | null> {
  const local = getLocalLarp(id);
  if (local) {
    void syncLarpSnapshot(local);
    return local;
  }

  const fromCookie = readInstallCookie(id);
  if (fromCookie) {
    upsertLocalLarp(fromCookie);
    void syncLarpSnapshot(fromCookie);
    return fromCookie;
  }

  const remote = await fetchLarpSnapshot(id);
  if (remote) {
    upsertLocalLarp(remote);
    writeInstallCookie(remote);
    return remote;
  }

  return null;
}
