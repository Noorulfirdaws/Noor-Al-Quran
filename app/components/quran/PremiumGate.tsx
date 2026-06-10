"use client";
import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import type { PremiumFeature } from "../../types/quran";

const FEATURE_LABELS: Record<PremiumFeature, string> = {
  "word-by-word": "Word-by-Word Learning",
  "memorization": "Memorization Mode",
  "audio-repeat": "Verse Repeat",
  "audio-range": "Range Repeat",
  "analytics": "Learning Analytics",
};

interface Props {
  feature: PremiumFeature;
  compact?: boolean;
}

export default function PremiumGate({ feature, compact = false }: Props) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-[#f7ca45]/10 border border-[#f7ca45]/30 rounded-xl px-4 py-2.5">
        <Lock size={14} className="text-[#f7ca45] flex-shrink-0" />
        <span className="text-[#f7ca45] text-xs font-bold">Premium — </span>
        <span className="text-white/50 text-xs">{FEATURE_LABELS[feature]}</span>
        <Link
          href="/#pricing"
          className="ml-auto text-[10px] font-black bg-[#f7ca45] text-black px-2.5 py-1 rounded-full hover:bg-yellow-300 transition-colors"
        >
          Upgrade
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-[#f7ca45]/10 border-2 border-[#f7ca45]/30 flex items-center justify-center">
        <Lock size={32} className="text-[#f7ca45]" />
      </div>
      <div>
        <h3 className="text-white font-black text-xl mb-2">
          {FEATURE_LABELS[feature]}
        </h3>
        <p className="text-white/40 text-sm max-w-xs">
          This feature is available for all 114 surahs with a Premium subscription.
          Surah Al-Fatiha is fully free.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/#pricing"
          className="flex items-center gap-2 bg-[#57d996] hover:bg-[#6ff2a8] text-black font-black px-6 py-3 rounded-full text-sm transition-all active:scale-95"
        >
          <Sparkles size={14} /> Unlock Premium
        </Link>
        <Link
          href="/admin"
          className="text-white/30 text-xs hover:text-white/60 flex items-center gap-1 transition-colors"
        >
          Admin preview →
        </Link>
      </div>
    </div>
  );
}
