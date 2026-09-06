"use client";
import Link from "next/link";
import InfoPage, { InfoH2 } from "../components/InfoPage";

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Terms of Service"
      subtitle="The terms that govern your use of Noor-ul-Quran."
      updated="September 5, 2026"
    >
      <p>
        By using Noor-ul-Quran, you agree to these terms. Please read them carefully. If you do not agree, please do
        not use the service.
      </p>

      <InfoH2>Using the service</InfoH2>
      <p>
        You may use Noor-ul-Quran for personal, non-commercial Quran study and memorization. You agree not to misuse
        the service, attempt to disrupt it, or access it through unauthorized means.
      </p>

      <InfoH2>Accounts</InfoH2>
      <p>
        You are responsible for keeping your account credentials secure and for all activity under your account.
        Notify us promptly of any unauthorized use.
      </p>

      <InfoH2>Subscriptions &amp; billing</InfoH2>
      <p>
        Some features require a paid subscription. Prices are shown at checkout before you pay. Paid plans are billed
        in advance on a recurring basis (monthly or yearly, as you choose) and{" "}
        <strong className="text-white">renew automatically</strong> at the same price until you cancel. Payments are
        processed securely by Stripe; we never see or store your full card details.
      </p>
      <p>
        You can cancel at any time from your{" "}
        <Link href="/dashboard" className="text-[#57d996] hover:underline">account dashboard</Link>. When you cancel,
        your plan stays active until the end of the billing period you&apos;ve already paid for, then moves to the free
        plan — your account and data are kept.
      </p>

      <InfoH2>Refunds</InfoH2>
      <p>
        We offer a <strong className="text-white">14-day money-back guarantee</strong> on every charge. Full details,
        including how cancellation works and how to request a refund, are in our{" "}
        <Link href="/refund" className="text-[#57d996] hover:underline">Refund &amp; Cancellation Policy</Link>.
      </p>

      <InfoH2>The Quran text</InfoH2>
      <p>
        We strive for accuracy of the Uthmani (Hafs) text and recitation data. The app is a study aid and does not
        replace learning from a qualified teacher.
      </p>

      <InfoH2>Changes</InfoH2>
      <p>
        We may update these terms from time to time. Continued use after changes means you accept the updated terms.
      </p>

      <InfoH2>Governing law</InfoH2>
      <p>
        Noor-ul-Quran is operated from Norway. These terms are governed by Norwegian law, and any disputes are subject
        to the jurisdiction of the Norwegian courts. Nothing in these terms limits any mandatory consumer rights you
        have under the law of your country of residence.
      </p>

      <InfoH2>Contact</InfoH2>
      <p>
        Questions? Email{" "}
        <a href="mailto:contact@noorulfirdaws.com" className="text-[#57d996] hover:underline">contact@noorulfirdaws.com</a>.
      </p>
    </InfoPage>
  );
}
