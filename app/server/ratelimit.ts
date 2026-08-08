// ─── In-memory rate limiter (first line of defense) ──────────────────────────
// Sliding fixed-window counter keyed by a caller-chosen string (usually IP or
// IP+email). Single-instance in-memory — good for this Railway deployment; for
// a multi-instance setup, back it with Redis/Postgres. Fails OPEN on error so a
// limiter bug can never lock everyone out.
import "server-only";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Occasional cleanup so the map can't grow unbounded.
let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, v] of buckets) if (now >= v.resetAt) buckets.delete(k);
}

export interface RateResult {
  ok: boolean;
  retryAfter: number; // seconds until the window resets (0 when ok)
}

export function rateLimit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now();
  sweep(now);
  const b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (b.count >= limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((b.resetAt - now) / 1000)) };
  }
  b.count += 1;
  return { ok: true, retryAfter: 0 };
}

/** Best-effort client IP from proxy headers (Railway/Next sit behind a proxy). */
export function clientIp(req: Request): string {
  const xff = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  return xff || req.headers.get("x-real-ip") || "unknown";
}

/** Standard 429 response with Retry-After. */
export function tooMany(retryAfter: number) {
  return new Response(
    JSON.stringify({ error: "Too many attempts. Please wait and try again." }),
    { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(retryAfter) } }
  );
}
