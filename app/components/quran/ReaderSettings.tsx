"use client";
import { X, Volume2, Type, AlignLeft, BookOpen } from "lucide-react";
import { useQuranReader } from "../../context/QuranReaderContext";
import { RECITERS } from "../../services/audioService";
import type { RepeatMode } from "../../types/quran";
import { usePremium } from "../../context/PremiumContext";

const FONT_LABELS = ["XS", "S", "M", "L", "XL"];
const REPEAT_OPTIONS: { value: RepeatMode; label: string }[] = [
  { value: "off", label: "Off" },
  { value: "verse", label: "Verse" },
  { value: "range", label: "Range" },
  { value: "memorization", label: "Memorization" },
];

interface Props {
  surahNumber: number;
  onClose: () => void;
}

export default function ReaderSettings({ surahNumber, onClose }: Props) {
  const { settings, updateSettings } = useQuranReader();
  const { isFeatureAllowed } = usePremium();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#0d1a12] border border-white/10 rounded-t-3xl sm:rounded-3xl w-full max-w-md mx-0 sm:mx-4 p-6 space-y-6 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-white font-black text-lg">Reader Settings</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Text size */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Type size={14} className="text-white/40" />
            <span className="text-white/60 text-xs font-bold uppercase tracking-wider">Font Size</span>
          </div>
          <div className="flex gap-2">
            {([1, 2, 3, 4, 5] as const).map((n, i) => (
              <button
                key={n}
                onClick={() => updateSettings({ fontSize: n })}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  settings.fontSize === n
                    ? "bg-[#57d996] text-black"
                    : "bg-white/5 text-white/40 hover:bg-white/10"
                }`}
              >
                {FONT_LABELS[i]}
              </button>
            ))}
          </div>
        </div>

        {/* Display toggles */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlignLeft size={14} className="text-white/40" />
            <span className="text-white/60 text-xs font-bold uppercase tracking-wider">Display</span>
          </div>
          <div className="space-y-2">
            {[
              { key: "showArabic" as const, label: "Arabic Text" },
              { key: "showTransliteration" as const, label: "Transliteration" },
              { key: "showTranslation" as const, label: "Translation" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => updateSettings({ [key]: !settings[key] })}
                className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 px-4 py-3 rounded-xl transition-all"
              >
                <span className="text-white/70 text-sm">{label}</span>
                <div className={`w-10 h-5 rounded-full transition-all relative ${settings[key] ? "bg-[#57d996]" : "bg-white/20"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${settings[key] ? "left-5" : "left-0.5"}`} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Reciter */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Volume2 size={14} className="text-white/40" />
            <span className="text-white/60 text-xs font-bold uppercase tracking-wider">Reciter</span>
          </div>
          <div className="space-y-1.5">
            {RECITERS.map((r) => (
              <button
                key={r.id}
                onClick={() => updateSettings({ reciterId: r.id })}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  settings.reciterId === r.id
                    ? "bg-[#57d996]/15 border border-[#57d996]/30"
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${settings.reciterId === r.id ? "bg-[#57d996]" : "bg-white/20"}`} />
                <div>
                  <div className={`text-sm font-bold ${settings.reciterId === r.id ? "text-[#57d996]" : "text-white/70"}`}>
                    {r.name}
                  </div>
                  <div className="text-white/30 text-[10px]">{r.arabicName}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Repeat mode */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={14} className="text-white/40" />
            <span className="text-white/60 text-xs font-bold uppercase tracking-wider">Repeat Mode</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {REPEAT_OPTIONS.map((opt) => {
              const locked =
                (opt.value === "verse" || opt.value === "range" || opt.value === "memorization") &&
                !isFeatureAllowed("audio-repeat", surahNumber);
              return (
                <button
                  key={opt.value}
                  disabled={locked}
                  onClick={() => !locked && updateSettings({ repeatMode: opt.value })}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                    settings.repeatMode === opt.value
                      ? "bg-[#57d996] text-black"
                      : locked
                      ? "bg-white/5 text-white/20 cursor-not-allowed"
                      : "bg-white/5 text-white/40 hover:bg-white/10"
                  }`}
                >
                  {opt.label}
                  {locked && <span className="ml-1 text-[9px]">🔒</span>}
                </button>
              );
            })}
          </div>

          {settings.repeatMode !== "off" && (
            <div className="mt-3 flex items-center gap-3">
              <span className="text-white/40 text-xs">Repeat count</span>
              <div className="flex gap-1 ml-auto">
                {[2, 3, 5, 7, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => updateSettings({ repeatCount: n })}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      settings.repeatCount === n
                        ? "bg-[#57d996] text-black"
                        : "bg-white/5 text-white/40 hover:bg-white/10"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
