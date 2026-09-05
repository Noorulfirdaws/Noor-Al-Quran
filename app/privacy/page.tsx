"use client";
import InfoPage, { InfoH2 } from "../components/InfoPage";

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Privacy Policy"
      subtitle="How Noor-ul-Quran collects, uses, and protects your information."
      updated="September 5, 2026"
    >
      <p>
        Your trust matters to us. This policy explains what data we collect when you use
        Noor-ul-Quran, why we collect it, and the choices you have. We collect the minimum
        necessary to run the service.
      </p>

      <InfoH2>Information we collect</InfoH2>
      <p>
        <strong className="text-white">Account data</strong> such as your name and email when you create an account.
        <strong className="text-white"> Progress data</strong> such as memorization progress, bookmarks, and reading settings,
        which are stored locally in your browser and—if you have an account—synced to your profile.
        <strong className="text-white"> Usage data</strong> such as which features you use, to help us improve the app.
      </p>

      <InfoH2>Microphone &amp; recitation</InfoH2>
      <p>
        Instant, word-by-word recitation feedback runs <strong className="text-white">entirely in your browser</strong> —
        that audio never leaves your device. If you use the deeper AI tajweed analysis, the recording is sent securely
        over an encrypted connection to our scoring service <strong className="text-white">for processing only</strong>,
        and is not stored afterwards. You control microphone access through your browser and can revoke it at any time.
      </p>

      <InfoH2>Payments</InfoH2>
      <p>
        Paid subscriptions are processed by <strong className="text-white">Stripe</strong>, our payment provider. Your
        card details are entered on Stripe&apos;s secure systems and are never seen or stored by us — we only keep a
        customer/subscription reference so we can manage your plan. Stripe&apos;s handling of your payment data is
        governed by its own privacy policy.
      </p>

      <InfoH2>How we use your data</InfoH2>
      <p>
        To provide and personalize the service, sync your progress across devices, respond to support requests, and
        improve our features. We do not sell your personal data.
      </p>

      <InfoH2>Your rights</InfoH2>
      <p>
        You can access, correct, export, or delete your data at any time by contacting us at{" "}
        <a href="mailto:support@noorulfirdaws.com" className="text-[#57d996] hover:underline">support@noorulfirdaws.com</a>.
      </p>

      <InfoH2>Contact</InfoH2>
      <p>
        Questions about this policy? Email{" "}
        <a href="mailto:support@noorulfirdaws.com" className="text-[#57d996] hover:underline">support@noorulfirdaws.com</a>.
      </p>
    </InfoPage>
  );
}
