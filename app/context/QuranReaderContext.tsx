"use client";
import {
  createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode,
} from "react";
import type {
  SurahMeta, AyahData, AyahWithWords, WordData, ReaderSettings, ReaderMode,
} from "../types/quran";
import { DEFAULT_SETTINGS } from "../types/quran";
import { getSurah, getWordsForSurah } from "../services/quranService";
import { getAyahAudioUrl } from "../services/audioService";
import { saveProgress } from "../services/bookmarkService";

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

  // One persistent audio element — created once on client, reused for all playback
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
    };
  }, []);

  // Load saved settings
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ReaderSettings>;
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
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

  // Core play function — sets src on persistent element and calls play()
  const playSrc = useCallback((
    url: string,
    onEnded: () => void,
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

    el.src = url;
    el.load(); // explicit load — required in some browsers after src change

    el.onplaying = () => { setIsAudioLoading(false); setIsPlaying(true); };
    el.onwaiting = () => { setIsAudioLoading(true); setIsPlaying(false); };
    el.onpause = () => {
      if (!el.ended) { setIsPlaying(false); setIsAudioLoading(false); }
    };
    el.onended = onEnded;
    el.onerror = () => {
      setIsAudioLoading(false);
      setIsPlaying(false);
      setAudioError("Could not load audio. Try a different reciter.");
      setTimeout(() => setAudioError(null), 5000);
    };

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
        });
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
      });

      // Save progress
      const meta = surahMetaRef.current;
      if (meta) saveProgress({ surahNumber, ayahNumber, surahName: meta.englishName });
    },
    [playSrc]
  );

  // Keep ref current so event callbacks never go stale
  playAyahRef.current = playAyah;

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
