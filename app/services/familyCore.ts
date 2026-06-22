// ─── Family Core (server-ready, pure) ───────────────────────────────────────
// Invite-token + member-cap logic for the Family plan. No DB — the route
// persists; this decides. See docs/SUBSCRIPTION_BACKEND_PLAN.md.

export const FAMILY_MAX_MEMBERS = 6;        // includes the owner
const INVITE_TTL_DAYS = 14;
const MS_DAY = 86_400_000;

export interface InviteRecord {
  token: string;
  familyId: string;
  issuedAt: number;          // epoch ms
  acceptedByUserId?: string | null;
}

/** URL-safe random invite token. */
export function generateInviteToken(rand: () => number = Math.random): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 24 }, () => chars[Math.floor(rand() * chars.length)]).join("");
}

export function inviteUrl(origin: string, token: string): string {
  return `${origin.replace(/\/$/, "")}/family/join?token=${token}`;
}

/** Is there room for another member? (cap includes the owner.) */
export function canAddMember(currentMemberCount: number, max = FAMILY_MAX_MEMBERS): boolean {
  return currentMemberCount < max;
}

export function inviteExpiresAt(issuedAt: number, ttlDays = INVITE_TTL_DAYS): number {
  return issuedAt + ttlDays * MS_DAY;
}

export type InviteValidation =
  | { ok: true }
  | { ok: false; reason: "expired" | "already-accepted" | "family-full" | "already-member" };

/**
 * Validate an invite at accept time. `currentMemberCount` and `isAlreadyMember`
 * come from the DB; everything else is on the invite record.
 */
export function validateInvite(
  invite: InviteRecord,
  currentMemberCount: number,
  isAlreadyMember: boolean,
  now: number = Date.now(),
  ttlDays = INVITE_TTL_DAYS,
): InviteValidation {
  if (invite.acceptedByUserId) return { ok: false, reason: "already-accepted" };
  if (now > inviteExpiresAt(invite.issuedAt, ttlDays)) return { ok: false, reason: "expired" };
  if (isAlreadyMember) return { ok: false, reason: "already-member" };
  if (!canAddMember(currentMemberCount)) return { ok: false, reason: "family-full" };
  return { ok: true };
}

/** Remaining seats (never negative). */
export function seatsRemaining(currentMemberCount: number, max = FAMILY_MAX_MEMBERS): number {
  return Math.max(0, max - currentMemberCount);
}
