"use client";
import { Play, Bookmark, BookmarkCheck } from "lucide-react";
import { useQuranReader } from "../../context/QuranReaderContext";
import type { AyahData, AyahWithWords } from "../../types/quran";
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
}

export default function AyahDisplay({
  ayah, ayahWithWords, surahNumber, surahName,
  isHighlighted, isWordByWord, isMemorization,
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

  const renderArabic = () => {
    if (!settings.showArabic) return null;

    if (isWordByWord && hasWords) {
      return (
        <p
          className={`${arabicSize} leading-loose text-right mb-3`}
          dir="rtl"
          style={{ fontFamily: "var(--font-amiri), serif" }}
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
          <span className="text-[#57d996]/60 text-2xl mx-2" style={{ fontFamily: "var(--font-amiri), serif" }}>
            {`۝${arabicNumeral(ayah.numberInSurah)}`}
          </span>
        </p>
      );
    }

    if (isMemorization) {
      return (
        <p className={`${arabicSize} leading-loose text-right mb-3`} dir="rtl" style={{ fontFamily: "var(--font-amiri), serif" }}>
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

    return (
      <p
        className={`${arabicSize} leading-loose text-right mb-3`}
        dir="rtl"
        style={{ fontFamily: "var(--font-amiri), serif" }}
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
      className={`group px-4 sm:px-8 py-6 border-b border-white/5 transition-all duration-300 ${
        isHighlighted ? "bg-[#57d996]/8 border-l-2 border-l-[#57d996]" : "hover:bg-white/[0.02]"
      }`}
      onClick={() => setHighlightedAyah(ayah.numberInSurah)}
    >
      <div className="max-w-3xl mx-auto">
        {/* Ayah header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-xs text-white/40 font-mono flex-shrink-0 font-bold">
              {ayah.numberInSurah}
            </div>
            <div className="text-white/20 text-[10px] uppercase tracking-widest hidden sm:block">
              Juz {ayah.juz} · Page {ayah.page}
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); handlePlay(); }}
              className="p-2 text-white/40 hover:text-[#57d996] hover:bg-[#57d996]/10 rounded-lg transition-all"
              title="Play ayah"
            >
              <Play size={14} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleBookmark(); }}
              className="p-2 text-white/40 hover:text-[#f7ca45] hover:bg-[#f7ca45]/10 rounded-lg transition-all"
              title={bookmarked ? "Remove bookmark" : "Bookmark"}
            >
              {bookmarked ? <BookmarkCheck size={14} className="text-[#f7ca45]" /> : <Bookmark size={14} />}
            </button>
          </div>
        </div>

        {renderArabic()}

        {settings.showTransliteration && ayah.transliteration && (
          <p className="text-white/40 text-sm italic mb-2 text-right">{ayah.transliteration}</p>
        )}

        {settings.showTranslation && ayah.translation && (
          <p className="text-white/60 text-sm leading-relaxed border-t border-white/5 pt-3">
            <span className="text-white/20 text-xs mr-1">({ayah.numberInSurah})</span>
            {ayah.translation}
          </p>
        )}
      </div>
    </div>
  );
}

function arabicNumeral(n: number): string {
  return n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
}
