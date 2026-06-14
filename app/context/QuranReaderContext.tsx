"use client";
import {
  createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode,
} from "react";
import type {
  SurahMeta, AyahData, AyahWithWords, WordData, ReaderSettings, ReaderMode,
} from "../types/quran";
import { DEFAULT_SETTINGS } from "../types/quran";
import { getSurah, getWordsForSurah } from "../services/quranService";
import { getAyahAudioUrl, getFallbackAyahAudioUrl, getReciterById } from "../services/audioService";
import { saveProgress } from "../services/bookmarkService";
import {
  type WordStatus, splitWords,
  alignRecitation, type AlignResult,
  isSpeechSupported, createRecognition, type RecognitionHandle,
} from "../services/reciteService";

const SETTINGS_KEY = "noor:reader-settings";

export interface SelectedWord {
  ayahNumberInSurah: number;
  position: number;
  word: WordData;
}

interface ReaderCtx {
  surahMeta: SurahMeta | null;
  ayahs: AyahData[];
  ayahsWithWords: AyahWithWords[];
  loadingAyahs: boolean;
  loadingWords: boolean;
  errorMsg: string | null;

  loadSurah: (surahNumber: number) => Promise<void>;
  loadWords: (surahNumber: number) => Promise<void>;

  settings: ReaderSettings;
  updateSettings: (patch: Partial<ReaderSettings>) => void;

  mode: ReaderMode;
  setMode: (m: ReaderMode) => void;

  // Audio
  playingAyah: number | null;
  isPlaying: boolean;
  isAudioLoading: boolean;
  audioError: string | null;
  playAyah: (surahNumber: number, ayahNumber: number) => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  stopAudio: () => void;

  // Word selection
  selectedWord: SelectedWord | null;
  setSelectedWord: (w: SelectedWord | null) => void;

  highlightedAyah: number | null;
  setHighlightedAyah: (n: number | null) => void;

  revealedWords: Set<string>;
  revealWord: (ayah: number, position: number) => void;
  revealAll: () => void;
  hideAll: () => void;

  // ── AI Recitation Correction ──────────────────────────────────────────────
  speechSupported: boolean;
  isReciting: boolean;
  reciteWordStatuses: WordStatus[];   // flat array, one per word across whole surah
  reciteWordCursor: number;
  reciteDone: boolean;
  reciteInterim: string;
  reciteStats: { correct: number; incorrect: number; skipped: number; accuracy: number };
  startReciting: () => void;
  stopReciting: () => void;
  resetRecite: () => void;
}

const Ctx = createContext<ReaderCtx | null>(null);

