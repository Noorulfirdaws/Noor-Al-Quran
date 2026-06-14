// ─── Promo / lead-magnet codes ────────────────────────────────────────────────
// Grants time-limited free premium access. Two kinds of codes:
//   1. Built-in codes (below) — fixed, ready to share.
//   2. Generated codes — the promo terms (access length + promotion window) are
//      encoded INSIDE the code, so they work for any customer with no backend.
//
// Redeeming stores an expiry timestamp in localStorage; PremiumContext treats an
// unexpired promo as premium and stops granting access once it lapses.

const PROMO_KEY = "noor_promo_access";
const DAY = 86_400_000;

export interface PromoTerms {
  label: string; // promotion name shown to the customer
  days: number;  // access granted for this many days after redemption
  exp: number;   // code is redeemable until this timestamp (promotion window end)
}

export interface ActivePromo {
  label: string;
  until: number; // access valid until this timestamp
}

// ── Built-in, shareable codes ────────────────────────────────────────────────
export const builtInPromos: Record<string, PromoTerms> = {
  WELCOME7:  { label: "Welcome", days: 7,  exp: Date.parse("2030-12-31") },
  EID14:     { label: "Eid Gift", days: 14, exp: Date.parse("2026-12-31") },
  RAMADAN30: { label: "Ramadan", days: 30, exp: Date.parse("2027-04-30") },
  LAUNCH90:  { label: "Launch", days: 90, exp: Date.parse("2026-09-30") },
};

// ── Code encode / decode ─────────────────────────────────────────────────────
function b64urlEncode(s: string): string {
  const b = typeof window !== "undefined" ? btoa(unescape(encodeURIComponent(s))) : Buffer.from(s).toString("base64");
  return b.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(s: string): string {
  const b = s.replace(/-/g, "+").replace(/_/g, "/");
  return typeof window !== "undefined" ? decodeURIComponent(escape(atob(b))) : Buffer.from(b, "base64").toString();
}

/** Build a shareable code that carries its own promo terms. */
export function generateCode(t: PromoTerms): string {
  const payload = JSON.stringify({ l: t.label, d: t.days, e: t.exp });
  return "NOOR-" + b64urlEncode(payload);
}

/** Resolve a code (built-in or generated) to its terms, or null if invalid. */
export function decodeCode(raw: string): PromoTerms | null {
  const code = raw.trim().toUpperCase();
  if (builtInPromos[code]) return builtInPromos[code];
  const m = raw.trim().match(/^NOOR-(.+)$/i);
  if (!m) return null;
  try {
    const o = JSON.parse(b64urlDecode(m[1]));
    if (typeof o.d !== "number" || typeof o.e !== "number") return null;
    return { label: String(o.l ?? "Promo"), days: o.d, exp: o.e };
  } catch {
    return null;
  }
}

// ── Redeem / status ──────────────────────────────────────────────────────────
export function redeemCode(raw: string):
  | { ok: true; promo: ActivePromo }
  | { ok: false; error: string } {
  const terms = decodeCode(raw);
  if (!terms) return { ok: false, error: "That code isn't valid. Check for typos." };
  if (Date.now() > terms.exp) return { ok: false, error: "This promotion has ended." };
  if (terms.days <= 0) return { ok: false, error: "This code grants no access." };

  const promo: ActivePromo = { label: terms.label, until: Date.now() + terms.days * DAY };
  try { localStorage.setItem(PROMO_KEY, JSON.stringify(promo)); } catch { /* ignore */ }
  return { ok: true, promo };
}

/** The currently active promo, or null (also clears it once expired). */
export function getActivePromo(): ActivePromo | null {
  try {
    const raw = localStorage.getItem(PROMO_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as ActivePromo;
    if (!p?.until || Date.now() > p.until) { localStorage.removeItem(PROMO_KEY); return null; }
    return p;
  } catch {
    return null;
  }
}

export function clearPromo(): void {
  try { localStorage.removeItem(PROMO_KEY); } catch { /* ignore */ }
}

/** Whole days remaining on the active promo (0 if none). */
export function promoDaysLeft(): number {
  const p = getActivePromo();
  return p ? Math.max(0, Math.ceil((p.until - Date.now()) / DAY)) : 0;
}
