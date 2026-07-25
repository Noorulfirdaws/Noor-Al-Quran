import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "../../../server/stripe";
import { db } from "../../../server/db";

export const runtime = "nodejs";

/**
 * POST /api/stripe/webhook — Stripe's source-of-truth events.
 * Verifies the signature, then reflects the subscription state into the DB
 * (Subscription.plan/status/currentPeriodEnd). This is what actually grants or
 * revokes access — never trust the client for entitlement.
 *
 * Set STRIPE_WEBHOOK_SECRET and register the endpoint in the Stripe dashboard.
 */
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !whSecret) {
    return NextResponse.json({ configured: false }, { status: 200 });
  }

  const sig = req.headers.get("stripe-signature");
  const raw = await req.text(); // raw body required for signature verification
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig ?? "", whSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const userId = s.metadata?.userId || s.client_reference_id || "";
        const plan = s.metadata?.plan || "premium";
        if (userId && s.subscription) {
          const sub = await stripe.subscriptions.retrieve(String(s.subscription));
          await syncSubscription(userId, plan, sub);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId || "";
        const plan = sub.metadata?.plan || "premium";
        if (userId) await syncSubscription(userId, plan, sub);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    return NextResponse.json(
      { error: "Webhook handler failed.", detail: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

// ── Reflect Stripe subscription state into our DB (the entitlement source) ──
type PrismaPlan = "FREE" | "PREMIUM" | "FAMILY";
type PrismaStatus = "active" | "past_due" | "canceled" | "incomplete";

async function syncSubscription(userId: string, planRaw: string, sub: Stripe.Subscription) {
  const wanted = planRaw.toUpperCase() === "FAMILY" ? "FAMILY" : "PREMIUM";
  const status = mapStatus(sub.status);
  const entitled = sub.status === "active" || sub.status === "trialing";
  const plan: PrismaPlan = entitled ? (wanted as PrismaPlan) : "FREE";
  // current_period_end sits on the subscription across API versions; be defensive.
  const cpe = (sub as unknown as { current_period_end?: number }).current_period_end;
  const currentPeriodEnd = cpe ? new Date(cpe * 1000) : null;

  const data = {
    plan,
    status: status as PrismaStatus,
    stripeCustomerId: String(sub.customer),
    stripeSubscriptionId: sub.id,
    currentPeriodEnd,
  };

  await db.subscription.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

function mapStatus(s: Stripe.Subscription.Status): PrismaStatus {
  if (s === "active" || s === "trialing") return "active";
  if (s === "past_due" || s === "unpaid") return "past_due";
  if (s === "canceled") return "canceled";
  return "incomplete";
}
