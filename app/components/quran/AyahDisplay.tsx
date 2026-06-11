"use client";
import { Play, Bookmark, BookmarkCheck } from "lucide-react";
import { useQuranReader } from "../../context/QuranReaderContext";
import type { AyahData, AyahWithWords } from "../../types/quran";
import type { WordStatus } from "../../services/reciteService";
import { addBookmark, removeBookmark, isBookmarked } from "../../services/bookmarkService";
import { useState, useCallback } from "react";

const FONT_SIZES: Record<number, string> = {
  1: "text-2xl",
  2: "text-3xl",
  3: "text-4xl",
  4: "text-5xl",
  5: "text-6xl",
};

interface Props {
  ayah: AyahData;
  ayahWithWords?: AyahWithWords;
  surahNumber: number;
  surahName: string;
  isHighlighted: boolean;
  isWordByWord: boolean;
  isMemorization: boolean;
  isRecite?: boolean;
  reciteWordOffset?: number;
  reciteWordStatuses?: WordStatus[];
  reciteWordCursor?: number;
}

export default function AyahDisplay({
  ayah, ayahWithWords, surahNumber, surahName,
  isHighlighted, isWordByWord, isMemorization,
  isRecite = false, reciteWordOffset = 0, reciteWordStatuses = [], reciteWordCursor = 0,
}: Props) {
  const { settings, playAyah, selectedWord, setSelectedWord, setHighlightedAyah, revealedWords, revealWord } =
    useQuranReader();
  const [bookmarked, setBookmarked] = useState(() =>
    isBookmarked(surahNumber, ayah.numberInSurah)
  );

  const toggleBookmark = () => {
    if (bookmarked) {
      removeBookmark(surahNumber, ayah.numberInSurah);
    } else {
      addBookmark({ surahNumber, ayahNumber: ayah.numberInSurah, surahName });
    }
    setBookmarked(!bookmarked);
  };

  const handlePlay = useCallback(() => {
    playAyah(surahNumber, ayah.numberInSurah);
  }, [playAyah, surahNumber, ayah.numberInSurah]);

  const arabicSize = FONT_SIZES[settings.fontSize] ?? FONT_SIZES[3];
  const words = ayahWithWords?.words ?? [];
  const hasWords = words.length > 0;

  const renderArabicBlock = () => {
    if (!settings.showArabic) return null;

    if (isWordByWord && hasWords) {
      return (
        <p
          className={`${arabicSize} leading-loose text-right`}
          dir="rtl"
          style={{ fontFamily: "var(--font-quran), var(--font-amiri), serif" }}
        >
          {words.map((w) => {
            const isSelected =
              selectedWord?.ayahNumberInSurah === ayah.numberInSurah &&
              selectedWord?.position === w.position;
            return (
              <span
                key={w.position}
                data-word={`${ayah.numberInSurah}-${w.position}`}
                onClick={() =>
                  setSelectedWord({ ayahNumberInSurah: ayah.numberInSurah, position: w.position, word: w })
                }
                className={`inline-block mx-1 cursor-pointer rounded-lg transition-all duration-150 px-1 py-0.5 ${
                  isSelected
                    ? "bg-[#57d996] text-black shadow-[0_0_12px_rgba(87,217,150,0.5)]"
                    : "hover:bg-[#57d996]/20 hover:text-[#57d996]"
                }`}
              >
                {w.textUthmani}
              </span>
            );
          })}
          <span className="text-[#57d996]/60 text-2xl mx-2" style={{ fontFamily: "var(--font-quran), var(--font-amiri), serif" }}>
            {`۝${arabicNumeral(ayah.numberInSurah)}`}
          </span>
        </p>
      );
    }

    if (isMemorization) {
      return (
        <p
          className={`${arabicSize} leading-loose text-right`}
          dir="rtl"
          style={{ fontFamily: "var(--font-quran), var(--font-amiri), serif" }}
        >
          {(hasWords ? words : ayah.text.split(/\s+/)).map((item, i) => {
            const wordText = typeof item === "string" ? item : item.textUthmani;
            const key = `${ayah.numberInSurah}-${i + 1}`;
            const revealed = revealedWords.has(key);
            return (
              <span
                key={i}
                onClick={() => revealWord(ayah.numberInSurah, i + 1)}
                className={`inline-block mx-1 cursor-pointer transition-all duration-200 rounded ${
                  revealed ? "text-white" : "bg-white/20 text-transparent select-none"
                }`}
              >
                {wordText}
              </span>
            );
          })}
        </p>
      );
    }

    if (isRecite) {
      const rawWords = hasWords
        ? words.map((w) => w.textUthmani)
        : ayah.text.split(/\s+/).filter(Boolean);

      return (
        <p
          className={`${arabicSize} leading-loose text-right`}
          dir="rtl"
          style={{ fontFamily: "var(--font-quran), var(--font-amiri), serif" }}
        >
          {rawWords.map((wordText, i) => {
            const flatIdx = reciteWordOffset + i;
            const status: WordStatus = reciteWordStatuses[flatIdx] ?? "idle";
            const isCurrent = flatIdx === reciteWordCursor && status === "current";
            const colorClass =
              status === "correct"   ? "text-green-400 bg-green-400/10"
              : status === "incorrect" ? "text-red-400 bg-red-400/10"
              : status === "skipped"   ? "text-yellow-400 bg-yellow-400/10"
              : isCurrent              ? "text-white bg-[#57d996]/20 ring-1 ring-[#57d996]/50 shadow-[0_0_10px_rgba(87,217,150,0.3)]"
              : "text-white/50";
            return (
              <span
                key={i}
                className={`inline-block mx-1 rounded px-0.5 transition-all duration-300 ${colorClass}`}
              >
                {wordText}
              </span>
            );
          })}
          <span className="text-[#57d996]/60 text-2xl mx-2">
            {`۝${arabicNumeral(ayah.numberInSurah)}`}
          </span>
        </p>
      );
    }

    return (
      <p
        className={`${arabicSize} leading-loose text-right`}
        dir="rtl"
        style={{ fontFamily: "var(--font-quran), var(--font-amiri), serif" }}
      >
        {ayah.text}{" "}
        <span className="text-[#57d996]/60 text-2xl">
          {`۝${arabicNumeral(ayah.numberInSurah)}`}
        </span>
      </p>
    );
  };

  return (
    <div
      id={`ayah-${ayah.numberInSurah}`}
      className={`group px-4 sm:px-6 py-3 border-b border-white/[0.04] transition-all duration-200 ${
        isHighlighted ? "bg-[#57d996]/8 border-l-2 border-l-[#57d996]" : "hover:bg-white/[0.015]"
      }`}
      onClick={() => setHighlightedAyah(ayah.numberInSurah)}
    >
      {/* Two-column layout: [LEFT: number + translation] [RIGHT: Arabic] */}
      <div className="flex flex-row gap-4 items-start max-w-5xl mx-auto">

        {/* LEFT column: ayah number + actions + translation */}
        <div className="w-[38%] flex-shrink-0 flex flex-col gap-1 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-white/15 flex items-center justify-center text-[10px] text-white/35 font-mono flex-shrink-0">
                {ayah.numberInSurah}
              </div>
              <span className="text-white/15 text-[9px] uppercase tracking-widest hidden sm:inline">
                Juz {ayah.juz}
              </span>
            </div>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); handlePlay(); }}
                className="p-1.5 text-white/35 hover:text-[#57d996] hover:bg-[#57d996]/10 rounded-md transition-all"
                title="Play"
              >
                <Play size={13} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); toggleBookmark(); }}
                className="p-1.5 text-white/35 hover:text-[#f7ca45] hover:bg-[#f7ca45]/10 rounded-md transition-all"
                title={bookmarked ? "Remove bookmark" : "Bookmark"}
              >
                {bookmarked ? <BookmarkCheck size={13} className="text-[#f7ca45]" /> : <Bookmark size={13} />}
              </button>
            </div>
          </div>
          {settings.showTranslation && ayah.translation && (
            <p className="text-white/50 text-[12px] leading-snug">
              {ayah.translation}
            </p>
          )}
        </div>

        {/* RIGHT column: Arabic text (takes remaining ~62% width) */}
        <div className="flex-1 min-w-0">
          {renderArabicBlock()}
          {settings.showTransliteration && ayah.transliteration && (
            <p className="text-white/35 text-xs italic mt-1 text-right leading-relaxed" dir="rtl">
              {ayah.transliteration}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

function arabicNumeral(n: number): string {
  return n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
}
