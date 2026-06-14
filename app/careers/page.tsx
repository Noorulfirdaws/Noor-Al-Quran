"use client";
import InfoPage from "../components/InfoPage";

export default function CareersPage() {
  return (
    <InfoPage
      eyebrow="Company"
      title="Careers"
      subtitle="Help millions of people build a lifelong relationship with the Quran."
    >
      <p>
        We&apos;re a small, mission-driven team building the most helpful Quran memorization tools in the world. We
        don&apos;t have open roles posted right now, but we&apos;re always glad to hear from talented people who care
        about this mission.
      </p>
      <p>
        If that&apos;s you — engineers, designers, Arabic/tajweed specialists, or community builders — send a short
        note and your work to{" "}
        <a href="mailto:careers@noor-ul-quran.com" className="text-[#57d996] hover:underline">careers@noor-ul-quran.com</a>.
        We read every message.
      </p>
    </InfoPage>
  );
}
