// ─── Subscription Core (server-ready business logic) ────────────────────────
// Framework-agnostic, side-effect-free rules for plans, access, and gift cards.
// This is the TRUTH layer for #2/#7 — it has no DB, no Stripe, no localStorage,
// so it is fully unit-testable now and drops directly into the server routes
// once Prisma/Stripe/Auth are provisioned (see docs/SUBSCRIPTION_BACKEND_PLAN.md).
//
// The server flow will be:
//   stripe webhook  → upsert Subscription row  → effectivePlan() decides access
//   gift redeem     → validateGift()/redeemGift() → extendPeriod() on Subscription

export type Plan = "free" | "premium" | "family";
export type ContentTier = "basic" | "premium" | "family";
export type SubStatus = "active" | "past_due" | "canceled" | "incomplete";

const MS_DAY = 86_400_000;
const MS_MONTH = 30 * MS_DAY;

// ── Access matrix ─────────────────────────────────────────────────────────────
// basic = everyone, premium = Premium+Family, family = Family only.
export function canAccessTier(plan: Plan, tier: ContentTier): boolean {
  if (tier === "basic") return true;
  if (tier === "premium") return plan === "premium" || plan === "family";
  return plan === "family";
}

// ── Effective plan ────────────────────────────────────────────────────────────
// The plan a user ACTUALLY has right now: a subscription only counts if its
// status is active and it hasn't lapsed. Anything else falls back to free.
export interface SubscriptionRecord {
  plan: Plan;
  status: SubStatus;
  currentPeriodEnd: number | null; // epoch ms; null = no end (e.g. lifetime)
}

export function effectivePlan(sub: SubscriptionRecord | null, now: number = Date.now()): Plan {
  if (!sub) return "free";
  if (sub.status !== "active") return "free";
  if (sub.currentPeriodEnd != null && sub.currentPeriodEnd < now) return "free"; // lapsed
  return sub.plan;
}

// A family MEMBER inherits the family owner's plan; resolve that here.
export function memberEffectivePlan(
  ownPlan: Plan,
  familyOwnerSub: SubscriptionRecord | null,
  now: number = Date.now(),
): Plan {
  const fam = effectivePlan(familyOwnerSub, now);
  // If you belong to an active family, you get family access regardless of your
  // own subscription; otherwise your own plan stands.
  return fam === "family" ? "family" : ownPlan;
}

// ── Gift cards ────────────────────────────────────────────────────────────────
export type GiftStatus = "UNREDEEMED" | "REDEEMED" | "EXPIRED";

export interface GiftCardRecord {
  code: string;
  plan: Exclude<Plan, "free">; // gifts grant premium or family
  months: number;
  status: GiftStatus;
  expiresAt?: number | null;   // redemption window end (epoch ms), optional
}

/** Human-friendly, unambiguous gift code: NOOR-XXXX-XXXX (no 0/O/1/I). */
export function generateGiftCode(rand: () => number = Math.random): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const block = () => Array.from({ length: 4 }, () => alphabet[Math.floor(rand() * alphabet.length)]).join("");
  return `NOOR-${block()}-${block()}`;
}

export function normalizeGiftCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export type GiftValidation =
  | { ok: true }
  | { ok: false; reason: "already-redeemed" | "expired" | "invalid-months" };

export function validateGift(card: GiftCardRecord, now: number = Date.now()): GiftValidation {
  if (card.status === "REDEEMED") return { ok: false, reason: "already-redeemed" };
  if (card.status === "EXPIRED") return { ok: false, reason: "expired" };
  if (card.expiresAt != null && card.expiresAt < now) return { ok: false, reason: "expired" };
  if (!Number.isFinite(card.months) || card.months <= 0) return { ok: false, reason: "invalid-months" };
  return { ok: true };
}

/** Extend a subscription period by N months. If the current period is still in
 * the future, stack on top of it; otherwise start fresh from now. */
export function extendPeriod(currentEnd: number | null, months: number, now: number = Date.now()): number {
  const base = currentEnd != null && currentEnd > now ? currentEnd : now;
  return base + months * MS_MONTH;
}

export type GiftFailReason = "already-redeemed" | "expired" | "invalid-months";

export interface GiftRedemption {
  ok: true;
  newPlan: Exclude<Plan, "free">;
  newPeriodEnd: number;
}
export type GiftRedeemResult = GiftRedemption | { ok: false; reason: GiftFailReason };

/** Pure redemption: given a valid card + the redeemer's current subscription,
 * compute the resulting plan + period end. The caller persists it + marks the
 * card REDEEMED in one transaction. Family beats premium when stacking. */
export function redeemGift(
  card: GiftCardRecord,
  current: SubscriptionRecord | null,
  now: number = Date.now(),
): GiftRedeemResult {
  const v = validateGift(card, now);
  if (!v.ok) return { ok: false, reason: v.reason };

  const currentPlan = effectivePlan(current, now);
  // Stacking onto the same/lower plan extends the period; a family gift always
  // upgrades to family.
  const newPlan = card.plan === "family" ? "family" : (currentPlan === "family" ? "family" : "premium");
  const stackFrom = current && currentPlan !== "free" ? current.currentPeriodEnd : null;
  const newPeriodEnd = extendPeriod(stackFrom, card.months, now);
  return { ok: true, newPlan, newPeriodEnd };
}
