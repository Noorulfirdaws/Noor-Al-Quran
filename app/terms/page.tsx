"use client";
import InfoPage, { InfoH2 } from "../components/InfoPage";

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Terms of Service"
      subtitle="The terms that govern your use of Noor-ul-Quran."
      updated="June 14, 2026"
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
        Some features require a paid subscription. Subscriptions renew automatically unless cancelled before the
        renewal date. You can cancel at any time from your account settings; access continues until the end of the
        current billing period.
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

      <InfoH2>Contact</InfoH2>
      <p>
        Questions? Email{" "}
        <a href="mailto:support@noor-ul-quran.com" className="text-[#57d996] hover:underline">support@noor-ul-quran.com</a>.
      </p>
    </InfoPage>
  );
}