export function QuranReaderProvider({ children }: { children: ReactNode }) {
  const [surahMeta, setSurahMeta] = useState<SurahMeta | null>(null);
  const [ayahs, setAyahs] = useState<AyahData[]>([]);
  const [ayahsWithWords, setAyahsWithWords] = useState<AyahWithWords[]>([]);
  const [loadingAyahs, setLoadingAyahs] = useState(false);
  const [loadingWords, setLoadingWords] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [mode, setModeState] = useState<ReaderMode>("reading");
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<SelectedWord | null>(null);
  const [highlightedAyah, setHighlightedAyah] = useState<number | null>(null);
  const [revealedWords, setRevealedWords] = useState<Set<string>>(new Set());

  // ── AI Recitation state ───────────────────────────────────────────────────
  // Start false on both server and client to avoid hydration mismatch,
  // then update on the client after mount.
  const [speechSupported, setSpeechSupported] = useState(false);
  useEffect(() => { setSpeechSupported(isSpeechSupported()); }, []);
  const [isReciting, setIsReciting] = useState(false);
  const [reciteWordStatuses, setReciteWordStatuses] = useState<WordStatus[]>([]);
  const [reciteWordCursor, setReciteWordCursor] = useState(0);
  const [reciteDone, setReciteDone] = useState(false);
  const [reciteInterim, setReciteInterim] = useState("");
  const [reciteStats, setReciteStats] = useState({
    correct: 0, incorrect: 0, skipped: 0, accuracy: 0,
  });
  const reciteHandleRef = useRef<RecognitionHandle | null>(null);
  // Flat array of all words across the currently loaded surah (for matching)
  const reciteWordsRef = useRef<string[]>([]);
  // Keep cursor in a ref so recognition callbacks always see the latest value
  const reciteCursorRef = useRef(0);
  const reciteStatusesRef = useRef<WordStatus[]>([]);
  const reciteStatsRef = useRef({ correct: 0, incorrect: 0, skipped: 0, accuracy: 0 });

  // ── Recite helpers ────────────────────────────────────────────────────────

  const recalcStats = (statuses: WordStatus[]) => {
    const correct = statuses.filter((s) => s === "correct").length;
    const incorrect = statuses.filter((s) => s === "incorrect").length;
    const skipped = statuses.filter((s) => s === "skipped").length;
    const total = correct + incorrect + skipped;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { correct, incorrect, skipped, accuracy };
  };

  const advanceCursor = useCallback((
    newStatuses: WordStatus[],
    nextCursor: number,
  ) => {
    const marked = [...newStatuses];
    // Mark the next word as "current" if we're not done
    if (nextCursor < marked.length && marked[nextCursor] === "idle") {
      marked[nextCursor] = "current";
    }
    reciteStatusesRef.current = marked;
    reciteCursorRef.current = nextCursor;
    setReciteWordStatuses(marked);
    setReciteWordCursor(nextCursor);
    const stats = recalcStats(marked);
    reciteStatsRef.current = stats;
    setReciteStats(stats);
  }, []);

  const startReciting = useCallback(() => {
    if (!isSpeechSupported()) return;
    // Build flat word list from ayahsWithWords if available, else from ayahs text
    let words: string[] = [];
    if (reciteStatusesRef.current.length > 0 && reciteWordsRef.current.length > 0) {
      // Already have words — just resume
    } else {
      const hasWordData = ayahsWithWords.length > 0;
      if (hasWordData) {
        ayahsWithWords.forEach((a) => {
          a.words.forEach((w) => words.push(w.textUthmani));
        });
      } else {
        ayahs.forEach((a) => {
          splitWords(a.text).forEach((w) => words.push(w));
        });
      }
      reciteWordsRef.current = words;
      // Initialise statuses: first word = "current", rest = "idle"
      const initialStatuses: WordStatus[] = words.map((_, i) =>
        i === 0 ? "current" : "idle"
      );
      reciteStatusesRef.current = initialStatuses;
      reciteCursorRef.current = 0;
      reciteStatsRef.current = { correct: 0, incorrect: 0, skipped: 0, accuracy: 0 };
      setReciteWordStatuses(initialStatuses);
      setReciteWordCursor(0);
      setReciteStats({ correct: 0, incorrect: 0, skipped: 0, accuracy: 0 });
      setReciteDone(false);
      setReciteInterim("");
    }

    setIsReciting(true);

    const handle = createRecognition({
      onInterimResult: (transcript) => {
        setReciteInterim(transcript);
      },
      onFinalResult: (_primary, alternatives) => {
        setReciteInterim("");
        const cursor = reciteCursorRef.current;
        const allWords = reciteWordsRef.current;
        const baseStatuses = reciteStatusesRef.current;

        if (cursor >= allWords.length) return;

        // A final result usually carries a whole phrase / ayah. Align that
        // entire spoken word stream against the expected Uthmani word list,
        // advancing through every word it covers. Try all ASR alternatives and
        // keep the one that yields the best alignment (most correct, fewest
        // wrong), so a better transcription wins.
        let best: AlignResult | null = null;
        for (const alt of alternatives) {
          const spoken = splitWords(alt);
          if (spoken.length === 0) continue;
          const res = alignRecitation(allWords, baseStatuses, cursor, spoken);
          if (
            !best ||
            res.correct - res.incorrect > best.correct - best.incorrect ||
            (res.correct - res.incorrect === best.correct - best.incorrect && res.cursor > best.cursor)
          ) {
            best = res;
          }
        }

        if (!best || best.cursor === cursor) return; // nothing advanced

        advanceCursor(best.statuses, best.cursor);
        if (best.cursor >= allWords.length) {
          setReciteDone(true);
          setIsReciting(false);
          reciteHandleRef.current?.stop();
        }
      },
      onEnd: () => {
        setIsReciting(false);
      },
      onError: (err) => {
        if (err !== "not-supported") console.warn("[recite]", err);
        setIsReciting(false);
      },
    }, true /* autoRestart */);

    reciteHandleRef.current = handle;
    handle.start();
  }, [ayahs, ayahsWithWords, advanceCursor]);

  const stopReciting = useCallback(() => {
    reciteHandleRef.current?.stop();
    reciteHandleRef.current = null;
    setIsReciting(false);
    setReciteInterim("");
  }, []);

  const resetRecite = useCallback(() => {
    stopReciting();
    reciteWordsRef.current = [];
    reciteStatusesRef.current = [];
    reciteCursorRef.current = 0;
    reciteStatsRef.current = { correct: 0, incorrect: 0, skipped: 0, accuracy: 0 };
    setReciteWordStatuses([]);
    setReciteWordCursor(0);
    setReciteStats({ correct: 0, incorrect: 0, skipped: 0, accuracy: 0 });
    setReciteDone(false);
    setReciteInterim("");
  }, [stopReciting]);

  // Reset recite state when surah changes
  const ayahsKey = ayahs.map((a) => a.numberInSurah).join(",");
  useEffect(() => {
    resetRecite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ayahsKey]);

  // One persistent audio element — created once on client, reused for all playback
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Hidden element used only to warm the browser/proxy cache for the NEXT ayah,
  // so switching to it is gapless instead of taking ~1–2s to fetch.
  const preloadRef = useRef<HTMLAudioElement | null>(null);
  // Guard: skip Basmala injection when playing the actual ayah 1 after Basmala finishes
  const skipBasmalaRef = useRef(false);
  const surahMetaRef = useRef(surahMeta);
  surahMetaRef.current = surahMeta;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  // Keep playAyah in a ref so event-listener callbacks never go stale
  const playAyahRef = useRef<((s: number, a: number) => void) | null>(null);

  // Create the persistent audio element once on mount
  useEffect(() => {
    const el = new Audio();
    el.preload = "auto";
    audioRef.current = el;
    return () => {
      el.pause();
      el.src = "";
      el.onplaying = null;
      el.onwaiting = null;
      el.onpause = null;
      el.onended = null;
      el.onerror = null;
      if (preloadRef.current) { preloadRef.current.src = ""; preloadRef.current = null; }
    };
  }, []);

  // Load saved settings
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ReaderSettings>;
        const merged = { ...DEFAULT_SETTINGS, ...parsed };
        // Migrate any retired/invalid reciter id (e.g. old "ar.*" CDN ids) to a
        // valid one so the menu highlight and audio stay in sync.
        merged.reciterId = getReciterById(merged.reciterId).id;
        setSettings(merged);
      }
    } catch { /* ignore */ }
  }, []);

  const updateSettings = useCallback((patch: Partial<ReaderSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  // ── Audio helpers ────────────────────────────────────────────────────────────

  const resetAudioState = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    el.onplaying = null;
    el.onwaiting = null;
    el.onpause = null;
    el.onended = null;
    el.onerror = null;
    el.pause();
    // Don't clear src here — let the next play set it
  }, []);

  const stopAudioSilently = useCallback(() => {
    resetAudioState();
    const el = audioRef.current;
    if (el) el.src = "";
  }, [resetAudioState]);

  // Core play function — sets src on persistent element and calls play().
  // `fallbackUrl` (optional) is tried ONCE if the primary `url` fails to load,
  // so a region-blocked / down CDN automatically retries the alternate source
  // before surfacing an error to the user.
  const playSrc = useCallback((
    url: string,
    onEnded: () => void,
    fallbackUrl?: string | null,
  ) => {
    const el = audioRef.current;
    if (!el) return;

    // Detach old handlers before changing src
    el.onplaying = null;
    el.onwaiting = null;
    el.onpause = null;
    el.onended = null;
    el.onerror = null;
    el.pause();

    let triedFallback = false;

    const attach = (srcUrl: string) => {
      el.src = srcUrl;

      el.onplaying = () => { setIsAudioLoading(false); setIsPlaying(true); };
      el.onwaiting = () => { setIsAudioLoading(true); setIsPlaying(false); };
      el.onpause = () => {
        if (!el.ended) { setIsPlaying(false); setIsAudioLoading(false); }
      };
      el.onended = onEnded;
      el.onerror = () => {
        // Primary source failed — try the alternate CDN once before giving up
        if (!triedFallback && fallbackUrl) {
          triedFallback = true;
          setIsAudioLoading(true);
          attach(fallbackUrl);
          const fp = el.play();
          if (fp) fp.catch(() => {});
          return;
        }
        setIsAudioLoading(false);
        setIsPlaying(false);
        setAudioError("Could not load audio. Try a different reciter.");
        setTimeout(() => setAudioError(null), 5000);
      };
    };

    attach(url);

    const p = el.play();
    if (p) {
      p.catch((err: Error) => {
        if (err.name === "AbortError") return; // normal — src was changed
        setIsAudioLoading(false);
        setIsPlaying(false);
        setAudioError("Playback blocked. Tap/click the play button again.");
        setTimeout(() => setAudioError(null), 5000);
      });
    }
  }, []);

  // Build the proxied fallback (EveryAyah) URL for a given ayah, or null.
  const fallbackUrlFor = useCallback((surahNumber: number, ayahNumber: number): string | null => {
    const direct = getFallbackAyahAudioUrl(settingsRef.current.reciterId, surahNumber, ayahNumber);
    return direct ? `/api/audio?url=${encodeURIComponent(direct)}` : null;
  }, []);

  // Warm the cache for any ayah's audio so the next switch is gapless. The proxy
  // serves immutable, cacheable responses, so fetching once primes both the
  // browser HTTP cache and the proxy. Works across surahs (the browser HTTP
  // cache survives client-side navigation to the next surah's page).
  const preloadAyah = useCallback((surahNumber: number, ayahNumber: number) => {
    if (surahNumber < 1 || surahNumber > 114 || ayahNumber < 1) return;
    const url = getAyahAudioUrl(settingsRef.current.reciterId, surahNumber, ayahNumber);
    let el = preloadRef.current;
    if (!el) { el = new Audio(); el.preload = "auto"; preloadRef.current = el; }
    if (el.src.endsWith(url)) return; // already warming this one
    try { el.src = url; el.load(); } catch { /* ignore */ }
  }, []);

  // Whenever a surah is loaded, warm the FIRST ayah of the NEXT surah so that
  // moving on to it starts instantly instead of waiting ~1–2s to fetch.
  useEffect(() => {
    const n = surahMeta?.number;
    if (!n || n >= 114) return;
    const id = setTimeout(() => preloadAyah(n + 1, 1), 1500);
    return () => clearTimeout(id);
  }, [surahMeta?.number, preloadAyah]);

  const playAyah = useCallback(
    (surahNumber: number, ayahNumber: number) => {

      // ── Basmala injection ──────────────────────────────────────────────────
      // Play surah 1 ayah 1 silently before ayah 1 of any surah except 1 and 9
      if (
        ayahNumber === 1 &&
        surahNumber !== 1 &&
        surahNumber !== 9 &&
        !skipBasmalaRef.current
      ) {
        const basmalaUrl = getAyahAudioUrl(settingsRef.current.reciterId, 1, 1);

        setPlayingAyah(1);
        setIsAudioLoading(true);
        setIsPlaying(false);
        setHighlightedAyah(null);
        setAudioError(null);

        const afterBasmala = () => {
          skipBasmalaRef.current = true;
          playAyahRef.current?.(surahNumber, 1);
          setTimeout(() => { skipBasmalaRef.current = false; }, 0);
        };

        playSrc(basmalaUrl, () => {
          setIsPlaying(false);
          setIsAudioLoading(false);
          afterBasmala();
        }, fallbackUrlFor(1, 1));
        return;
      }

      skipBasmalaRef.current = false;

      // ── Main playback ──────────────────────────────────────────────────────
      const url = getAyahAudioUrl(settingsRef.current.reciterId, surahNumber, ayahNumber);

      setPlayingAyah(ayahNumber);
      setIsAudioLoading(true);
      setIsPlaying(false);
      setHighlightedAyah(ayahNumber);
      setAudioError(null);

      playSrc(url, () => {
        setIsPlaying(false);
        setIsAudioLoading(false);

        const meta = surahMetaRef.current;
        const repeat = settingsRef.current.repeatMode;

        if (repeat === "verse") {
          playAyahRef.current?.(surahNumber, ayahNumber);
          return;
        }

        const next = ayahNumber + 1;
        if (meta && next <= meta.numberOfAyahs) {
          playAyahRef.current?.(surahNumber, next);
        } else {
          setPlayingAyah(null);
          setHighlightedAyah(null);
        }
      }, fallbackUrlFor(surahNumber, ayahNumber));

      // Warm the NEXT ayah now so continuing playback is gapless. At the end of
      // a surah, warm the first ayah of the following surah instead.
      const m = surahMetaRef.current;
      if (m && ayahNumber + 1 <= m.numberOfAyahs) {
        preloadAyah(surahNumber, ayahNumber + 1);
      } else if (surahNumber < 114) {
        preloadAyah(surahNumber + 1, 1);
      }

      // Save progress
      if (m) saveProgress({ surahNumber, ayahNumber, surahName: m.englishName });
    },
    [playSrc, fallbackUrlFor, preloadAyah]
  );

  // Keep ref current so event callbacks never go stale
  playAyahRef.current = playAyah;

  // When the reciter changes mid-playback, immediately restart the current ayah
  // with the new reciter (instead of waiting for the next ayah).
  const prevReciterRef = useRef(settings.reciterId);
  useEffect(() => {
    if (prevReciterRef.current === settings.reciterId) return;
    prevReciterRef.current = settings.reciterId;
    const meta = surahMetaRef.current;
    if (playingAyah !== null && meta) {
      // Reset the preload cache so it warms with the new reciter, then replay.
      if (preloadRef.current) preloadRef.current.src = "";
      playAyahRef.current?.(meta.number, playingAyah);
    }
  }, [settings.reciterId, playingAyah]);

  const pauseAudio = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resumeAudio = useCallback(() => {
    const el = audioRef.current;
    if (el?.paused && el.src) {
      el.play().catch(() => {});
    }
  }, []);

  const stopAudio = useCallback(() => {
    stopAudioSilently();
    setIsPlaying(false);
    setIsAudioLoading(false);
    setPlayingAyah(null);
    setHighlightedAyah(null);
  }, [stopAudioSilently]);

  // ── Surah loading ─────────────────────────────────────────────────────────

  const loadSurah = useCallback(async (surahNumber: number) => {
    stopAudioSilently();
    setLoadingAyahs(true);
    setErrorMsg(null);
    setAyahs([]);
    setSurahMeta(null);
    setAyahsWithWords([]);
    setSelectedWord(null);
    setPlayingAyah(null);
    setIsPlaying(false);
    setIsAudioLoading(false);
    try {
      const { meta, ayahs: data } = await getSurah(surahNumber);
      setSurahMeta(meta);
      setAyahs(data);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to load surah.");
    } finally {
      setLoadingAyahs(false);
    }
  }, [stopAudioSilently]);

  const loadWords = useCallback(async (surahNumber: number) => {
    setLoadingWords(true);
    try {
      const data = await getWordsForSurah(surahNumber);
      setAyahsWithWords(data);
    } catch {
      // word-by-word unavailable — graceful degradation
    } finally {
      setLoadingWords(false);
    }
  }, []);

  const setMode = useCallback((m: ReaderMode) => {
    setModeState(m);
    if (m === "memorization") setRevealedWords(new Set());
    if (m !== "word-by-word") setSelectedWord(null);
  }, []);

  const revealWord = useCallback((ayah: number, position: number) => {
    setRevealedWords((prev) => new Set(prev).add(`${ayah}-${position}`));
  }, []);

  const revealAll = useCallback(() => {
    const all = new Set<string>();
    ayahs.forEach((a) => {
      const wCount =
        ayahsWithWords.find((w) => w.numberInSurah === a.numberInSurah)?.words.length ??
        a.text.split(/\s+/).filter(Boolean).length;
      for (let i = 1; i <= wCount; i++) all.add(`${a.numberInSurah}-${i}`);
    });
    setRevealedWords(all);
  }, [ayahs, ayahsWithWords]);

  const hideAll = useCallback(() => setRevealedWords(new Set()), []);

  return (
    <Ctx.Provider value={{
      surahMeta, ayahs, ayahsWithWords, loadingAyahs, loadingWords, errorMsg,
      loadSurah, loadWords, settings, updateSettings,
      mode, setMode,
      playingAyah, isPlaying, isAudioLoading, audioError,
      playAyah, pauseAudio, resumeAudio, stopAudio,
      selectedWord, setSelectedWord,
      highlightedAyah, setHighlightedAyah,
      revealedWords, revealWord, revealAll, hideAll,
      speechSupported, isReciting, reciteWordStatuses, reciteWordCursor,
      reciteDone, reciteInterim, reciteStats,
      startReciting, stopReciting, resetRecite,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useQuranReader() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useQuranReader must be inside QuranReaderProvider");
  return ctx;
}
