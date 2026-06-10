"use client";
import { useEffect, useRef, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Volume2, X } from "lucide-react";
import { useQuranReader } from "../../context/QuranReaderContext";
import type { WordData } from "../../types/quran";

interface FlatWord {
  word: WordData;
  ayahNumber: number;
}

export default function WordPanel() {
  const { selectedWord, setSelectedWord, ayahsWithWords, mode } = useQuranReader();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Flat ordered list of all words in the surah
  const flatWords = useMemo<FlatWord[]>(() => {
    const result: FlatWord[] = [];
    for (const ayah of ayahsWithWords) {
      for (const word of ayah.words) {
        result.push({ word, ayahNumber: ayah.numberInSurah });
      }
    }
    return result;
  }, [ayahsWithWords]);

  const currentIdx = useMemo(() => {
    if (!selectedWord) return -1;
    return flatWords.findIndex(
      (fw) =>
        fw.ayahNumber === selectedWord.ayahNumberInSurah &&
        fw.word.position === selectedWord.position
    );
  }, [selectedWord, flatWords]);

  const goToIndex = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= flatWords.length) return;
      const { word, ayahNumber } = flatWords[idx];
      setSelectedWord({ ayahNumberInSurah: ayahNumber, position: word.position, word });
      // Scroll the word into view
      const el = document.querySelector(`[data-word="${ayahNumber}-${word.position}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
    [flatWords, setSelectedWord]
  );

  // Play word audio whenever the selected word changes; auto-advance on end
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current = null;
    }
    if (!selectedWord?.word.audioUrl) return;

    const audio = new Audio(selectedWord.word.audioUrl);
    audioRef.current = audio;

    audio.onended = () => {
      // Auto-advance to next word after a brief pause
      setTimeout(() => {
        goToIndex(currentIdx + 1);
      }, 350);
    };

    audio.play().catch(() => {});
    return () => { audio.pause(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWord?.word.audioUrl, selectedWord?.ayahNumberInSurah, selectedWord?.position]);

  if (mode !== "word-by-word" || !selectedWord) return null;

  const word = selectedWord.word;
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx >= 0 && currentIdx < flatWords.length - 1;

  const replayAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } else if (word.audioUrl) {
      const a = new Audio(word.audioUrl);
      audioRef.current = a;
      a.play().catch(() => {});
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a160f]/98 backdrop-blur-xl border-t border-[#57d996]/25 shadow-[0_-8px_32px_rgba(0,0,0,0.4)]">
      {/* Progress strip */}
      {flatWords.length > 0 && (
        <div className="h-0.5 bg-white/5">
          <div
            className="h-full bg-[#57d996]/60 transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / flatWords.length) * 100}%` }}
          />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          {/* Arabic word — large, centred */}
          <div className="flex-1 min-w-0">
            <div
              className="text-4xl sm:text-5xl leading-loose text-white mb-1.5"
              style={{ fontFamily: "var(--font-quran), var(--font-amiri), serif", direction: "rtl" }}
            >
              {word.textUthmani}
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-0.5 text-sm">
              {word.transliteration && (
                <span className="text-[#57d996]/80 italic font-medium">{word.transliteration}</span>
              )}
              {word.translation && (
                <span className="text-white/70">{word.translation}</span>
              )}
              {word.rootLetters && (
                <span
                  className="text-[#f7ca45]/70 text-base"
                  style={{ fontFamily: "var(--font-quran), var(--font-amiri), serif" }}
                >
                  ∞ {word.rootLetters}
                </span>
              )}
            </div>

            {flatWords.length > 0 && (
              <div className="text-white/20 text-[10px] mt-1 font-mono tabular-nums">
                {currentIdx + 1} / {flatWords.length} words
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            {/* Audio button */}
            <button
              onClick={replayAudio}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                word.audioUrl
                  ? "bg-[#57d996]/20 hover:bg-[#57d996]/35 border border-[#57d996]/30 text-[#57d996]"
                  : "bg-white/5 text-white/20 cursor-not-allowed"
              }`}
              disabled={!word.audioUrl}
              title={word.audioUrl ? "Replay audio" : "No audio available"}
            >
              <Volume2 size={16} />
            </button>

            {/* Prev / Next */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => goToIndex(currentIdx - 1)}
                disabled={!hasPrev}
                className="w-9 h-9 rounded-full bg-white/8 hover:bg-white/15 text-white/60 hover:text-white disabled:opacity-20 flex items-center justify-center transition-all"
                title="Previous word"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                onClick={() => goToIndex(currentIdx + 1)}
                disabled={!hasNext}
                className="w-9 h-9 rounded-full bg-[#57d996] hover:bg-[#6ff2a8] text-black disabled:opacity-25 disabled:bg-white/10 disabled:text-white/20 flex items-center justify-center transition-all"
                title="Next word"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Close */}
            <button
              onClick={() => setSelectedWord(null)}
              className="text-white/20 hover:text-white/60 transition-colors p-1"
              title="Close"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
