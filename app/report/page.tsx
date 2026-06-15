"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import {
  buildSnapshot, decodeSnapshot, shareUrl, type ProgressSnapshot,
} from "../services/reportService";
import {
  Flame, Zap, Trophy, Target, Star, Award, Share2, Printer, Check, Copy, Mic, ArrowLeft,
} from "lucide-react";

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050907]" />}>
      <ReportInner />
    </Suspense>
  );
}

function ReportInner() {
  const params = useSearchParams();
  const { user } = useAuth();
  const [snap, setSnap] = useState<ProgressSnapshot | null>(null);
  const [shared, setShared] = useState(false);   // viewing someone else's shared report
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const d = params.get("d");
    if (d) {
      const s = decodeSnapshot(d);
      if (s) { setSnap(s); setShared(true); return; }
    }
    setName(user?.name ?? "");
  }, [params, user]);

  const generate = () => setSnap(buildSnapshot(name || user?.name || "Student"));

  const copyLink = async () => {
    if (!snap) return;
    try { await navigator.clipboard.writeText(shareUrl(snap)); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  return (
    <div className="min-h-screen bg-[#050907] text-white print:bg-white print:text-black">
      <div className="print:hidden"><Navbar /></div>

      <div className="max-w-2xl mx-auto px-4 pt-24 pb-20 print:pt-8">

        {/* Controls (hidden in print) */}
        {!shared && (
          <div className="print:hidden mb-6">
            <p className="text-[#57d996] text-[11px] font-bold tracking-widest uppercase mb-1">Parent / Teacher Report</p>
            <h1 className="text-3xl font-black">Progress Report</h1>
            <p className="text-white/40 text-sm mt-1">
              Generate a clean snapshot of your Hifz progress to share with a parent or teacher, or print it out.
            </p>
            {!snap && (
              <div className="mt-5 bg-white/5 border border-white/8 rounded-2xl p-5">
                <label className="text-white/50 text-xs">Student name</label>
                <input
                  value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#57d996]/50"
                />
                <button onClick={generate} className="mt-3 w-full bg-[#57d996] text-black font-black py-3 rounded-full text-sm hover:bg-[#6ff2a8] transition-all">
                  Generate report
                </button>
              </div>
            )}
          </div>
        )}

        {shared && (
          <div className="print:hidden mb-4">
            <Link href="/" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-sm"><ArrowLeft size={14} /> Noor-ul-Quran</Link>
          </div>
        )}

        {snap && (
          <>
            {/* Action bar */}
            {!shared && (
              <div className="print:hidden flex gap-2 mb-5">
                <button onClick={copyLink} className="flex items-center gap-2 bg-white/8 border border-white/10 hover:bg-white/12 px-4 py-2.5 rounded-full text-sm font-bold transition-all">
                  {copied ? <><Check size={14} className="text-[#57d996]" /> Link copied</> : <><Share2 size={14} /> Copy share link</>}
                </button>
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-white/8 border border-white/10 hover:bg-white/12 px-4 py-2.5 rounded-full text-sm font-bold transition-all">
                  <Printer size={14} /> Print / PDF
                </button>
              </div>
            )}

            <ReportCard snap={snap} />

            {shared && (
              <div className="print:hidden mt-6 text-center">
                <p className="text-white/40 text-sm mb-3">Want a personal AI Hifz teacher too?</p>
                <Link href="/signup" className="inline-flex items-center gap-2 bg-[#57d996] text-black font-black px-6 py-3 rounded-full text-sm hover:bg-[#6ff2a8] transition-all">
                  <Mic size={15} /> Start free
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ReportCard({ snap }: { snap: ProgressSnapshot }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden print:border print:border-gray-300 print:rounded-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#57d996]/15 to-[#18c8d8]/10 p-6 border-b border-white/10 print:bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#57d996] text-[10px] font-bold uppercase tracking-widest print:text-green-700">Noor-ul-Quran · Hifz Progress</p>
            <h2 className="text-2xl font-black print:text-black">{snap.name}</h2>
            <p className="text-white/40 text-xs print:text-gray-500">
              Level {snap.level} · {snap.levelTitle} · {new Date(snap.generatedAt).toLocaleDateString()}
            </p>
          </div>
          <Award size={40} className="text-[#f7ca45]" />
        </div>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 print:grid-cols-4">
        <Stat icon={<Flame size={16} className="text-orange-400" />} value={`${snap.currentStreak}`} label="Day streak" />
        <Stat icon={<Target size={16} className="text-blue-400" />} value={`${snap.avgAccuracy}%`} label="Avg accuracy" />
        <Stat icon={<Zap size={16} className="text-[#57d996]" />} value={`${snap.totalSessions}`} label="Sessions" />
        <Stat icon={<Trophy size={16} className="text-[#f7ca45]" />} value={`${snap.achievements}`} label="Achievements" />
      </div>

      {/* Goal */}
      {snap.goal && (
        <div className="px-6 py-4 border-t border-white/10 print:border-gray-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-white/60 text-sm font-bold print:text-gray-700">Current goal: {snap.goal.title}</span>
            <span className="text-[#57d996] font-black print:text-green-700">{snap.goal.percent}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden print:bg-gray-200">
            <div className="h-full bg-[#57d996] rounded-full" style={{ width: `${snap.goal.percent}%` }} />
          </div>
          <p className={`text-xs mt-1 ${snap.goal.onTrack ? "text-green-400 print:text-green-700" : "text-yellow-400 print:text-yellow-700"}`}>
            {snap.goal.onTrack ? "✓ On track to finish on time" : "⚠ Slightly behind — a little more daily practice will help"}
          </p>
        </div>
      )}

      {/* Highlights + focus */}
      <div className="grid sm:grid-cols-2 print:grid-cols-2 border-t border-white/10 print:border-gray-200">
        <div className="p-6 sm:border-r border-white/10 print:border-gray-200">
          <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2 print:text-gray-600">Highlights</p>
          <ul className="space-y-1.5 text-sm">
            <li className="flex items-center gap-2 text-white/65 print:text-gray-700"><Star size={12} className="text-[#57d996]" /> {snap.perfectSessions} perfect recitations</li>
            <li className="flex items-center gap-2 text-white/65 print:text-gray-700"><Flame size={12} className="text-orange-400" /> Longest streak: {snap.longestStreak} days</li>
            <li className="flex items-center gap-2 text-white/65 print:text-gray-700"><Zap size={12} className="text-[#57d996]" /> {snap.totalXp.toLocaleString()} XP earned</li>
          </ul>
        </div>
        <div className="p-6">
          <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2 print:text-gray-600">Needs review</p>
          {snap.weakSpots.length > 0 ? (
            <ul className="space-y-1.5 text-sm">
              {snap.weakSpots.map((w, i) => (
                <li key={i} className="flex items-center justify-between text-white/65 print:text-gray-700">
                  <span>{w.surahName}</span>
                  <span className={w.retention < 40 ? "text-red-400 print:text-red-700" : "text-yellow-400 print:text-yellow-700"}>{w.retention}% retained</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white/40 text-sm print:text-gray-500">No weak spots — strong retention across the board. 🎉</p>
          )}
        </div>
      </div>

      <div className="px-6 py-3 border-t border-white/10 text-center print:border-gray-200">
        <p className="text-white/25 text-[10px] print:text-gray-400">Generated by Noor-ul-Quran — Your Personal AI Hifz Teacher</p>
      </div>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center py-5 border-r border-b border-white/5 last:border-r-0 print:border-gray-200">
      <div className="mb-1">{icon}</div>
      <span className="text-white font-black text-xl print:text-black">{value}</span>
      <span className="text-white/35 text-[10px] print:text-gray-500">{label}</span>
    </div>
  );
}
