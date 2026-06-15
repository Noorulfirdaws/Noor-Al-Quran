// ─── Completion Certificates ────────────────────────────────────────────────
// Printable, shareable certificates for completed goals and Hifz milestones.
// Self-encodes (base64url) so a certificate link can be shared/verified without
// a backend — same pattern as the progress report and promo codes.

export interface Certificate {
  name: string;
  title: string;       // what was achieved, e.g. "Memorized Surah Al-Mulk"
  detail: string;      // e.g. "30 ayahs · 92% average accuracy"
  date: number;        // issued timestamp
  level: number;
  id: string;          // short verification id
}

function b64urlEncode(s: string): string {
  const b = typeof window !== "undefined"
    ? btoa(unescape(encodeURIComponent(s)))
    : Buffer.from(s).toString("base64");
  return b.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(s: string): string {
  const b = s.replace(/-/g, "+").replace(/_/g, "/");
  return typeof window !== "undefined"
    ? decodeURIComponent(escape(atob(b)))
    : Buffer.from(b, "base64").toString();
}

/** Short, human-readable verification id derived from the certificate fields. */
function makeId(name: string, title: string, date: number): string {
  let h = 0;
  const s = `${name}|${title}|${date}`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return "NQ-" + h.toString(36).toUpperCase().slice(0, 6);
}

export function buildCertificate(input: Omit<Certificate, "id">): Certificate {
  return { ...input, id: makeId(input.name, input.title, input.date) };
}

export function encodeCertificate(c: Certificate): string {
  return b64urlEncode(JSON.stringify(c));
}

export function decodeCertificate(code: string): Certificate | null {
  try {
    const o = JSON.parse(b64urlDecode(code));
    if (typeof o.name !== "string" || typeof o.title !== "string" || typeof o.date !== "number") return null;
    // Re-derive the id to verify it matches (tamper check).
    if (o.id !== makeId(o.name, o.title, o.date)) return null;
    return o as Certificate;
  } catch {
    return null;
  }
}

export function certificateUrl(c: Certificate): string {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/certificate?d=${encodeCertificate(c)}`;
}
