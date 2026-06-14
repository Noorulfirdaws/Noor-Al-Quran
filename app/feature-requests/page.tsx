"use client";
import InfoPage from "../components/InfoPage";

export default function FeatureRequestsPage() {
  return (
    <InfoPage
      eyebrow="Company"
      title="Feature Requests"
      subtitle="Noor-ul-Quran is shaped by the people who use it — including you."
    >
      <p>
        Have an idea that would make memorizing or revising the Quran easier? We&apos;d love to hear it. Many of our
        features started as a single message from a user.
      </p>
      <p>
        Send your idea to{" "}
        <a href="mailto:feedback@noor-ul-quran.com" className="text-[#57d996] hover:underline">feedback@noor-ul-quran.com</a>{" "}
        with a sentence or two about the problem you&apos;re trying to solve. The more concrete, the better.
      </p>
    </InfoPage>
  );
}
