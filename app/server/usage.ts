// ─── Server-side AI-scoring quota (the authoritative counter) ────────────────
// The client localStorage counter (services/quotaService) is only optimistic UX
// and can be reset by clearing site data. THIS is the real limit, stored per
// user per calendar month in Postgres and enforced in app/api/recite/score.
import "server-only";
import { db } from "./db";
import type { Plan } from "../services/subscriptionCore";

// Monthly cap by plan. Keep in sync with services/quotaService QUOTA (UX copy).
export const MONTHLY_QUOTA: Record<Plan, number> = { free: 5, premium: 50, family: 50 };

function thisMonth(): string {
  return new Date().toISOString().slice(0, 7); // "YYYY-MM"
}

export interface QuotaState {
  used: number;
  limit: number;
  remaining: number;
}

export async function getQuota(userId: string, plan: Plan): Promise<QuotaState> {
  const limit = MONTHLY_QUOTA[plan] ?? MONTHLY_QUOTA.free;
  const row = await db.recitationUsage.findUnique({
    where: { userId_month: { userId, month: thisMonth() } },
  });
  const used = row?.count ?? 0;
  return { used, limit, remaining: Math.max(0, limit - used) };
}

/**
 * Reserve one scoring unit if the user is under their monthly cap. Atomic-ish:
 * ensures the row exists, then increments ONLY while count < limit, so
 * concurrent requests can't over-consume. Returns whether it was allowed.
 */
export async function consumeQuota(
  userId: string,
  plan: Plan,
): Promise<QuotaState & { allowed: boolean }> {
  const limit = MONTHLY_QUOTA[plan] ?? MONTHLY_QUOTA.free;
  const month = thisMonth();

  await db.recitationUsage.upsert({
    where: { userId_month: { userId, month } },
    create: { userId, month, count: 0 },
    update: {},
  });
  const res = await db.recitationUsage.updateMany({
    where: { userId, month, count: { lt: limit } },
    data: { count: { increment: 1 } },
  });
  const row = await db.recitationUsage.findUnique({
    where: { userId_month: { userId, month } },
  });
  const used = row?.count ?? 0;
  return { allowed: res.count > 0, used, limit, remaining: Math.max(0, limit - used) };
}

/** Give a reserved unit back (e.g. the scoring service failed on our side). */
export async function refundQuota(userId: string): Promise<void> {
  const month = thisMonth();
  await db.recitationUsage.updateMany({
    where: { userId, month, count: { gt: 0 } },
    data: { count: { decrement: 1 } },
  });
}
