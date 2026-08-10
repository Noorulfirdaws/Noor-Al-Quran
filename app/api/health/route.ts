import { NextResponse } from "next/server";

// Lightweight readiness probe for Railway's healthcheck — lets a new deploy
// finish booting before traffic is switched to it (zero-downtime, no 502 window).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ ok: true });
}
