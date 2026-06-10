import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SurahBrowser from "../components/quran/SurahBrowser";
import { PremiumProvider } from "../context/PremiumContext";
import { QuranReaderProvider } from "../context/QuranReaderContext";

export const metadata: Metadata = {
  title: "Quran Reader — Noor-ul-Quran",
  description:
    "Read all 114 surahs of the Holy Quran with Arabic text, transliteration, translation, and audio recitation. Word-by-word learning and memorization tools included.",
};

export default function QuranPage() {
  return (
    <PremiumProvider>
      <QuranReaderProvider>
        <Navbar />
        <SurahBrowser />
        <Footer />
      </QuranReaderProvider>
    </PremiumProvider>
  );
}
