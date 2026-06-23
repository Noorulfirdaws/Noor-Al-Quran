// ─── Email (server-only) ─────────────────────────────────────────────────────
// Sends transactional email via Resend (REST, no SDK). If RESEND_API_KEY isn't
// set, it logs the message + returns the link so flows are fully testable in dev
// — real emails go out the moment you add the key. Pattern matches the rest of
// the env-gated integrations (see docs/SUBSCRIPTION_BACKEND_PLAN.md).
import "server-only";

const RESEND_URL = "https://api.resend.com/emails";

export interface SendResult {
  sent: boolean;        // true if actually emailed
  devLink?: string;     // in dev (no key), the link we would have emailed
  error?: string;
}

async function send(to: string, subject: string, html: string, devLink?: string): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Noor-ul-Quran <onboarding@resend.dev>";

  if (!key) {
    // Dev fallback — surface the link so the flow is testable without a provider.
    console.log(`[email:dev] to=${to} subject=${subject}${devLink ? `\n[email:dev] link=${devLink}` : ""}`);
    return { sent: false, devLink };
  }

  try {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { sent: false, error: `email failed (${res.status}): ${detail.slice(0, 200)}` };
    }
    return { sent: true };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : "email error" };
  }
}

export function passwordResetEmail(name: string | null, link: string): { subject: string; html: string } {
  const greeting = name ? `Assalamu alaikum ${name},` : "Assalamu alaikum,";
  return {
    subject: "Reset your Noor-ul-Quran password",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto;color:#1a1a1a">
        <h2 style="color:#0a8f5a">Noor-ul-Quran</h2>
        <p>${greeting}</p>
        <p>We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.</p>
        <p style="margin:28px 0">
          <a href="${link}" style="background:#0a8f5a;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:bold">Reset password</a>
        </p>
        <p style="color:#666;font-size:13px">If you didn't request this, you can safely ignore this email — your password won't change.</p>
        <p style="color:#999;font-size:12px">${link}</p>
      </div>`,
  };
}

export async function sendPasswordResetEmail(to: string, name: string | null, link: string): Promise<SendResult> {
  const { subject, html } = passwordResetEmail(name, link);
  return send(to, subject, html, link);
}
