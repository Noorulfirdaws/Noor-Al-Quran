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

  // Direct audio refs — no singleton, no DOM tricks
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Pre-fetched next-ayah audio — eliminates the ~1 s gap between verses
  const nextAudioRef = useRef<{ url: string; audio: HTMLAudioElement } | null>(null);
  const surahMetaRef = useRef(surahMeta);
  surahMetaRef.current = surahMeta;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  // Store playAyah in a ref so onended callbacks don't go stale
  const playAyahRef = useRef<((s: number, a: number) => void) | null>(null);

  // Migrate old EveryAyah reciter IDs to Islamic Network
  useEffect(() => {
    const MAP: Record<string, string> = {
      "Alafasy_128kbps": "ar.alafasy",
      "Abdul_Basit_Murattal_192kbps": "ar.abdurrahmaansudais",
      "Saad_al-Ghamdi_128kbps": "ar.husary",
      "Minshawy_Murattal_128kbps": "ar.minshawi",
      "Mohammad_al_Tablawi_128kbps": "ar.shaatree",
    };
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ReaderSettings>;
        if (parsed.reciterId && MAP[parsed.reciterId]) {
          parsed.reciterId = MAP[parsed.reciterId];
        }
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

  // ── Audio ────────────────────────────────────────────────────────────────────

  const stopAudioSilently = useCallback(() => {
    if (audioRef.current) {
      const a = audioRef.current;
      a.onended = null;
      a.onerror = null;
      a.onplaying = null;
      a.onpause = null;
      a.onwaiting = null;
      a.pause();
      a.src = "";
      audioRef.current = null;
    }
    // Discard any pre-fetched next ayah
    if (nextAudioRef.current) {
      nextAudioRef.current.audio.src = "";
      nextAudioRef.current = null;
    }
  }, []);

  const playAyah = useCallback(
    (surahNumber: number, ayahNumber: number) => {
      // ── Basmala injection ─────────────────────────────────────────────────
      // For surahs other than Al-Fatiha (1) and At-Tawbah (9), play the
      // Basmala audio (= surah 1 ayah 1 from the same reciter) before ayah 1.
      if (
        ayahNumber === 1 &&
        surahNumber !== 1 &&
        surahNumber !== 9
      ) {
        // Tear down cleanly
        if (audioRef.current) {
          const a = audioRef.current;
          a.onended = null; a.onerror = null; a.onplaying = null;
          a.onpause = null; a.onwaiting = null;
          a.pause(); a.src = "";
          audioRef.current = null;
        }
        if (nextAudioRef.current) { nextAudioRef.current.audio.src = ""; nextAudioRef.current = null; }

        const basmalaUrl = getAyahAudioUrl(settingsRef.current.reciterId, 1, 1);
        const basmalaAudio = new Audio(basmalaUrl);
        audioRef.current = basmalaAudio;

        setPlayingAyah(0); // 0 = Basmala indicator
        setIsAudioLoading(true);
        setIsPlaying(false);
        setHighlightedAyah(null);
        setAudioError(null);

        basmalaAudio.onplaying = () => { setIsAudioLoading(false); setIsPlaying(true); };
        basmalaAudio.onwaiting = () => { setIsAudioLoading(true); setIsPlaying(false); };
        basmalaAudio.onpause = () => { if (!basmalaAudio.ended) { setIsPlaying(false); setIsAudioLoading(false); } };
        basmalaAudio.onended = () => {
          setIsPlaying(false);
          setIsAudioLoading(false);
          // Now play the actual ayah 1
          playAyahRef.current?.(surahNumber, 1);
        };
        basmalaAudio.onerror = () => {
          // Basmala failed — skip straight to ayah 1
          playAyahRef.current?.(surahNumber, 1);
        };
        basmalaAudio.play().catch(() => {
          // Autoplay blocked — still proceed to ayah 1 via ref
          playAyahRef.current?.(surahNumber, 1);
        });
        return;
      }

      // Tear down current track but NOT the next-ayah preload — we may reuse it
      if (audioRef.current) {
        const a = audioRef.current;
        a.onended = null; a.onerror = null; a.onplaying = null;
        a.onpause = null; a.onwaiting = null;
        a.pause(); a.src = "";
        audioRef.current = null;
      }

      const url = getAyahAudioUrl(settingsRef.current.reciterId, surahNumber, ayahNumber);

      // Reuse pre-fetched audio if URL matches — eliminates buffering gap
      let audio: HTMLAudioElement;
      const cached = nextAudioRef.current;
      if (cached && cached.url === url) {
        audio = cached.audio;
        nextAudioRef.current = null;
      } else {
        // Discard stale preload
        if (nextAudioRef.current) { nextAudioRef.current.audio.src = ""; nextAudioRef.current = null; }
        audio = new Audio(url);
      }
      audioRef.current = audio;

      setPlayingAyah(ayahNumber);
      setIsAudioLoading(true);
      setIsPlaying(false);
      setHighlightedAyah(ayahNumber);
      setAudioError(null);

      audio.onplaying = () => {
        setIsAudioLoading(false);
        setIsPlaying(true);
      };

      audio.onwaiting = () => {
        setIsAudioLoading(true);
        setIsPlaying(false);
      };

      audio.onpause = () => {
        if (!audio.ended) {
          setIsPlaying(false);
          setIsAudioLoading(false);
        }
      };

      audio.onended = () => {
        setIsPlaying(false);
        setIsAudioLoading(false);
        const meta = surahMetaRef.current;
        const repeat = settingsRef.current.repeatMode;

        if (repeat === "verse") {
          // Replay same ayah — call through ref to avoid stale closure
          playAyahRef.current?.(surahNumber, ayahNumber);
          return;
        }

        const nextAyah = ayahNumber + 1;
        if (meta && nextAyah <= meta.numberOfAyahs) {
          playAyahRef.current?.(surahNumber, nextAyah);
        } else {
          setPlayingAyah(null);
          setHighlightedAyah(null);
        }
      };

      audio.onerror = () => {
        setIsAudioLoading(false);
        setIsPlaying(false);
        const code = (audio.error?.code ?? 0);
        const msgs: Record<number, string> = {
          1: "Playback aborted",
          2: "Network error loading audio",
          3: "Audio decoding failed",
          4: "Audio format not supported",
        };
        setAudioError(msgs[code] ?? "Could not play audio");
        setTimeout(() => setAudioError(null), 5000);
      };

      const p = audio.play();
      if (p) {
        p.catch((err: Error) => {
          if (err.name === "AbortError") return; // src changed, ignore
          setIsAudioLoading(false);
          setIsPlaying(false);
          setAudioError(`Playback blocked: ${err.message}`);
          setTimeout(() => setAudioError(null), 5000);
        });
      }

      // Pre-fetch next ayah immediately so it's buffered by the time we need it
      const meta2 = surahMetaRef.current;
      const nextNum = ayahNumber + 1;
      const repeat2 = settingsRef.current.repeatMode;
      if (repeat2 !== "verse" && meta2 && nextNum <= meta2.numberOfAyahs) {
        const nextUrl = getAyahAudioUrl(settingsRef.current.reciterId, surahNumber, nextNum);
        const nextAudio = new Audio();
        nextAudio.preload = "auto";
        nextAudio.src = nextUrl;
        nextAudioRef.current = { url: nextUrl, audio: nextAudio };
      }

      // Save reading progress
      const meta = surahMetaRef.current;
      if (meta) {
        saveProgress({ surahNumber, ayahNumber, surahName: meta.englishName });
      }
    },
    [stopAudioSilently]
  );

  // Keep the ref in sync after every render so onended closures call the latest version
  playAyahRef.current = playAyah;

  const pauseAudio = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resumeAudio = useCallback(() => {
    if (audioRef.current?.paused) {
      audioRef.current.play().catch(() => {});
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

  // Cleanup audio on unmount
  useEffect(() => {
    return () => { stopAudioSilently(); };
  }, [stopAudioSilently]);

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
