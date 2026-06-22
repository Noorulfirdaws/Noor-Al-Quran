// ─── Server-side subscription enforcement (the real #2) ─────────────────────
// Wires the TESTED subscriptionCore logic to the database. This is what every
// protected route/page calls — the client gate is just UX; THIS is the truth.
// Inert until DATABASE_URL is set + `prisma migrate` has created the tables.
import "server-only";
import { db } from "./db";
import {
  effectivePlan, canAccessTier,
  type Plan, type ContentTier, type SubStatus, type SubscriptionRecord,
} from "../services/subscriptionCore";

/* eslint-disable @typescript-eslint/no-explicit-any */

function toRecord(sub: any): SubscriptionRecord | null {
  if (!sub) return null;
  return {
    plan: String(sub.plan).toLowerCase() as Plan,
    status: String(sub.status) as SubStatus,
    currentPeriodEnd: sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).getTime() : null,
  };
}

/**
 * The user's effective plan RIGHT NOW, from the DB: their own subscription, or
 * the family plan they belong to (whichever grants more). Uses the unit-tested
 * effectivePlan()/canAccessTier() core for the actual rules.
 */
export async function getServerPlan(userId: string | null): Promise<Plan> {
  if (!userId) return "free";

  const sub = await db.subscription.findUnique({ where: { userId } });
  let plan = effectivePlan(toRecord(sub));

  if (plan !== "family") {
    // Does this user belong to an active Family? Inherit it.
    const membership = await db.familyMember.findFirst({
      where: { userId },
      include: { family: { include: { owner: { include: { subscription: true } } } } },
    });
    const ownerSub = membership?.family?.owner?.subscription;
    if (ownerSub && effectivePlan(toRecord(ownerSub)) === "family") plan = "family";
  }

  return plan;
}

/** Guard for route handlers / server components. Throws a 403 Response when the
 * user's plan can't access the required tier — this is what actually prevents
 * direct-URL access to premium content. */
export async function requirePlan(userId: string | null, tier: ContentTier): Promise<Plan> {
  const plan = await getServerPlan(userId);
  if (!canAccessTier(plan, tier)) {
    throw new Response(JSON.stringify({ error: "Upgrade required", requiredTier: tier }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return plan;
}
