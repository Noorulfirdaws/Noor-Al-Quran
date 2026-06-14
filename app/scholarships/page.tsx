"use client";
import InfoPage from "../components/InfoPage";

export default function ScholarshipsPage() {
  return (
    <InfoPage
      eyebrow="Company"
      title="Scholarships"
      subtitle="Premium access for students who need it most."
    >
      <p>
        We believe cost should never stand between a sincere student and the Quran. Our scholarship program offers
        free Premium access to students, huffaz-in-training, and families facing financial hardship.
      </p>
      <p>
        Applications open periodically. To be notified when the next round opens, or to tell us about your situation,
        email{" "}
        <a href="mailto:scholarships@noor-ul-quran.com" className="text-[#57d996] hover:underline">scholarships@noor-ul-quran.com</a>.
      </p>
    </InfoPage>
  );
}
