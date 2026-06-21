"use client";
import Link from "next/link";
import { X, Check, Crown, Users, BookOpen, Sparkles } from "lucide-react";
import type { ContentTier } from "../context/PremiumContext";

// Professional upgrade modal shown when a user hits content above their plan.
// Pure UI — the actual plan activation is client-side (demo); a real build would
// route the CTA to a checkout/subscription flow.

interface Props {
  requiredTier: ContentTier;       // "premium" | "family"
  contentLabel?: string;           // e.g. "the Premium Library"
  onClose: () => void;
}

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    icon: <BookOpen size={18} className="text-white/60" />,
    accent: "border-white/12",
    features: ["Quran reading", "Al-Fatiha fully unlocked", "Basic memorization", "Basic progress tracking"],
  },
  {
    id: "premium",
    name: "Premium",
    price: "$9",
    period: "/mo",
    icon: <Crown size={18} className="text-[#f7ca45]" />,
    accent: "border-[#f7ca45]/40 bg-[#f7ca45]/[0.04]",
    highlight: true,
    features: ["Everything in Free", "Full Library + courses", "AI Teacher & tajweed", "Advanced analytics", "Premium memorization tools"],
  },
  {
    id: "family",
    name: "Family",
    price: "$19",
    period: "/mo",
    icon: <Users size={18} className="text-[#57d996]" />,
    accent: "border-[#57d996]/40 bg-[#57d996]/[0.04]",
    features: ["Everything in Premium", "Up to 6 family accounts", "Parent dashboard", "Shared family progress", "Family resources"],
  },
];

export default function UpgradeModal({ requiredTier, contentLabel, onClose }: Props) {
  const headline =
    requiredTier === "family"
      ? "This is a Family plan feature"
      : "Unlock this with Premium";
  const sub = contentLabel
    ? `${contentLabel} is available on ${requiredTier === "family" ? "the Family" : "Premium and Family"} plans.`
    : `Upgrade to ${requiredTier === "family" ? "Family" : "Premium"} to continue.`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-3xl bg-[#0a1510] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-7 pb-5 text-center border-b border-white/8 bg-gradient-to-b from-[#57d996]/8 to-transparent">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-[#f7ca45]/15 border border-[#f7ca45]/30 flex items-center justify-center mx-auto mb-3">
            <Sparkles size={22} className="text-[#f7ca45]" />
          </div>
          <h2 className="text-2xl font-black">{headline}</h2>
          <p className="text-white/50 text-sm mt-1">{sub}</p>
        </div>

        {/* Plan comparison */}
        <div className="grid sm:grid-cols-3 gap-3 p-5">
          {PLANS.map((p) => {
            const isTarget =
              (requiredTier === "premium" && p.id === "premium") ||
              (requiredTier === "family" && p.id === "family");
            return (
              <div
                key={p.id}
                className={`rounded-2xl border p-4 flex flex-col ${p.accent} ${isTarget ? "ring-2 ring-[#57d996]/50" : ""}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {p.icon}
                  <span className="font-black text-white">{p.name}</span>
                  {p.highlight && <span className="ml-auto text-[9px] font-black uppercase tracking-wider text-[#f7ca45] bg-[#f7ca45]/10 px-1.5 py-0.5 rounded-full">Popular</span>}
                </div>
                <div className="mb-3">
                  <span className="text-2xl font-black text-white">{p.price}</span>
                  {p.period && <span className="text-white/40 text-xs">{p.period}</span>}
                </div>
                <ul className="space-y-1.5 flex-1">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-white/60 text-xs">
                      <Check size={12} className="text-[#57d996] flex-shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                {p.id !== "free" && (
                  <Link
                    href="/#pricing"
                    onClick={onClose}
                    className={`mt-3 text-center font-black py-2.5 rounded-full text-sm transition-all ${
                      isTarget ? "bg-[#57d996] text-black hover:bg-[#6ff2a8]" : "bg-white/8 text-white/70 hover:bg-white/12"
                    }`}
                  >
                    Choose {p.name}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-6 pb-5 text-center">
          <p className="text-white/30 text-[11px]">
            Have a promo code?{" "}
            <Link href="/redeem" onClick={onClose} className="text-[#57d996] font-bold hover:underline">Redeem it</Link>
            {"  ·  "}
            <Link href="/quran" onClick={onClose} className="text-white/50 hover:underline">Keep reading free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
