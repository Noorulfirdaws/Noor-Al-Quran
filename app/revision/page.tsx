"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { usePremium } from "../context/PremiumContext";
import {
  getDueReviews, getUpcomingReviews, getByRisk, currentRetention,
  forgetRisk, formatDue, type RevisionCard, type RiskLevel,
} from "../services/revisionService";
import { CalendarClock, Brain, AlertTriangle, CheckCircle2, ArrowRight, Mic, Lock, TrendingDown } from "lucide-react";

export default function RevisionPage() {
  const { isPremium } = usePremium();
  const [due, setDue] = useState<RevisionCard[]>([]);
  const [upcoming, setUpcoming] = useState<RevisionCard[]>([]);
  const [risk, setRisk] = useState<{ card: RevisionCard; retention: number; risk: RiskLevel }[]>([]);

  useEffect(() => {
    setDue(getDueReviews());
    setUpcoming(getUpcomingReviews());
    setRisk(getByRisk());
  }, []);

  const isEmpty = due.length === 0 && upcoming.length === 0;

  return (
    <div className="min-h-screen bg-[#050907] text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-20">

        <div className="mb-8">
          <p className="text-[#57d996] text-[11px] font-bold tracking-widest uppercase mb-1">AI Revision Planner</p>
          <h1 className="text-3xl font-black">Smart Revision</h1>
          <p className="text-white/40 text-sm mt-1">
            Spaced-repetition scheduling so you revise each surah at the perfect moment — right before you&apos;d forget it.
          </p>
        </div>

        {!isPremium && (
          <div className="mb-6 bg-[#f7ca45]/8 border border-[#f7ca45]/20 rounded-2xl p-4 flex items-start gap-3">
            <Lock size={16} className="text-[#f7ca45] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white text-sm font-bold">Preview mode</p>
              <p className="text-white/45 text-xs mt-0.5">
                The planner tracks your reviews for free. Premium unlocks daily reminders, the full
                forgetting-curve forecast, and the AI revision calendar.{" "}
                <Link href="/#pricing" className="text-[#f7ca45] font-bold hover:underline">See plans →</Link>
              </p>
            </div>
          </div>
        )}

        {isEmpty ? (
          <EmptyState />
        ) : (
          <>
            {/* Due today */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <CalendarClock size={16} className="text-[#57d996]" />
                <h2 className="text-white font-bold">Due Today</h2>
                <span className="text-white/30 text-xs">({due.length})</span>
              </div>
              {due.length === 0 ? (
                <div className="bg-[#57d996]/5 border border-[#57d996]/15 rounded-2xl p-5 flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-[#57d996]" />
                  <p className="text-white/60 text-sm">All caught up! No reviews due today. 🎉</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {due.map((c) => <ReviewRow key={c.surah} card={c} due />)}
                </div>
              )}
            </section>

            {/* Forgetting risk forecast */}
            {risk.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown size={16} className="text-orange-400" />
                  <h2 className="text-white font-bold">Forgetting Forecast</h2>
                </div>
                <div className="bg-white/5 border border-white/8 rounded-2xl p-5 space-y-3">
                  {risk.map(({ card, retention, risk: rk }) => (
                    <div key={card.surah} className="flex items-center gap-3">
                      <div className="w-24 flex-shrink-0">
                        <p className="text-white text-xs font-bold truncate">{card.surahName}</p>
                        <RiskBadge risk={rk} />
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              retention >= 70 ? "bg-green-400" : retention >= 40 ? "bg-yellow-400" : "bg-red-400"
                            }`}
                            style={{ width: `${retention}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-white/50 text-xs font-mono w-12 text-right flex-shrink-0">{retention}%</span>
                    </div>
                  ))}
                  <p className="text-white/25 text-[10px] pt-1">
                    Retention % is estimated from the forgetting curve — time since last review, your accuracy, and repetition count.
                  </p>
                </div>
              </section>
            )}

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Brain size={16} className="text-white/50" />
                  <h2 className="text-white font-bold">Scheduled</h2>
                  <span className="text-white/30 text-xs">({upcoming.length})</span>
                </div>
                <div className="space-y-2">
                  {upcoming.map((c) => <ReviewRow key={c.surah} card={c} />)}
                </div>
              </section>
            )}
          </>
        )}

        <div className="mt-6 flex gap-3 flex-wrap">
          <Link href="/quran" className="inline-flex items-center gap-2 bg-[#57d996] text-black font-black px-6 py-3 rounded-full text-sm hover:bg-[#6ff2a8] transition-all">
            <Mic size={15} /> Recite a Surah
          </Link>
          <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white/8 border border-white/10 text-white/70 font-bold px-6 py-3 rounded-full text-sm hover:bg-white/12 transition-all">
            View Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ card, due = false }: { card: RevisionCard; due?: boolean }) {
  const retention = currentRetention(card);
  return (
    <Link
      href={`/quran/${card.surah}`}
      className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
        due ? "bg-[#57d996]/8 border-[#57d996]/20 hover:bg-[#57d996]/12" : "bg-white/4 border-white/8 hover:bg-white/8"
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 ${
        due ? "bg-[#57d996]/20 text-[#57d996]" : "bg-white/8 text-white/50"
      }`}>
        {card.surah}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-bold truncate">{card.surahName}</p>
        <p className="text-white/35 text-xs">
          {card.reps} review{card.reps !== 1 ? "s" : ""} · last {card.lastAccuracy}% · {retention}% retained
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`text-xs font-bold ${due ? "text-[#57d996]" : "text-white/50"}`}>{formatDue(card.nextReview)}</p>
        <RiskBadge risk={forgetRisk(card)} />
      </div>
      <ArrowRight size={14} className="text-white/25 flex-shrink-0" />
    </Link>
  );
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
  const cfg = {
    low:    { label: "Strong", cls: "text-green-400" },
    medium: { label: "Review soon", cls: "text-yellow-400" },
    high:   { label: "At risk", cls: "text-red-400" },
  }[risk];
  return (
    <span className={`text-[10px] font-bold flex items-center gap-0.5 ${cfg.cls}`}>
      {risk === "high" && <AlertTriangle size={9} />}
      {cfg.label}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🧠</div>
      <h2 className="text-white font-black text-xl mb-2">No reviews scheduled yet</h2>
      <p className="text-white/40 text-sm mb-6 max-w-xs mx-auto">
        Recite a surah with AI feedback and the planner will automatically schedule your reviews using spaced repetition.
      </p>
      <Link href="/quran/1?recite=1" className="inline-flex items-center gap-2 bg-[#57d996] text-black font-black px-6 py-3 rounded-full text-sm hover:bg-[#6ff2a8] transition-all">
        <Mic size={15} /> Recite Al-Fatiha
      </Link>
    </div>
  );
}
