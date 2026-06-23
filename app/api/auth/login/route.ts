import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../server/db";
import { verifyPassword, setSessionCookie } from "../../../server/auth";
import { getServerPlan } from "../../../server/subscription";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request." }, { status: 400 }); }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  const user = await db.user.findUnique({ where: { email } });
  // Same message for unknown-email and wrong-password (don't leak which).
  if (!user || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  await setSessionCookie(user.id);
  const plan = await getServerPlan(user.id);
  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name }, plan }, { status: 200 });
}
