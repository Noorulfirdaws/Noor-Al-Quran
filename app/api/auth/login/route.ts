import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../server/db";
import { verifyPassword, setSessionCookie } from "../../../server/auth";
import { getServerPlan } from "../../../server/subscription";
import { rateLimit, clientIp, tooMany } from "../../../server/ratelimit";

export const runtime = "nodejs";

// A valid bcrypt hash of a random string. We compare against it when the account
// doesn't exist so a login attempt takes the same time whether or not the email
// is registered — defeating timing-based account enumeration.
const DUMMY_HASH = "$2b$12$Jtil7H0/KU6c1icQIzttVu2OGxM9yiTd0XVLyoMINiu9lhRy4ZL/G";

export async function POST(req: NextRequest) {
  // Brute-force protection: cap attempts per IP.
  const rl = rateLimit(`login:${clientIp(req)}`, 10, 60_000); // 10 / minute
  if (!rl.ok) return tooMany(rl.retryAfter);

  let body: { email?: string; password?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request." }, { status: 400 }); }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  const user = await db.user.findUnique({ where: { email } });
  // Always run one bcrypt compare (dummy hash when the user is absent) so the
  // response time is constant. Same message for unknown-email and wrong-password.
  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !user.passwordHash || !valid) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  await setSessionCookie(user.id);
  const plan = await getServerPlan(user.id);
  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name }, plan }, { status: 200 });
}
