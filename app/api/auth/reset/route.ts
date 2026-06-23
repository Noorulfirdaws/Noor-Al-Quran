import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../server/db";
import { hashPassword, setSessionCookie } from "../../../server/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { token?: string; password?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request." }, { status: 400 }); }

  const token = (body.token ?? "").trim();
  const password = body.password ?? "";
  if (!token) return NextResponse.json({ error: "Missing reset token." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

  const rec = await db.passwordResetToken.findUnique({ where: { token }, include: { user: true } });

  // Single-use + time-limited validation.
  if (!rec || rec.usedAt || rec.expiresAt < new Date()) {
    return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  }

  await db.$transaction([
    db.user.update({ where: { id: rec.userId }, data: { passwordHash: await hashPassword(password) } }),
    db.passwordResetToken.update({ where: { id: rec.id }, data: { usedAt: new Date() } }),
    // Invalidate any other outstanding reset tokens for this user.
    db.passwordResetToken.updateMany({
      where: { userId: rec.userId, usedAt: null, id: { not: rec.id } },
      data: { usedAt: new Date() },
    }),
  ]);

  // Log them straight in with a fresh session.
  await setSessionCookie(rec.userId);
  return NextResponse.json({ ok: true, user: { id: rec.user.id, email: rec.user.email, name: rec.user.name } });
}
