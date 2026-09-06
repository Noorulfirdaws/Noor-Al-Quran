"use client";
import Link from "next/link";
import InfoPage, { InfoH2 } from "../components/InfoPage";

export default function RefundPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Refund & Cancellation Policy"
      subtitle="Our 14-day money-back guarantee, and how cancellation works."
      updated="September 5, 2026"
    >
      <p>
        We want you to be genuinely happy with Noor-ul-Quran. This policy explains our refund guarantee,
        how to cancel, and exactly what happens to your account afterwards.
      </p>

      <InfoH2>14-day money-back guarantee</InfoH2>
      <p>
        If you are not satisfied, you can request a <strong className="text-white">full refund within 14 days</strong> of
        any charge — whether it&apos;s your first payment or a renewal. Just email us from the address on your account and
        we&apos;ll refund that payment, no questions asked. Refunds are returned to your original payment method and
        typically appear within 5–10 business days, depending on your bank.
      </p>
      <p>
        After the 14-day window for a given charge has passed, that payment is non-refundable, but you can still
        cancel at any time to stop future renewals (see below).
      </p>

      <InfoH2>How to cancel</InfoH2>
      <p>
        You can cancel your subscription at any time — there are no cancellation fees. Open your{" "}
        <Link href="/dashboard" className="text-[#57d996] hover:underline">account dashboard</Link> and use
        &quot;Manage subscription&quot; to cancel in a couple of clicks, or email us and we&apos;ll do it for you.
      </p>

      <InfoH2>What happens after you cancel</InfoH2>
      <p>
        When you cancel, your subscription is set to end at the close of the period you&apos;ve already paid for. Until
        then, <strong className="text-white">you keep full premium access</strong> — nothing is cut off early. At the end
        of that period:
      </p>
      <ul className="list-disc pl-5 space-y-1.5 text-white/70">
        <li>Your account drops to the free plan automatically. You are not charged again.</li>
        <li>
          <strong className="text-white">Your data is kept</strong> — memorization progress, bookmarks, goals, and
          reading settings all remain on your account.
        </li>
        <li>Premium features (higher AI-recitation limits and premium content) are locked until you resubscribe.</li>
        <li>You can resubscribe anytime and pick up exactly where you left off.</li>
      </ul>

      <InfoH2>Failed or missed payments</InfoH2>
      <p>
        If a renewal payment fails, we&apos;ll automatically retry it over a few days and email you a reminder so you can
        update your card. Your premium access continues during this grace period. If payment still can&apos;t be
        collected, the subscription is cancelled and your account moves to the free plan — with your data intact.
      </p>

      <InfoH2>How to request a refund</InfoH2>
      <p>
        Email{" "}
        <a href="mailto:contact@noorulfirdaws.com" className="text-[#57d996] hover:underline">contact@noorulfirdaws.com</a>{" "}
        from the email address on your account, and tell us which charge you&apos;d like refunded. We aim to reply within
        1–2 business days.
      </p>

      <p className="text-white/40 text-sm mt-8">
        This policy is provided for transparency and does not limit any statutory consumer rights you may have under the
        law that applies to you.
      </p>
    </InfoPage>
  );
}
