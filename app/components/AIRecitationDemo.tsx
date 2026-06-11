"use client";
import { useState, useEffect, useRef, useCallback } from "react";

import { Mic, MicOff, RotateCcw, ChevronDown, Zap } from "lucide-react";

/* ─── Bismillah ─── */
const BISMILLAH = { n: 0, ar: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", tr: "Bismillāhi r-raḥmāni r-raḥīm" };

/* ─── Hardcoded Al-Fatiha fallback (used when API is unreachable) ─── */
const FATIHA_FALLBACK: SurahMeta = { number: 1, name: "الفاتحة", englishName: "Al-Fatiha", numberOfAyahs: 7 };
const FATIHA_AYAT_FALLBACK: AyahData[] = [
  { n: 1, ar: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", tr: "Bismillāhi r-raḥmāni r-raḥīm" },
  { n: 2, ar: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ", tr: "Al-ḥamdu lillāhi rabbi l-ʿālamīn" },
  { n: 3, ar: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", tr: "Ar-raḥmāni r-raḥīm" },
  { n: 4, ar: "مَٰلِكِ يَوْمِ ٱلدِّينِ", tr: "Māliki yawmi d-dīn" },
  { n: 5, ar: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", tr: "Iyyāka naʿbudu wa-iyyāka nastaʿīn" },
  { n: 6, ar: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ", tr: "Ihdinā ṣ-ṣirāṭa l-mustaqīm" },
  { n: 7, ar: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ", tr: "Ṣirāṭa llaḏīna anʿamta ʿalayhim ġayri l-maġḍūbi ʿalayhim wa-lā ḍ-ḍāllīn" },
];

/* ─── Types ─── */
interface SurahMeta {
  number: number;
  name: string;          // Arabic name
  englishName: string;   // English name
  numberOfAyahs: number;
}

interface AyahData {
  n: number;
  ar: string;
  tr: string;
}

/* ─── Helpers — powered by reciteService ─── */
import {
  type WordStatus, compareWord, splitWords as wordsOf,
  isSpeechSupported, createRecognition, type RecognitionHandle,
} from "../services/reciteService";

/* ─── Main component ─── */
export default function AIRecitationDemo() {
  const [surahList, setSurahList] = useState<SurahMeta[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [surahIdx, setSurahIdx] = useState(0);
  const [ayat, setAyat] = useState<AyahData[]>([]);
  const [loadingAyat, setLoadingAyat] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [wordStatuses, setWordStatuses] = useState<WordStatus[]>([]);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [showTransliteration, setShowTransliteration] = useState(true);

  const recognitionRef = useRef<RecognitionHandle | null>(null);
  const wordCursorRef = useRef(0);
  const wordStatusesRef = useRef<WordStatus[]>([]);

  /* Fetch surah list on mount — proxy first, AlQuran Cloud direct fallback */
  useEffect(() => {
    const load = async () => {
      try {
        // proxy route
        let res = await fetch("/api/quran/surah");
        if (!res.ok) throw new Error("proxy failed");
        const json = await res.json();
        if (Array.isArray(json.data)) {
          setSurahList(json.data as SurahMeta[]);
          return;
        }
        throw new Error("bad response");
      } catch {
        // direct fallback
        try {
          const res = await fetch("https://api.alquran.cloud/v1/surah");
          const json = await res.json();
          if (Array.isArray(json.data)) {
            setSurahList(json.data as SurahMeta[]);
            return;
          }
        } catch { /* ignored */ }
        // offline fallback — at minimum Al-Fatiha
        setSurahList([FATIHA_FALLBACK]);
      }
    };
    load().finally(() => setLoadingList(false));
  }, []);

  /* Fetch ayat when surah changes — proxy first, direct fallback, hardcoded last resort */
  useEffect(() => {
    if (surahList.length === 0) return;
    const surahNumber = surahList[surahIdx].number;
    setLoadingAyat(true);

    const parse = (json: { data: { ayahs: { numberInSurah: number; text: string }[] }[] }): AyahData[] | null => {
      if (!Array.isArray(json.data) || json.data.length < 2) return null;
      const arabicAyahs = json.data[0].ayahs;
      const trAyahs = json.data[1].ayahs;
      return arabicAyahs.map((a, i) => ({
        n: a.numberInSurah,
        ar: a.text,
        tr: trAyahs[i]?.text ?? "",
      }));
    };

    const load = async () => {
      // 1. proxy
      try {
        const res = await fetch(`/api/quran/surah/${surahNumber}`);
        if (res.ok) {
          const json = await res.json();
          const merged = parse(json);
          if (merged) { setAyat(merged); return; }
        }
      } catch { /* proxy failed */ }

      // 2. direct
      try {
        const res = await fetch(
          `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.transliteration`
        );
        const json = await res.json();
        const merged = parse(json);
        if (merged) { setAyat(merged); return; }
      } catch { /* direct failed */ }

      // 3. hardcoded fallback for Al-Fatiha
      if (surahNumber === 1) setAyat(FATIHA_AYAT_FALLBACK);
    };

    load().finally(() => setLoadingAyat(false));
  }, [surahIdx, surahList]);

  const surah = surahList[surahIdx];

  // Al-Fatiha (1) already has Bismillah as verse 1; At-Tawbah (9) has no Bismillah
  const processedAyat: AyahData[] = surah && surah.number !== 1 && surah.number !== 9
    ? [BISMILLAH, ...ayat]
    : ayat;

  // Flatten all words across all ayat
  const allWords = processedAyat.flatMap(a => wordsOf(a.ar));

  const stats = {
    correct: wordStatuses.filter(s => s === "correct").length,
    incorrect: wordStatuses.filter(s => s === "incorrect").length,
    skipped: wordStatuses.filter(s => s === "skipped").length,
    total: allWords.length,
  };
  const accuracy = stats.total > 0
    ? Math.round((stats.correct / Math.max(stats.correct + stats.incorrect + stats.skipped, 1)) * 100)
    : 100;

  const reset = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    wordCursorRef.current = 0;
    wordStatusesRef.current = [];
    setListening(false);
    setTranscript("");
    setInterimTranscript("");
    setWordStatuses([]);
    setCurrentWordIdx(0);
    setDone(false);
  }, []);

  // Reset when surah changes
  useEffect(() => { reset(); }, [surahIdx, reset]);

  useEffect(() => {
    if (!isSpeechSupported()) setSupported(false);
  }, []);

  const startListening = useCallback(() => {
    if (!isSpeechSupported()) return;

    // Sync refs to latest state before starting
    wordCursorRef.current = currentWordIdx;
    wordStatusesRef.current = [...wordStatuses];

    const handle = createRecognition({
      onStart: () => setListening(true),
      onEnd: () => {
        setListening(false);
        setInterimTranscript("");
      },
      onInterimResult: (t) => setInterimTranscript(t),
      onFinalResult: (primary, alternatives) => {
        const cursor = wordCursorRef.current;
        const statuses = [...wordStatusesRef.current];

        if (cursor >= allWords.length) return;

        setTranscript((prev) => (prev + " " + primary).trim());

        // Try each alternative; match against cursor and up to 3 words ahead
        const expected = allWords[cursor];
        const matched = alternatives.some((alt) =>
          wordsOf(alt).some((sw) => compareWord(expected, sw))
        );

        if (matched) {
          statuses[cursor] = "correct";
          wordCursorRef.current = cursor + 1;
        } else {
          // Look ahead up to 3 words for a skip
          let skipTo = -1;
          for (let look = cursor + 1; look < Math.min(cursor + 4, allWords.length); look++) {
            if (alternatives.some((alt) =>
              wordsOf(alt).some((sw) => compareWord(allWords[look], sw))
            )) { skipTo = look; break; }
          }
          if (skipTo >= 0) {
            for (let k = cursor; k < skipTo; k++) statuses[k] = "skipped";
            statuses[skipTo] = "correct";
            wordCursorRef.current = skipTo + 1;
          } else {
            statuses[cursor] = "incorrect";
            wordCursorRef.current = cursor + 1;
          }
        }

        wordStatusesRef.current = statuses;
        setWordStatuses([...statuses]);
        setCurrentWordIdx(wordCursorRef.current);

        if (wordCursorRef.current >= allWords.length) {
          setDone(true);
          handle.stop();
        }
      },
      onError: (err) => {
        if (err !== "aborted" && err !== "no-speech") setListening(false);
      },
    }, true /* autoRestart */);

    recognitionRef.current = handle;
    handle.start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allWords, currentWordIdx, wordStatuses]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
    setInterimTranscript("");
  }, []);

  const toggleMic = () => {
    if (listening) stopListening();
    else startListening();
  };

  const statusColor: Record<WordStatus, string> = {
    idle: "text-white/60",
    current: "text-white bg-[#57d996]/20 rounded px-1",
    correct: "text-[#57d996]",
    incorrect: "text-[#ef4444] line-through decoration-[#ef4444]",
    skipped: "text-[#f7ca45]",
  };

  return (
    <div className="min-h-screen bg-[#050907] text-white pt-20">

      {/* Sticky mic FAB — always visible while scrolling through long surahs */}
      {!done && supported && processedAyat.length > 0 && (
        <div className="fixed top-20 right-4 sm:right-6 z-40">
          <button
            onClick={toggleMic}
            disabled={loadingAyat}
            title={listening ? "Stop listening" : "Start reciting"}
            className={`relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
              listening
                ? "bg-[#ef4444] shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                : "bg-[#57d996] shadow-[0_0_20px_rgba(87,217,150,0.4)] hover:shadow-[0_0_35px_rgba(87,217,150,0.6)]"
            }`}
          >
            {listening && (
              <span className="absolute inset-0 rounded-full bg-[#ef4444] animate-ping opacity-30 pointer-events-none" />
            )}
            {listening
              ? <MicOff size={22} className="text-white" />
              : <Mic size={22} className="text-black" />
            }
          </button>
        </div>
      )}

      {/* Header — compact */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-[#57d996]/10 text-[#57d996] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#57d996]/20 mb-2">
              <Zap size={10} /> LIVE AI DEMO
            </span>
            <h1 className="text-xl sm:text-2xl font-black leading-tight">
              Recite. Get corrected. <span className="text-[#57d996]">Memorize faster.</span>
            </h1>
          </div>
          <p className="text-white/50 text-xs max-w-xs">
            Click the mic and recite. Noor-ul-Quran listens word-by-word and detects mistakes in real time.
          </p>
        </div>
      </div>

      {/* Main panel */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">

          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            {/* Surah selector */}
            <div className="relative">
              <button
                onClick={() => setShowSelector(!showSelector)}
                disabled={loadingList}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
              >
                {loadingList ? (
                  <span className="text-white/40 text-xs">Loading surahs…</span>
                ) : surah ? (
                  <>
                    <span className="text-white/40 text-xs font-mono">{surah.number}</span>
                    <span className="text-white/50">·</span>
                    <span>{surah.englishName}</span>
                    <span className="text-white/30 text-xs hidden sm:inline">({surah.numberOfAyahs} ayat)</span>
                  </>
                ) : null}
                <ChevronDown size={14} className={`transition-transform text-white/40 ${showSelector ? "rotate-180" : ""}`} />
              </button>

              {showSelector && surahList.length > 0 && (
                <div className="absolute top-full left-0 mt-2 bg-[#0d1a12] border border-white/15 rounded-2xl overflow-hidden shadow-2xl z-20 w-72 max-h-[420px] overflow-y-auto">
                  <div className="px-4 py-2.5 border-b border-white/10 sticky top-0 bg-[#0d1a12]">
                    <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">All 114 Surahs</p>
                  </div>
                  {surahList.map((s, i) => (
                    <button
                      key={s.number}
                      onClick={() => { setSurahIdx(i); setShowSelector(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left ${i === surahIdx ? "bg-[#57d996]/10" : ""}`}
                    >
                      <span className="text-[10px] text-white/30 w-7 text-right flex-shrink-0 font-mono">{s.number}</span>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-bold ${i === surahIdx ? "text-[#57d996]" : "text-white/80"}`}>{s.englishName}</div>
                        <div className="text-[10px] text-white/30">{s.numberOfAyahs} ayat</div>
                      </div>
                      <span className="text-white/40 text-sm flex-shrink-0" style={{ fontFamily: "var(--font-amiri), serif" }}>{s.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowTransliteration(!showTransliteration)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${showTransliteration ? "border-[#57d996]/40 text-[#57d996] bg-[#57d996]/10" : "border-white/20 text-white/40 hover:border-white/40"}`}
              >
                Transliteration
              </button>
              <button
                onClick={reset}
                className="text-white/40 hover:text-white transition-colors p-1.5"
                title="Reset"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-4 divide-x divide-white/10 border-b border-white/10">
            {[
              { label: "Accuracy", value: `${accuracy}%`, color: accuracy >= 80 ? "#57d996" : accuracy >= 50 ? "#f7ca45" : "#ef4444" },
              { label: "Correct", value: stats.correct, color: "#57d996" },
              { label: "Mistakes", value: stats.incorrect, color: "#ef4444" },
              { label: "Skipped", value: stats.skipped, color: "#f7ca45" },
            ].map((s, i) => (
              <div key={i} className="px-4 py-3 text-center">
                <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Arabic text display */}
          <div className="p-6 sm:p-10">
            {loadingAyat || loadingList ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-10 h-10 rounded-full border-2 border-[#57d996]/30 border-t-[#57d996] animate-spin" />
                <p className="text-white/30 text-sm">Loading surah…</p>
              </div>
            ) : (
              <div className="space-y-8" dir="rtl">
                {processedAyat.map((ayah) => {
                  const ayahWords = wordsOf(ayah.ar);
                  let offset = 0;
                  for (const a of processedAyat) {
                    if (a.n === ayah.n) break;
                    offset += wordsOf(a.ar).length;
                  }

                  return (
                    <div key={ayah.n} className="group">
                      <div className="flex items-start gap-3 justify-end">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-xs text-white/40 mt-1">
                          {ayah.n}
                        </span>
                        <p className="text-3xl sm:text-4xl leading-loose font-arabic tracking-wide text-right">
                          {ayahWords.map((word, wi) => {
                            const globalIdx = offset + wi;
                            const status: WordStatus = wordStatuses[globalIdx] ??
                              (globalIdx === currentWordIdx ? "current" : "idle");
                            return (
                              <span
                                key={wi}
                                className={`inline-block mx-1 transition-all duration-200 rounded cursor-default select-none ${status === "idle" ? "hover:bg-white/10 hover:text-white" : ""} ${statusColor[status]}`}
                              >
                                {word}
                              </span>
                            );
                          })}
                        </p>
                      </div>

                      {showTransliteration && (
                        <p className="text-white/30 text-sm mt-2 text-right pr-11 italic">{ayah.tr}</p>
                      )}

                      <div className="h-px bg-white/5 mt-6" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Live transcript */}
          {(transcript || interimTranscript) && (
            <div className="mx-6 mb-6 bg-white/5 border border-white/10 rounded-2xl p-4" dir="rtl">
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2 text-left">Live transcript</p>
              <p className="text-white/70 text-base leading-relaxed">
                {transcript}
                <span className="text-white/30 italic">{interimTranscript}</span>
              </p>
            </div>
          )}

          {/* Mic button area */}
          <div className="px-6 pb-8 flex flex-col items-center gap-4">

            {done ? (
              <div className="text-center">
                <div className="text-5xl mb-3">🎉</div>
                <h3 className="text-xl font-black text-white mb-1">Surah Complete!</h3>
                <p className="text-white/50 text-sm mb-5">
                  You recited {stats.correct} words correctly with {accuracy}% accuracy.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={reset}
                    className="flex items-center gap-2 bg-[#57d996] hover:bg-[#6ff2a8] text-black font-bold px-6 py-3 rounded-full text-sm transition-all"
                  >
                    <RotateCcw size={14} /> Try Again
                  </button>
                  <button
                    onClick={() => setSurahIdx((i) => (i + 1) % surahList.length)}
                    className="flex items-center gap-2 border border-white/20 hover:border-white/50 text-white font-bold px-6 py-3 rounded-full text-sm transition-all"
                  >
                    Next Surah →
                  </button>
                </div>
              </div>
            ) : !supported ? (
              <div className="text-center py-4">
                <p className="text-white/40 text-sm">
                  Speech recognition is not supported in this browser.<br />
                  Please use <span className="text-white/70 font-semibold">Chrome</span> or <span className="text-white/70 font-semibold">Edge</span> for the live demo.
                </p>
              </div>
            ) : (
              <>
                {/* Mic button */}
                <button
                  onClick={toggleMic}
                  disabled={loadingAyat || processedAyat.length === 0}
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center overflow-hidden transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                    listening
                      ? "bg-[#ef4444] shadow-[0_0_40px_rgba(239,68,68,0.5)]"
                      : "bg-[#57d996] shadow-[0_0_30px_rgba(87,217,150,0.4)] hover:shadow-[0_0_50px_rgba(87,217,150,0.6)]"
                  }`}
                >
                  {listening && (
                    <span className="absolute inset-0 rounded-full bg-[#ef4444] animate-ping opacity-30 pointer-events-none" />
                  )}
                  {listening
                    ? <MicOff size={28} className="text-white" />
                    : <Mic size={28} className="text-black" />
                  }
                </button>

                <p className="text-white/30 text-xs text-center max-w-xs">
                  {listening
                    ? "Listening… recite the highlighted surah in Arabic"
                    : "Tap the mic to start reciting in Arabic"
                  }
                </p>

                {/* Legend */}
                <div className="flex items-center gap-4 text-[11px] text-white/30 flex-wrap justify-center">
                  <span><span className="text-[#57d996] font-bold">Green</span> = correct</span>
                  <span><span className="text-[#ef4444] font-bold">Red</span> = mistake</span>
                  <span><span className="text-[#f7ca45] font-bold">Yellow</span> = skipped</span>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
