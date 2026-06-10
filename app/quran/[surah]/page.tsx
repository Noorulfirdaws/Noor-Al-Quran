"use client";
import { use } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import SurahReader from "../../components/quran/SurahReader";
import { PremiumProvider } from "../../context/PremiumContext";
import { QuranReaderProvider } from "../../context/QuranReaderContext";

interface Props {
  params: Promise<{ surah: string }>;
}

export default function SurahPage({ params }: Props) {
  const { surah } = use(params);
  const searchParams = useSearchParams();
  const surahNumber = parseInt(surah, 10);
  const initialAyah = parseInt(searchParams.get("ayah") ?? "1", 10);

  if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    return (
      <div className="min-h-screen bg-[#050907] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 text-lg mb-4">Invalid surah number.</p>
          <a href="/quran" className="text-[#57d996] underline">← Back to Quran</a>
        </div>
      </div>
    );
  }

  return (
    <PremiumProvider>
      <QuranReaderProvider>
        <Navbar />
        <div className="pt-16">
          <SurahReader surahNumber={surahNumber} initialAyah={initialAyah} />
        </div>
      </QuranReaderProvider>
    </PremiumProvider>
  );
}
