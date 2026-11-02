export type ProfilePlan = "free" | "pro";

export type ProfileLike = {
  plan?: string | null;
} | null | undefined;

/** Free can create freely; Pro is about watermark removal + extras. */
export const FREE_LARP_LIMIT = Number.POSITIVE_INFINITY;

export function isPro(profile: ProfileLike): boolean {
  return profile?.plan === "pro";
}

export function showsWatermark(profile: ProfileLike): boolean {
  return !isPro(profile);
}

export function freeLarpLimit(): number {
  return FREE_LARP_LIMIT;
}

export function canCreateLarp(
  profile: ProfileLike,
  larpsCreatedThisMonth: number,
): boolean {
  if (isPro(profile)) return true;
  if (!Number.isFinite(FREE_LARP_LIMIT)) return true;
  return larpsCreatedThisMonth < FREE_LARP_LIMIT;
}

export function currentMonthKey(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}
