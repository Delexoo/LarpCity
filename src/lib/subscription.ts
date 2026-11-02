export type ProfilePlan = "free" | "pro";

export type ProfileLike = {
  plan?: string | null;
} | null | undefined;

export const FREE_LARP_LIMIT = 1;

export function isPro(profile: ProfileLike): boolean {
  return profile?.plan === "pro";
}

export function freeLarpLimit(): number {
  return FREE_LARP_LIMIT;
}

export function canCreateLarp(
  profile: ProfileLike,
  larpsCreatedThisMonth: number,
): boolean {
  if (isPro(profile)) return true;
  return larpsCreatedThisMonth < FREE_LARP_LIMIT;
}

export function currentMonthKey(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}
