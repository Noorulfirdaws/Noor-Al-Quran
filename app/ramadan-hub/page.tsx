"use client";
import Link from "next/link";
import InfoPage from "../components/InfoPage";

export default function RamadanHubPage() {
  return (
    <InfoPage
      eyebrow="Community"
      title="Ramadan Hub"
      subtitle="Make the most of the most blessed month for memorization."
    >
      <p>
        Ramadan is the most powerful month of the year to accelerate your hifz. The Ramadan Hub brings together
        structured plans, daily goals, and revision schedules built around Tarawih and your daily routine.
      </p>
      <p>
        Start now with our{" "}
        <Link href="/blog/ramadan-memorization-plan" className="text-[#57d996] hover:underline">
          30-Day Ramadan Memorization Plan
        </Link>
        , and watch this space for more Ramadan tools as the month approaches.
      </p>
    </InfoPage>
  );
}
