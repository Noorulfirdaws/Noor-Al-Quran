"use client";
import InfoPage, { InfoH2 } from "../components/InfoPage";

export default function CookiesPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Cookie Policy"
      subtitle="How and why Noor-ul-Quran uses cookies and local storage."
      updated="June 14, 2026"
    >
      <p>
        Noor-ul-Quran uses a minimal set of cookies and browser local storage to make the app work and to remember
        your preferences. We do not use advertising trackers.
      </p>

      <InfoH2>Essential storage</InfoH2>
      <p>
        We use your browser&apos;s local storage to remember your reading settings, reciter choice, bookmarks, and
        memorization progress so the app works offline and across sessions. This data stays on your device unless you
        sign in to sync it.
      </p>

      <InfoH2>Analytics</InfoH2>
      <p>
        We may use privacy-respecting analytics to understand which features are used most, so we can improve them.
        This data is aggregated and not used to identify you personally.
      </p>

      <InfoH2>Managing cookies</InfoH2>
      <p>
        You can clear cookies and local storage at any time through your browser settings. Doing so will reset your
        local preferences and progress that has not been synced to an account.
      </p>

      <InfoH2>Contact</InfoH2>
      <p>
        Questions? Email{" "}
        <a href="mailto:privacy@noor-ul-quran.com" className="text-[#57d996] hover:underline">privacy@noor-ul-quran.com</a>.
      </p>
    </InfoPage>
  );
}
