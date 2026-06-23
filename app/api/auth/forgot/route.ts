import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "../../../server/db";
import { sendPasswordResetEmail } from "../../../server/email";

export const runtime = "nodejs";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request." }, { status: 400 }); }
  const email = (body.email ?? "").trim().toLowerCase();

  const user = await db.user.findUnique({ where: { email } });

  // Only do work if the account exists — but ALWAYS return the same response so
  // we never reveal whether an email is registered (anti-enumeration).
  let devLink: string | undefined;
  if (user) {
    const token = randomBytes(32).toString("base64url");
    await db.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
    });
    const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
    const link = `${base.replace(/\/$/, "")}/reset-password?token=${token}`;
    const result = await sendPasswordResetEmail(user.email, user.name, link);
    if (!result.sent && result.devLink) devLink = result.devLink; // dev-only convenience
  }

  return NextResponse.json({
    ok: true,
    message: "If an account exists for that email, a reset link has been sent.",
    // present only in dev when no email provider is configured:
    ...(devLink && process.env.NODE_ENV !== "production" ? { devLink } : {}),
  });
}
