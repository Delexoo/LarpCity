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
