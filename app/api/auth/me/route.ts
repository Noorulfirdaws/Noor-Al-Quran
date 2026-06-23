import { NextResponse } from "next/server";
import { db } from "../../../server/db";
import { getSession } from "../../../server/auth";
import { getServerPlan } from "../../../server/subscription";

export const runtime = "nodejs";

// Returns the current user + their authoritative plan (from the DB), or null.
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null, plan: "free" });

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user) return NextResponse.json({ user: null, plan: "free" });

  const plan = await getServerPlan(user.id);
  return NextResponse.json({ user, plan });
}
