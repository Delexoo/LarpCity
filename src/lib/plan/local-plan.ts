import { migrateStorageKey } from "@/lib/storage-migrate";

export type LocalPlan = "free" | "pro";

export const LOCAL_PLAN_KEY = "larpingkit.plan.v1";
export const LOCAL_PLAN_EVENT = "larpingkit:plan";

export function readLocalPlan(): LocalPlan {
  if (typeof window === "undefined") return "free";
  try {
    migrateStorageKey(LOCAL_PLAN_KEY);
    const raw = window.localStorage.getItem(LOCAL_PLAN_KEY);
    return raw === "pro" ? "pro" : "free";
  } catch {
    return "free";
  }
}

export function writeLocalPlan(plan: LocalPlan): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_PLAN_KEY, plan);
    window.dispatchEvent(
      new CustomEvent(LOCAL_PLAN_EVENT, { detail: { plan } }),
    );
  } catch {
    /* ignore quota / private mode */
  }
}
