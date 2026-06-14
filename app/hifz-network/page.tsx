"use client";
import InfoPage from "../components/InfoPage";

export default function HifzNetworkPage() {
  return (
    <InfoPage
      eyebrow="Community"
      title="Hifz Network"
      subtitle="You don't have to memorize alone."
    >
      <p>
        The Hifz Network connects students of the Quran with one another for encouragement, accountability, and shared
        revision. Memorization is far easier — and far more joyful — in good company.
      </p>
      <p>
        We&apos;re building out the network now. To join the waitlist and be matched with revision partners, email{" "}
        <a href="mailto:community@noor-ul-quran.com" className="text-[#57d996] hover:underline">community@noor-ul-quran.com</a>.
      </p>
    </InfoPage>
  );
}
