// ─── AI Scoring Quota ───────────────────────────────────────────────────────
// Caps how many AI-scored recitations a user can run per month, so the hosted
// scoring API spend stays bounded (target ≤ $20/mo at ~1,000 recitations).
//
// Limits are a single config below — change these numbers anytime.
//   Free:    5 / month
//   Premium: 50 / month
//
// Counter resets at the start of each calendar month. Pure localStorage.

export const QUOTA = {
  free: 5,
  premium: 50,
} as const;

const KEY = "noor:ai-quota";

interface QuotaState {
  month: string;  // "YYYY-MM"
  used: number;
}

function thisMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

function load(): QuotaState {
  try {
    const raw = localStorage.getItem(KEY);
    const s = raw ? (JSON.parse(raw) as QuotaState) : null;
    if (!s || s.month !== thisMonth()) return { month: thisMonth(), used: 0 };
    return s;
  } catch {
    return { month: thisMonth(), used: 0 };
  }
}

function save(s: QuotaState) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

export function quotaLimit(isPremium: boolean): number {
  return isPremium ? QUOTA.premium : QUOTA.free;
}

export function quotaUsed(): number {
  return load().used;
}

export function quotaRemaining(isPremium: boolean): number {
  return Math.max(0, quotaLimit(isPremium) - quotaUsed());
}

export function canScore(isPremium: boolean): boolean {
  return quotaRemaining(isPremium) > 0;
}

/** Consume one unit. Returns false if the user is already over the limit. */
export function consumeQuota(isPremium: boolean): boolean {
  const s = load();
  if (s.used >= quotaLimit(isPremium)) return false;
  s.used += 1;
  save(s);
  return true;
}

/** Days until the quota resets (start of next month). */
export function daysUntilReset(): number {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return Math.ceil((next.getTime() - now.getTime()) / 86_400_000);
}
