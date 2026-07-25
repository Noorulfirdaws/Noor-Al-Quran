// ─── Stripe client + price mapping (server-only) ─────────────────────────────
// Inert until STRIPE_SECRET_KEY + the price IDs are set — mirrors the scoring
// service's "configured or $0" pattern, so the app runs fine with no payments.
import "server-only";
import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!_stripe) _stripe = new Stripe(key);
  return _stripe;
}

export type PaidPlan = "premium" | "family";
export type Interval = "monthly" | "annual";

/** Map (plan, interval) → the Stripe Price id from env. */
export function stripePriceId(plan: PaidPlan, interval: Interval): string | undefined {
  const map: Record<PaidPlan, Record<Interval, string | undefined>> = {
    premium: {
      monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || undefined,
      annual: process.env.STRIPE_PRICE_PREMIUM_YEARLY || undefined,
    },
    family: {
      monthly: process.env.STRIPE_PRICE_FAMILY_MONTHLY || undefined,
      annual: process.env.STRIPE_PRICE_FAMILY_YEARLY || undefined,
    },
  };
  return map[plan]?.[interval];
}
