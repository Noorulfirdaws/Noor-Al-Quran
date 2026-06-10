"use client";
import { Eye, EyeOff, RotateCcw } from "lucide-react";
import { useQuranReader } from "../../context/QuranReaderContext";

interface Props {
  totalAyahs: number;
}

export default function MemorizationPanel({ totalAyahs }: Props) {
  const { revealedWords, revealAll, hideAll, ayahsWithWords, ayahs } = useQuranReader();

  const totalWords =
    ayahsWithWords.reduce((sum, a) => sum + a.words.length, 0) ||
    ayahs.reduce((sum, a) => sum + a.text.split(/\s+/).filter(Boolean).length, 0);
  const revealedCount = revealedWords.size;
  const pct = totalWords > 0 ? Math.round((revealedCount / totalWords) * 100) : 0;

  return (
    // top-[164px] = 64px global navbar + ~100px reader nav bar
    <div className="sticky top-[164px] z-20 bg-[#050907]/95 backdrop-blur-md border-b border-white/10 px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white/40 text-xs">Revealed</span>
            <span className="text-white font-black text-sm">{revealedCount}/{totalWords}</span>
            <span className="text-[#57d996] text-xs font-bold">{pct}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden w-full">
            <div
              className="h-full bg-[#57d996] rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={revealAll}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          >
            <Eye size={12} /> Reveal all
          </button>
          <button
            onClick={hideAll}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          >
            <EyeOff size={12} /> Hide all
          </button>
          <button
            onClick={hideAll}
            className="text-white/30 hover:text-white transition-colors p-1.5"
            title="Reset"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      <p className="text-white/20 text-[10px] mt-2 max-w-3xl mx-auto">
        Tap any word to reveal it. Use &ldquo;Reveal all&rdquo; to check your memorization.
        {totalAyahs > 0 && ` ${totalAyahs} ayahs total.`}
      </p>
    </div>
  );
}
