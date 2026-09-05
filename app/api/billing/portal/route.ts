import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../server/auth";
import { db } from "../../../server/db";
import { getStripe } from "../../../server/stripe";

export const runtime = "nodejs";

/**
 * POST /api/billing/portal
 *
 * Creates a Stripe **Billing Customer Portal** session for the logged-in user
 * and returns { url }. The portal is Stripe-hosted: the customer cancels,
 * switches plan, updates their card, and downloads invoices there — so no card
 * data ever touches us. Entitlement changes flow back via the webhook.
 *
 * Inert (configured:false) until STRIPE_SECRET_KEY is set. Requires the Customer
 * Portal to be enabled once in the Stripe dashboard (Settings → Billing).
 */
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { configured: false, message: "Payments aren't configured yet." },
      { status: 200 }
    );
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to manage billing.", authRequired: true }, { status: 401 });
  }

  const sub = await db.subscription.findUnique({
    where: { userId: session.userId },
    select: { stripeCustomerId: true },
  });
  if (!sub?.stripeCustomerId) {
    // Free user (never subscribed) — nothing to manage. UI points them to pricing.
    return NextResponse.json(
      { noSubscription: true, message: "No active subscription to manage." },
      { status: 200 }
    );
  }

  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "";

  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${origin}/dashboard`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (err) {
    return NextResponse.json(
      { error: "Could not open the billing portal.", detail: err instanceof Error ? err.message : "unknown" },
      { status: 502 }
    );
  }
}
