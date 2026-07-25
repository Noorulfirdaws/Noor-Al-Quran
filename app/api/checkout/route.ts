import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../server/auth";
import { db } from "../../server/db";
import { getStripe, stripePriceId, type PaidPlan, type Interval } from "../../server/stripe";

export const runtime = "nodejs";

/**
 * POST /api/checkout  { plan: "premium"|"family", interval: "monthly"|"annual" }
 * Creates a Stripe Checkout Session for the logged-in user and returns { url }.
 * Inert (configured:false) until Stripe is set up.
 */
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { configured: false, message: "Payments aren't configured yet. Set STRIPE_SECRET_KEY + price IDs." },
      { status: 200 }
    );
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to subscribe.", authRequired: true }, { status: 401 });
  }

  let body: { plan?: string; interval?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }

  const plan: PaidPlan = body.plan === "family" ? "family" : "premium";
  const interval: Interval = body.interval === "monthly" ? "monthly" : "annual";
  const price = stripePriceId(plan, interval);
  if (!price) {
    return NextResponse.json({ error: `No Stripe price configured for ${plan}/${interval}.` }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, subscription: { select: { stripeCustomerId: true } } },
  });
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 401 });

  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "";
  const customer = user.subscription?.stripeCustomerId || undefined;

  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      customer,
      customer_email: customer ? undefined : (user.email || undefined),
      client_reference_id: user.id,
      metadata: { userId: user.id, plan },
      subscription_data: { metadata: { userId: user.id, plan } },
      allow_promotion_codes: true,
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/#pricing`,
    });
    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    return NextResponse.json(
      { error: "Could not start checkout.", detail: err instanceof Error ? err.message : "unknown" },
      { status: 502 }
    );
  }
}
