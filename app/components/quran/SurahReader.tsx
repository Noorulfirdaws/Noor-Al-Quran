"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, Settings, BookOpen, Mic, Brain, ChevronLeft, ChevronRight,
  AlertCircle, Loader2,
} from "lucide-react";
import { useQuranReader } from "../../context/QuranReaderContext";
import { usePremium } from "../../context/PremiumContext";
import AyahDisplay from "./AyahDisplay";
import AudioPlayer from "./AudioPlayer";
import ReaderSettings from "./ReaderSettings";
import WordPanel from "./WordPanel";
import MemorizationPanel from "./MemorizationPanel";
import PremiumGate from "./PremiumGate";
import type { ReaderMode } from "../../types/quran";

interface Props {
  surahNumber: number;
  initialAyah?: number;
}

export default function SurahReader({ surahNumber, initialAyah }: Props) {
  const {
    surahMeta, ayahs, ayahsWithWords, loadingAyahs, loadingWords, errorMsg,
    loadSurah, loadWords, mode, setMode,
    highlightedAyah, setSelectedWord,
  } = useQuranReader();
  const { isFeatureAllowed } = usePremium();

  const [showSettings, setShowSettings] = useState(false);
  const scrolledRef = useRef(false);

  // Load surah on mount / surah change
  useEffect(() => {
    loadSurah(surahNumber);
    scrolledRef.current = false;
  }, [surahNumber, loadSurah]);

  // Load word data when entering word-by-word mode
  useEffect(() => {
    if (mode === "word-by-word" && ayahsWithWords.length === 0) {
      loadWords(surahNumber);
    }
  }, [mode, ayahsWithWords.length, loadWords, surahNumber]);

  // Auto-select first word when words load in word-by-word mode
  useEffect(() => {
    if (mode !== "word-by-word") return;
    if (ayahsWithWords.length === 0) return;
    const firstAyah = ayahsWithWords[0];
    const firstWord = firstAyah?.words[0];
    if (!firstWord) return;
    setSelectedWord({
      ayahNumberInSurah: firstAyah.numberInSurah,
      position: firstWord.position,
      word: firstWord,
    });
  }, [mode, ayahsWithWords, setSelectedWord]);

  // Scroll to initial ayah
  useEffect(() => {
    if (!initialAyah || scrolledRef.current || ayahs.length === 0) return;
    scrolledRef.current = true;
    setTimeout(() => {
      document.getElementById(`ayah-${initialAyah}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  }, [initialAyah, ayahs.length]);

  const modeButtons: { id: ReaderMode; label: string; icon: React.ReactNode; feature?: "word-by-word" | "memorization" }[] = [
    { id: "reading", label: "Read", icon: <BookOpen size={14} /> },
    { id: "word-by-word", label: "Word", icon: <Mic size={14} />, feature: "word-by-word" },
    { id: "memorization", label: "Memorize", icon: <Brain size={14} />, feature: "memorization" },
  ];

  const handleModeChange = useCallback((m: ReaderMode, feature?: "word-by-word" | "memorization") => {
    if (feature && !isFeatureAllowed(feature, surahNumber)) return;
    setMode(m);
  }, [isFeatureAllowed, surahNumber, setMode]);

  return (
    <div className="min-h-screen bg-[#050907] text-white flex flex-col">

      {/* Reader nav — sticks below the global navbar (top-16 = 64px) */}
      <div className="sticky top-16 z-30 bg-[#050907]/95 backdrop-blur-md border-b border-white/8">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/quran"
            className="text-white/40 hover:text-white transition-colors p-1 flex-shrink-0"
          >
            <ArrowLeft size={20} />
          </Link>

          <div className="flex-1 min-w-0">
            {surahMeta ? (
              <div className="flex items-baseline gap-2">
                <span className="text-white font-black text-base">{surahMeta.englishName}</span>
                <span className="text-white/30 text-xs">·</span>
                <span className="text-white/40 text-sm">{surahMeta.englishNameTranslation}</span>
                <span className="text-white/20 text-xs hidden sm:inline">· {surahMeta.numberOfAyahs} ayahs</span>
              </div>
            ) : (
              <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {surahNumber > 1 && (
              <Link href={`/quran/${surahNumber - 1}`} className="p-2 text-white/30 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                <ChevronLeft size={16} />
              </Link>
            )}
            {surahNumber < 114 && (
              <Link href={`/quran/${surahNumber + 1}`} className="p-2 text-white/30 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                <ChevronRight size={16} />
              </Link>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-white/30 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Mode switcher */}
        <div className="max-w-3xl mx-auto px-4 pb-2.5 flex items-center gap-2">
          {modeButtons.map(({ id, label, icon, feature }) => {
            const locked = !!feature && !isFeatureAllowed(feature, surahNumber);
            return (
              <button
                key={id}
                onClick={() => handleModeChange(id, feature)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === id
                    ? "bg-[#57d996] text-black"
                    : locked
                    ? "text-white/20 bg-white/5 cursor-not-allowed"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                {icon}
                {label}
                {locked && <span className="ml-0.5">🔒</span>}
              </button>
            );
          })}

          {surahMeta && (
            <div className="ml-auto text-white/30 text-base" style={{ fontFamily: "var(--font-amiri), serif" }}>
              {surahMeta.name}
            </div>
          )}
        </div>
      </div>

      {/* Memorization toolbar — top-[164px] = 64px navbar + ~100px reader nav */}
      {mode === "memorization" && surahMeta && (
        <MemorizationPanel totalAyahs={surahMeta.numberOfAyahs} />
      )}

      {/* Main content — pb-36 ensures content never hides under AudioPlayer+WordPanel */}
      <div className="flex-1 pb-36">
        {errorMsg && (
          <div className="max-w-3xl mx-auto px-4 py-8 flex items-center gap-3 text-red-400">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span className="text-sm">{errorMsg}</span>
          </div>
        )}

        {loadingAyahs && (
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="space-y-3 animate-pulse">
                <div className="h-10 bg-white/5 rounded-xl w-3/4 ml-auto" />
                <div className="h-4 bg-white/5 rounded w-2/3 ml-auto" />
                <div className="h-4 bg-white/5 rounded w-4/5" />
              </div>
            ))}
          </div>
        )}

        {/* Premium gate */}
        {!loadingAyahs && surahNumber !== 1 && (
          <>
            {mode === "word-by-word" && !isFeatureAllowed("word-by-word", surahNumber) && (
              <PremiumGate feature="word-by-word" />
            )}
            {mode === "memorization" && !isFeatureAllowed("memorization", surahNumber) && (
              <PremiumGate feature="memorization" />
            )}
          </>
        )}

        {/* Word loading indicator */}
        {mode === "word-by-word" && loadingWords && (
          <div className="flex items-center justify-center gap-2 py-6 text-white/30 text-sm">
            <Loader2 size={16} className="animate-spin" />
            Loading word-by-word data…
          </div>
        )}

        {/* Bismillah */}
        {!loadingAyahs && ayahs.length > 0 && surahNumber !== 1 && surahNumber !== 9 && (
          <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 text-center border-b border-white/5">
            <p className="text-4xl sm:text-5xl leading-loose text-white/80" style={{ fontFamily: "var(--font-amiri), serif", direction: "rtl" }}>
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
            <p className="text-white/25 text-xs mt-1 italic">Bismillāhi r-raḥmāni r-raḥīm</p>
          </div>
        )}

        {/* Ayahs */}
        {!loadingAyahs &&
          ayahs.map((ayah) => {
            const ayahWithWords = ayahsWithWords.find((a) => a.numberInSurah === ayah.numberInSurah);
            const showWordByWord = mode === "word-by-word" && isFeatureAllowed("word-by-word", surahNumber);
            const showMemorization = mode === "memorization" && isFeatureAllowed("memorization", surahNumber);

            return (
              <AyahDisplay
                key={ayah.numberInSurah}
                ayah={ayah}
                ayahWithWords={ayahWithWords}
                surahNumber={surahNumber}
                surahName={surahMeta?.englishName ?? ""}
                isHighlighted={highlightedAyah === ayah.numberInSurah}
                isWordByWord={showWordByWord}
                isMemorization={showMemorization}
              />
            );
          })}

        {/* Surah navigation */}
        {!loadingAyahs && ayahs.length > 0 && (
          <div className="max-w-3xl mx-auto px-4 py-12 flex items-center justify-between">
            {surahNumber > 1 ? (
              <Link href={`/quran/${surahNumber - 1}`} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm">
                <ChevronLeft size={16} /> Previous surah
              </Link>
            ) : <div />}
            {surahNumber < 114 ? (
              <Link href={`/quran/${surahNumber + 1}`} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm">
                Next surah <ChevronRight size={16} />
              </Link>
            ) : (
              <div className="text-white/20 text-sm text-center flex-1">🎉 You have reached the end of the Quran</div>
            )}
          </div>
        )}
      </div>

      {/* Fixed bottom controls — AudioPlayer and WordPanel stack correctly via z-index */}
      {surahMeta && <AudioPlayer surahNumber={surahNumber} totalAyahs={surahMeta.numberOfAyahs} />}
      <WordPanel />

      {showSettings && (
        <ReaderSettings surahNumber={surahNumber} onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
