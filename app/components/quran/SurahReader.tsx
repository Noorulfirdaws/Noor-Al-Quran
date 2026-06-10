"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, Settings, BookOpen, Mic, Brain, ChevronLeft, ChevronRight,
  AlertCircle, Loader2, Volume2, ChevronDown, Check,
} from "lucide-react";
import { useQuranReader } from "../../context/QuranReaderContext";
import { usePremium } from "../../context/PremiumContext";
import { RECITERS } from "../../services/audioService";
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
    highlightedAyah, setSelectedWord, settings, updateSettings,
  } = useQuranReader();
  const { isFeatureAllowed } = usePremium();

  const [showSettings, setShowSettings] = useState(false);
  const [showReciterMenu, setShowReciterMenu] = useState(false);
  const reciterMenuRef = useRef<HTMLDivElement>(null);
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

  // Close reciter menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (reciterMenuRef.current && !reciterMenuRef.current.contains(e.target as Node)) {
        setShowReciterMenu(false);
      }
    };
    if (showReciterMenu) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showReciterMenu]);

  const modeButtons: { id: ReaderMode; label: string; icon: React.ReactNode; feature?: "word-by-word" | "memorization" }[] = [
    { id: "reading", label: "Read", icon: <BookOpen size={13} /> },
    { id: "word-by-word", label: "Word", icon: <Mic size={13} />, feature: "word-by-word" },
    { id: "memorization", label: "Memorize", icon: <Brain size={13} />, feature: "memorization" },
  ];

  const handleModeChange = useCallback((m: ReaderMode, feature?: "word-by-word" | "memorization") => {
    if (feature && !isFeatureAllowed(feature, surahNumber)) return;
    setMode(m);
  }, [isFeatureAllowed, surahNumber, setMode]);

  const currentReciter = RECITERS.find(r => r.id === settings.reciterId) ?? RECITERS[0];
  const murattalReciters = RECITERS.filter(r => r.style === "murattal");
  const mujawwadReciters = RECITERS.filter(r => r.style === "mujawwad");

  return (
    <div className="min-h-screen bg-[#050907] text-white flex flex-col">

      {/* ── Compact sticky header (two rows) ────────────────────────────── */}
      <div className="sticky top-16 z-30 bg-[#050907]/97 backdrop-blur-md border-b border-white/8">

        {/* Row 1: surah nav + reciter + settings */}
        <div className="max-w-3xl mx-auto px-3 py-2 flex items-center gap-2">
          <Link href="/quran" className="text-white/40 hover:text-white transition-colors p-1 flex-shrink-0">
            <ArrowLeft size={18} />
          </Link>

          {/* Surah name */}
          <div className="flex-1 min-w-0">
            {surahMeta ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-white font-black text-sm">{surahMeta.englishName}</span>
                <span className="text-white/20 text-xs">·</span>
                <span className="text-white/35 text-xs truncate">{surahMeta.englishNameTranslation}</span>
                <span className="text-white/15 text-xs hidden sm:inline">· {surahMeta.numberOfAyahs} ayahs</span>
              </div>
            ) : (
              <div className="h-4 w-28 bg-white/10 rounded animate-pulse" />
            )}
          </div>

          {/* Reciter picker (inline dropdown) */}
          <div className="relative flex-shrink-0" ref={reciterMenuRef}>
            <button
              onClick={() => setShowReciterMenu(v => !v)}
              className="flex items-center gap-1 text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-lg px-2.5 py-1.5 text-xs max-w-[130px]"
            >
              <Volume2 size={12} className="flex-shrink-0 text-[#57d996]" />
              <span className="truncate">{currentReciter.name.split(" ").slice(0, 2).join(" ")}</span>
              <ChevronDown size={11} className="flex-shrink-0 ml-0.5" />
            </button>

            {showReciterMenu && (
              <div className="absolute right-0 top-full mt-1 w-72 bg-[#0d1a12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto">
                <div className="px-3 py-2 border-b border-white/5">
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Select Reciter</p>
                </div>

                <div className="p-2">
                  <p className="text-white/25 text-[9px] font-bold uppercase tracking-widest px-2 py-1.5">Murattal</p>
                  {murattalReciters.map(r => (
                    <button
                      key={r.id}
                      onClick={() => { updateSettings({ reciterId: r.id }); setShowReciterMenu(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all ${
                        settings.reciterId === r.id
                          ? "bg-[#57d996]/15 text-[#57d996]"
                          : "hover:bg-white/5 text-white/60"
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${settings.reciterId === r.id ? "bg-[#57d996]" : "bg-white/15"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate">{r.name}</div>
                        <div className="text-[10px] text-white/30 truncate">{r.arabicName}</div>
                      </div>
                      {settings.reciterId === r.id && <Check size={12} className="flex-shrink-0" />}
                    </button>
                  ))}

                  <p className="text-white/25 text-[9px] font-bold uppercase tracking-widest px-2 py-1.5 mt-2">Mujawwad</p>
                  {mujawwadReciters.map(r => (
                    <button
                      key={r.id}
                      onClick={() => { updateSettings({ reciterId: r.id }); setShowReciterMenu(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all ${
                        settings.reciterId === r.id
                          ? "bg-[#57d996]/15 text-[#57d996]"
                          : "hover:bg-white/5 text-white/60"
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${settings.reciterId === r.id ? "bg-[#57d996]" : "bg-white/15"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate">{r.name}</div>
                        <div className="text-[10px] text-white/30 truncate">{r.arabicName}</div>
                      </div>
                      {settings.reciterId === r.id && <Check size={12} className="flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Surah prev/next */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {surahNumber > 1 && (
              <Link href={`/quran/${surahNumber - 1}`} className="p-1.5 text-white/30 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                <ChevronLeft size={15} />
              </Link>
            )}
            {surahNumber < 114 && (
              <Link href={`/quran/${surahNumber + 1}`} className="p-1.5 text-white/30 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                <ChevronRight size={15} />
              </Link>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 text-white/30 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <Settings size={15} />
            </button>
          </div>
        </div>

        {/* Row 2: mode switcher + Arabic name */}
        <div className="max-w-3xl mx-auto px-3 pb-2 flex items-center gap-1.5">
          {modeButtons.map(({ id, label, icon, feature }) => {
            const locked = !!feature && !isFeatureAllowed(feature, surahNumber);
            return (
              <button
                key={id}
                onClick={() => handleModeChange(id, feature)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  mode === id
                    ? "bg-[#57d996] text-black"
                    : locked
                    ? "text-white/20 bg-white/5 cursor-not-allowed"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                {icon}
                {label}
                {locked && <span className="ml-0.5 text-[9px]">🔒</span>}
              </button>
            );
          })}
          {surahMeta && (
            <div className="ml-auto text-white/25 text-sm" style={{ fontFamily: "var(--font-amiri), serif" }}>
              {surahMeta.name}
            </div>
          )}
        </div>
      </div>

      {/* Memorization toolbar */}
      {mode === "memorization" && surahMeta && (
        <MemorizationPanel totalAyahs={surahMeta.numberOfAyahs} />
      )}

      {/* Main content */}
      <div className="flex-1 pb-32">
        {errorMsg && (
          <div className="max-w-3xl mx-auto px-4 py-6 flex items-center gap-3 text-red-400">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span className="text-sm">{errorMsg}</span>
          </div>
        )}

        {loadingAyahs && (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="space-y-2 animate-pulse">
                <div className="h-9 bg-white/5 rounded-xl w-3/4 ml-auto" />
                <div className="h-3 bg-white/5 rounded w-2/3 ml-auto" />
                <div className="h-3 bg-white/5 rounded w-4/5" />
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
          <div className="flex items-center justify-center gap-2 py-4 text-white/30 text-sm">
            <Loader2 size={14} className="animate-spin" />
            Loading word-by-word data…
          </div>
        )}

        {/* Bismillah header — shown for all surahs except 1 and 9 */}
        {!loadingAyahs && ayahs.length > 0 && surahNumber !== 1 && surahNumber !== 9 && (
          <div className="max-w-3xl mx-auto px-4 sm:px-8 py-5 text-center border-b border-white/5">
            <p className="text-3xl sm:text-4xl leading-loose text-white/75" style={{ fontFamily: "var(--font-amiri), serif", direction: "rtl" }}>
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
            <p className="text-white/20 text-xs mt-0.5 italic">Bismillāhi r-raḥmāni r-raḥīm</p>
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
          <div className="max-w-3xl mx-auto px-4 py-8 flex items-center justify-between">
            {surahNumber > 1 ? (
              <Link href={`/quran/${surahNumber - 1}`} className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-sm">
                <ChevronLeft size={15} /> Previous
              </Link>
            ) : <div />}
            {surahNumber < 114 ? (
              <Link href={`/quran/${surahNumber + 1}`} className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-sm">
                Next <ChevronRight size={15} />
              </Link>
            ) : (
              <div className="text-white/20 text-sm text-center flex-1">🎉 End of Quran</div>
            )}
          </div>
        )}
      </div>

      {/* Fixed bottom controls */}
      {surahMeta && <AudioPlayer surahNumber={surahNumber} totalAyahs={surahMeta.numberOfAyahs} />}
      <WordPanel />

      {showSettings && (
        <ReaderSettings surahNumber={surahNumber} onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
