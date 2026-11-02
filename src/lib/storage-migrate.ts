import {
  BRAND_LEGACY_STORAGE_PREFIX,
  BRAND_STORAGE_PREFIX,
} from "@/lib/brand";

/** Copy a legacy `larpcity.*` key to `larpingkit.*` once (keeps old data). */
export function migrateStorageKey(nextKey: string): void {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem(nextKey) != null) return;
    const legacyKey = nextKey.replace(
      BRAND_STORAGE_PREFIX,
      BRAND_LEGACY_STORAGE_PREFIX,
    );
    if (legacyKey === nextKey) return;
    const legacy = window.localStorage.getItem(legacyKey);
    if (legacy == null) return;
    window.localStorage.setItem(nextKey, legacy);
  } catch {
    /* ignore */
  }
}
