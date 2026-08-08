import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../server/db";
import { hashPassword, setSessionCookie } from "../../../server/auth";
import { rateLimit, clientIp, tooMany } from "../../../server/ratelimit";

export const runtime = "nodejs";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(req: NextRequest) {
  // Throttle mass/automated account creation per IP.
  const rl = rateLimit(`signup:${clientIp(req)}`, 5, 60 * 60_000); // 5 / hour
  if (!rl.ok) return tooMany(rl.retryAfter);

  let body: { name?: string; email?: string; password?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request." }, { status: 400 }); }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

  const user = await db.user.create({
    data: {
      email,
      name: name || null,
      passwordHash: await hashPassword(password),
      // Everyone starts on the free plan.
      subscription: { create: { plan: "FREE", status: "active", currentPeriodEnd: null } },
    },
  });

  await setSessionCookie(user.id);
  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name }, plan: "free" }, { status: 201 });
}
