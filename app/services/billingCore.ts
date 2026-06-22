// ─── Billing Core (server-ready, no Stripe SDK) ─────────────────────────────
// Pure pricing + a Stripe-webhook REDUCER. The webhook route will just verify
// the signature, then hand the parsed event to reduceStripeEvent() to compute
// the new Subscription state — so all the branching logic is unit-tested here,
// no Stripe account required. See docs/SUBSCRIPTION_BACKEND_PLAN.md.

import type { Plan, SubStatus, SubscriptionRecord } from "./subscriptionCore";

export type Interval = "monthly" | "yearly";
export type PaidPlan = Exclude<Plan, "free">;

// Prices in the smallest currency unit (cents). Tune to your final pricing.
export const PRICES: Record<PaidPlan, Record<Interval, number>> = {
  premium: { monthly: 900, yearly: 9000 },   // $9/mo, $90/yr (2 months free)
  family:  { monthly: 1900, yearly: 19000 }, // $19/mo, $190/yr
};

export function priceFor(plan: PaidPlan, interval: Interval): number {
  return PRICES[plan][interval];
}

export function formatPrice(cents: number, currency = "$"): string {
  return `${currency}${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

// Map your Stripe Price IDs → (plan, interval). The route passes this from env
// (STRIPE_PRICE_PREMIUM_MONTHLY, …). Kept as data so it's testable + swappable.
export type PriceMap = Record<string, { plan: PaidPlan; interval: Interval }>;

export function planFromPriceId(priceId: string, map: PriceMap): { plan: PaidPlan; interval: Interval } | null {
  return map[priceId] ?? null;
}

// ── Stripe status → our status ────────────────────────────────────────────────
export function mapStripeStatus(stripeStatus: string): SubStatus {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    default:
      return "incomplete";
  }
}

// ── Webhook reducer ───────────────────────────────────────────────────────────
// A minimal, typed view of the Stripe event shapes we care about (so we don't
// need the Stripe SDK types). The route extracts these fields and passes them in.

export interface StripeSubscriptionLike {
  status: string;
  current_period_end: number;       // epoch SECONDS (Stripe convention)
  items: { data: { price: { id: string } }[] };
  customer: string;
}

export type StripeEventLike =
  | { type: "checkout.session.completed"; data: { object: { customer: string; subscription: string } } }
  | { type: "customer.subscription.created" | "customer.subscription.updated"; data: { object: StripeSubscriptionLike } }
  | { type: "customer.subscription.deleted"; data: { object: StripeSubscriptionLike } }
  | { type: string; data: { object: unknown } };

export interface SubscriptionUpsert {
  plan: Plan;
  status: SubStatus;
  currentPeriodEnd: number | null;  // epoch MS
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

/**
 * Reduce a Stripe event into a Subscription upsert (or null = ignore this event).
 * Pure: the route persists the result. `priceMap` resolves the plan from the
 * subscription's price id.
 */
export function reduceStripeEvent(
  event: StripeEventLike,
  priceMap: PriceMap,
  current: SubscriptionRecord | null = null, // eslint-disable-line @typescript-eslint/no-unused-vars
): SubscriptionUpsert | null {
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as StripeSubscriptionLike;
      const priceId = sub.items?.data?.[0]?.price?.id ?? "";
      const resolved = planFromPriceId(priceId, priceMap);
      return {
        plan: resolved?.plan ?? "free",
        status: mapStripeStatus(sub.status),
        currentPeriodEnd: sub.current_period_end ? sub.current_period_end * 1000 : null,
        stripeCustomerId: sub.customer,
      };
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as StripeSubscriptionLike;
      // Subscription ended → drop to free immediately.
      return {
        plan: "free",
        status: "canceled",
        currentPeriodEnd: null,
        stripeCustomerId: sub.customer,
      };
    }
    // checkout.session.completed mainly confirms the customer/subscription link;
    // the authoritative state arrives via the subscription.* events above.
    case "checkout.session.completed": {
      const obj = (event as { data: { object: { customer: string; subscription: string } } }).data.object;
      return {
        plan: "free", // placeholder until the subscription.* event sets the plan
        status: "incomplete",
        currentPeriodEnd: null,
        stripeCustomerId: obj.customer,
        stripeSubscriptionId: obj.subscription,
      };
    }
    default:
      return null; // event we don't act on
  }
}
