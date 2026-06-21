"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import RecitationSummary from "./RecitationSummary";
import { recordMistake } from "../../services/gamificationService";
import { RecitationRecorder, saveRecording, isRecordingSupported } from "../../services/recordingService";
import type { ReaderMode } from "../../types/quran";

interface Props {
  surahNumber: number;
  initialAyah?: number;
  initialRecite?: boolean;
}

export default function SurahReader({ surahNumber, initialAyah, initialRecite }: Props) {
  const {
    surahMeta, ayahs, ayahsWithWords, loadingAyahs, loadingWords, errorMsg,
    loadSurah, loadWords, mode, setMode,
    highlightedAyah, setSelectedWord, settings, updateSettings,
    playingAyah, isPlaying,
    speechSupported, isReciting, reciteWordStatuses, reciteWordConfidences, reciteWordCursor,
    reciteDone, reciteInterim, reciteStats, startReciting, stopReciting, resetRecite,
  } = useQuranReader();
  const { isFeatureAllowed } = usePremium();
  const router = useRouter();

  const goBack = useCallback(() => {
    // Return to wherever the user came from (recordings, dashboard, surah list);
    // fall back to the surah list if there's no in-app history.
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/quran");
  }, [router]);

  const [showSettings, setShowSettings] = useState(false);
  const [showReciterMenu, setShowReciterMenu] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const summaryShownRef = useRef(false);
  const recorderRef = useRef<RecitationRecorder | null>(null);
  const recordingActiveRef = useRef(false);
  const reciterMenuRef = useRef<HTMLDivElement>(null);
  const scrolledRef = useRef(false);

  // Load surah on mount / surah change
  useEffect(() => {
    loadSurah(surahNumber);
    scrolledRef.current = false;
  }, [surahNumber, loadSurah]);

  // Deep-link: /quran/N?recite=1 lands directly in Recite mode so "Record a
  // Recitation" opens the recording screen, not the audio player.
  const reciteStartedRef = useRef(false);
  useEffect(() => {
    if (initialRecite && !reciteStartedRef.current) {
      reciteStartedRef.current = true;
      setMode("recite");
    }
  }, [initialRecite, setMode]);

  // Load word data only for word-by-word mode. Recite mode deliberately uses
  // ayah.text split (consistent with the status array), so it must NOT depend
  // on per-word data loading — that timing mismatch was breaking colouring.
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

  // ── Audio Follow Mode ──────────────────────────────────────────────────────
  // While audio plays, keep the recited ayah near the TOP of the reading area
  // (below the sticky headers), so the upcoming ayahs stay visible. Smooth, and
  // only fires when the active ayah actually changes — no jump/flicker.
  useEffect(() => {
    if (!settings.autoScroll || playingAyah == null) return;
    const el = document.getElementById(`ayah-${playingAyah}`);
    if (!el) return;
    const OFFSET = 150; // navbar (4rem) + reader sticky header (~6rem) breathing room
    const y = el.getBoundingClientRect().top + window.scrollY - OFFSET;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  }, [playingAyah, settings.autoScroll]);

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
    { id: "word-by-word", label: "Word", icon: <Brain size={13} />, feature: "word-by-word" },
    { id: "memorization", label: "Memorize", icon: <Brain size={13} />, feature: "memorization" },
    ...(speechSupported ? [{ id: "recite" as ReaderMode, label: "Recite", icon: <Mic size={13} /> }] : []),
  ];

  // Pre-compute per-ayah word offsets into the flat reciteWordStatuses array
  const reciteOffsets = useCallback((): Map<number, number> => {
    const map = new Map<number, number>();
    let offset = 0;
    // Always count words from ayah.text split — the SAME source the context
    // builds the flat status array from, so offsets align and words colour.
    ayahs.forEach((a) => {
      map.set(a.numberInSurah, offset);
      offset += a.text.split(/\s+/).filter(Boolean).length;
    });
    return map;
  }, [ayahs]);

  const ayahWordOffsets = mode === "recite" ? reciteOffsets() : new Map<number, number>();

  const handleModeChange = useCallback((m: ReaderMode, feature?: "word-by-word" | "memorization") => {
    if (feature && !isFeatureAllowed(feature, surahNumber)) return;
    setMode(m);
  }, [isFeatureAllowed, surahNumber, setMode]);

  // Start/stop audio capture alongside speech recognition.
  useEffect(() => {
    if (mode !== "recite" || !isRecordingSupported()) return;
    if (isReciting && !recordingActiveRef.current) {
      recordingActiveRef.current = true;
      const rec = new RecitationRecorder();
      recorderRef.current = rec;
      rec.start().catch(() => { recordingActiveRef.current = false; recorderRef.current = null; });
    }
  }, [isReciting, mode]);

  // Release the mic if the user navigates away mid-recitation (discard clip).
  useEffect(() => {
    return () => {
      if (recordingActiveRef.current && recorderRef.current) {
        recorderRef.current.stop().catch(() => {});
        recordingActiveRef.current = false;
        recorderRef.current = null;
      }
    };
  }, []);

  // Save the recording when recitation completes.
  const saveRecitingClip = useCallback(async () => {
    const rec = recorderRef.current;
    if (!rec || !recordingActiveRef.current) return;
    recordingActiveRef.current = false;
    recorderRef.current = null;
    try {
      const out = await rec.stop();
      const silent = rec.wasSilent();
      if (!out || !surahMeta) return;
      await saveRecording({
        id: `${surahNumber}-${Date.now()}`,
        surah: surahNumber,
        surahName: surahMeta.englishName,
        date: Date.now(),
        durationMs: out.durationMs,
        accuracy: reciteStats.accuracy,
        correct: reciteStats.correct,
        incorrect: reciteStats.incorrect,
        skipped: reciteStats.skipped,
        blob: out.blob,
        mimeType: out.mimeType,
        silent,
      });
    } catch { /* ignore — recording is best-effort */ }
  }, [surahMeta, surahNumber, reciteStats]);

  // Save the clip whenever recording STOPS — manual stop OR completion — so even
  // a partial recitation is saved and "Verify with AI" always has audio. (The
  // completion path also calls saveRecitingClip; it's idempotent.)
  const wasRecitingRef = useRef(false);
  useEffect(() => {
    if (isReciting) { wasRecitingRef.current = true; return; }
    if (wasRecitingRef.current) {
      wasRecitingRef.current = false;
      saveRecitingClip();
    }
  }, [isReciting, saveRecitingClip]);

  // Show summary once when recitation completes + record per-ayah mistakes
  useEffect(() => {
    if (reciteDone && !summaryShownRef.current) {
      summaryShownRef.current = true;
      saveRecitingClip();
      // Record which ayahs had mistakes (incorrect/skipped words) so the
      // dashboard's struggle detection can surface the weakest verses.
      const name = surahMeta?.englishName ?? `Surah ${surahNumber}`;
      ayahs.forEach((a) => {
        const off = ayahWordOffsets.get(a.numberInSurah) ?? 0;
        const aw = ayahsWithWords.find((x) => x.numberInSurah === a.numberInSurah);
        const len = aw ? aw.words.length : a.text.split(/\s+/).filter(Boolean).length;
        const slice = reciteWordStatuses.slice(off, off + len);
        const hadMistake = slice.some((s) => s === "incorrect" || s === "skipped");
        if (hadMistake) recordMistake(surahNumber, a.numberInSurah, name);
      });
      setTimeout(() => setShowSummary(true), 600);
    }
    if (!reciteDone) { summaryShownRef.current = false; setShowSummary(false); }
  }, [reciteDone]); // eslint-disable-line react-hooks/exhaustive-deps

  // Count how many ayahs were touched during this recitation
  const ayahsRecited = useCallback((): number => {
    if (reciteWordStatuses.length === 0) return 0;
    let count = 0;
    ayahs.forEach(a => {
      const off = ayahWordOffsets.get(a.numberInSurah) ?? 0;
      const touched = reciteWordStatuses.slice(off).some(s => s !== "idle");
      if (touched) count++;
    });
    return Math.max(1, count);
  }, [reciteWordStatuses, ayahs, ayahWordOffsets]);

  const currentReciter = RECITERS.find(r => r.id === settings.reciterId) ?? RECITERS[0];
  const murattalReciters = RECITERS.filter(r => r.style === "murattal");
  const mujawwadReciters = RECITERS.filter(r => r.style === "mujawwad");

  return (
    <div className="min-h-screen bg-[#050907] text-white flex flex-col">

      {/* ── Compact sticky header (two rows) ────────────────────────────── */}
      {/* bg must be fully opaque so it covers content scrolling underneath  */}
      <div className="sticky top-16 z-30 bg-[#050907] border-b border-white/8">

        {/* Row 1: surah nav + reciter + settings */}
        <div className="max-w-3xl mx-auto px-3 py-2 flex items-center gap-2">
          <button
            onClick={goBack}
            title="Go back"
            className="flex items-center gap-1 text-white/50 hover:text-white transition-colors py-1 pr-2 pl-1 rounded-lg hover:bg-white/5 flex-shrink-0"
          >
            <ArrowLeft size={18} />
            <span className="text-xs font-bold hidden sm:inline">Back</span>
          </button>

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
              aria-label="Choose reciter"
              aria-expanded={showReciterMenu}
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
              aria-label="Reader settings"
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
            <div className="ml-auto text-white/25 text-sm" style={{ fontFamily: "var(--font-quran), var(--font-amiri), serif" }}>
              {surahMeta.name}
            </div>
          )}
        </div>
      </div>

      {/* Memorization toolbar */}
      {mode === "memorization" && surahMeta && (
        <MemorizationPanel totalAyahs={surahMeta.numberOfAyahs} />
      )}

      {/* ── Recite toolbar ── */}
      {mode === "recite" && (
        <div className="sticky top-[calc(4rem+6rem)] z-20 bg-[#050f09]/95 backdrop-blur border-b border-[#57d996]/15 px-4 py-2.5">
          <div className="max-w-3xl mx-auto flex items-center gap-3 flex-wrap">
            {/* Mic button */}
            {!reciteDone && (
              <button
                onClick={isReciting ? stopReciting : startReciting}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  isReciting
                    ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                    : "bg-[#57d996]/15 text-[#57d996] border border-[#57d996]/30 hover:bg-[#57d996]/25"
                }`}
              >
                <Mic size={14} className={isReciting ? "animate-pulse" : ""} />
                {isReciting ? "Stop" : "Start Reciting"}
              </button>
            )}
            {reciteDone && (
              <button
                onClick={resetRecite}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-[#57d996]/15 text-[#57d996] border border-[#57d996]/30 hover:bg-[#57d996]/25 transition-all"
              >
                ↺ Restart
              </button>
            )}

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-green-400">✓ {reciteStats.correct}</span>
              <span className="text-red-400">✗ {reciteStats.incorrect}</span>
              <span className="text-yellow-400">↷ {reciteStats.skipped}</span>
              {(reciteStats.correct + reciteStats.incorrect + reciteStats.skipped) > 0 && (
                <span className={`font-bold ${reciteStats.accuracy >= 80 ? "text-[#57d996]" : reciteStats.accuracy >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                  {reciteStats.accuracy}%
                </span>
              )}
            </div>

            {/* Word cursor position */}
            {reciteWordStatuses.length > 0 && (
              <span className="text-white/25 text-xs ml-auto">
                {Math.min(reciteWordCursor + 1, reciteWordStatuses.length)} / {reciteWordStatuses.length} words
              </span>
            )}

            {/* Done banner */}
            {reciteDone && (
              <span className="text-[#57d996] text-sm font-bold">🎉 Surah complete!</span>
            )}
          </div>

          {/* Interim speech display */}
          {reciteInterim && (
            <div className="max-w-3xl mx-auto mt-1 text-white/40 text-sm italic text-right" dir="rtl">
              {reciteInterim}
            </div>
          )}
        </div>
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
          <div className="max-w-3xl mx-auto px-4 sm:px-8 pt-6 pb-3 text-center border-b border-white/5">
            <p className="text-2xl sm:text-3xl leading-relaxed text-white/70" style={{ fontFamily: "var(--font-quran), var(--font-amiri), serif", direction: "rtl" }}>
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
            <p className="text-white/20 text-[10px] mt-0.5 italic">Bismillāhi r-raḥmāni r-raḥīm</p>
          </div>
        )}

        {/* Ayahs */}
        {!loadingAyahs &&
          ayahs.map((ayah) => {
            const ayahWithWords = ayahsWithWords.find((a) => a.numberInSurah === ayah.numberInSurah);
            const showWordByWord = mode === "word-by-word" && isFeatureAllowed("word-by-word", surahNumber);
            const showMemorization = mode === "memorization" && isFeatureAllowed("memorization", surahNumber);
            const showRecite = mode === "recite";
            const wordOffset = ayahWordOffsets.get(ayah.numberInSurah) ?? 0;
            return (
              <AyahDisplay
                key={ayah.numberInSurah}
                ayah={ayah}
                ayahWithWords={ayahWithWords}
                surahNumber={surahNumber}
                surahName={surahMeta?.englishName ?? ""}
                isHighlighted={highlightedAyah === ayah.numberInSurah}
                audioFollow={
                  playingAyah == null ? null
                  : ayah.numberInSurah === playingAyah ? "current"
                  : ayah.numberInSurah === playingAyah - 1 ? "prev"
                  : ayah.numberInSurah === playingAyah + 1 ? "next"
                  : null
                }
                isPlaying={isPlaying}
                isWordByWord={showWordByWord}
                isMemorization={showMemorization}
                isRecite={showRecite}
                reciteWordOffset={wordOffset}
                reciteWordStatuses={reciteWordStatuses}
                reciteWordConfidences={reciteWordConfidences}
                reciteWordCursor={reciteWordCursor}
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

      {/* Floating recite button — pinned near the TOP so it's instantly reachable
          on long surahs without scrolling to the bottom and back. */}
      {mode === "recite" && (
        <div className="fixed top-36 right-5 z-50 flex flex-col items-end gap-2">
          {/* Live progress / accuracy pill */}
          {reciteWordStatuses.length > 0 && (
            <div className="bg-[#0d1a12]/95 backdrop-blur border border-[#57d996]/20 rounded-full px-3 py-1 text-[11px] font-mono shadow-lg flex items-center gap-2">
              <span className="text-green-400">✓{reciteStats.correct}</span>
              <span className="text-red-400">✗{reciteStats.incorrect}</span>
              <span className="text-yellow-400">↷{reciteStats.skipped}</span>
              <span className="text-white/30">
                {Math.min(reciteWordCursor + 1, reciteWordStatuses.length)}/{reciteWordStatuses.length}
              </span>
            </div>
          )}

          <button
            onClick={reciteDone ? resetRecite : isReciting ? stopReciting : startReciting}
            title={reciteDone ? "Restart" : isReciting ? "Stop reciting" : "Start reciting"}
            className={`flex items-center gap-2 pl-4 pr-5 py-3.5 rounded-full font-black text-sm shadow-2xl transition-all active:scale-95 ${
              isReciting
                ? "bg-red-500 text-white shadow-red-500/40 animate-pulse"
                : "bg-[#57d996] text-black shadow-[#57d996]/40 hover:bg-[#6ff2a8]"
            }`}
          >
            {reciteDone ? (
              <>↺ Restart</>
            ) : isReciting ? (
              <><Mic size={16} /> Stop</>
            ) : (
              <><Mic size={16} /> Recite</>
            )}
          </button>
        </div>
      )}

      {/* Fixed bottom controls */}
      {surahMeta && <AudioPlayer surahNumber={surahNumber} totalAyahs={surahMeta.numberOfAyahs} />}
      <WordPanel />

      {showSettings && (
        <ReaderSettings surahNumber={surahNumber} onClose={() => setShowSettings(false)} />
      )}

      {showSummary && surahMeta && (
        <RecitationSummary
          surahNumber={surahNumber}
          surahName={surahMeta.englishName}
          correct={reciteStats.correct}
          incorrect={reciteStats.incorrect}
          skipped={reciteStats.skipped}
          accuracy={reciteStats.accuracy}
          ayahsRecited={ayahsRecited()}
          expectedText={ayahs.map((a) => a.text).join(" ").slice(0, 1200)}
          onReset={() => { setShowSummary(false); resetRecite(); }}
          onClose={() => setShowSummary(false)}
        />
      )}
    </div>
  );
}
