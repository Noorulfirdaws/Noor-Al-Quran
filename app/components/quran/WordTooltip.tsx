"use client";
import { useEffect, useRef } from "react";
import { X, Volume2 } from "lucide-react";
import type { WordData } from "../../types/quran";

interface Props {
  word: WordData;
  surahNumber: number;
  ayahNumberInSurah: number;
  reciterId: string;
  onClose: () => void;
}

export default function WordTooltip({ word, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const playWordAudio = () => {
    if (word.audioUrl) {
      const audio = new Audio(word.audioUrl);
      audio.play().catch(() => {});
    }
  };

  return (
    <div
      ref={ref}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#0d1a12] border border-[#57d996]/30 rounded-2xl shadow-2xl shadow-black/50 p-5 w-[min(340px,calc(100vw-2rem))] animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-white/30 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>

      {/* Arabic word */}
      <div
        className="text-4xl text-center mb-3 text-white leading-loose"
        style={{ fontFamily: "var(--font-amiri), serif", direction: "rtl" }}
      >
        {word.textUthmani}
      </div>

      {/* Info rows */}
      <div className="space-y-2 text-sm">
        {word.transliteration && (
          <div className="flex items-center gap-3">
            <span className="text-white/30 text-[10px] w-20 uppercase tracking-wider">Translit.</span>
            <span className="text-white/70 italic">{word.transliteration}</span>
          </div>
        )}
        {word.translation && (
          <div className="flex items-center gap-3">
            <span className="text-white/30 text-[10px] w-20 uppercase tracking-wider">Meaning</span>
            <span className="text-white font-semibold">{word.translation}</span>
          </div>
        )}
        {word.rootLetters && (
          <div className="flex items-center gap-3">
            <span className="text-white/30 text-[10px] w-20 uppercase tracking-wider">Root</span>
            <span
              className="text-[#57d996] font-bold text-base"
              style={{ fontFamily: "var(--font-amiri), serif" }}
            >
              {word.rootLetters}
            </span>
          </div>
        )}
      </div>

      {/* Audio */}
      {word.audioUrl && (
        <button
          onClick={playWordAudio}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-[#57d996]/15 hover:bg-[#57d996]/25 border border-[#57d996]/20 text-[#57d996] font-bold py-2.5 rounded-xl text-sm transition-all"
        >
          <Volume2 size={14} /> Play pronunciation
        </button>
      )}
    </div>
  );
}
