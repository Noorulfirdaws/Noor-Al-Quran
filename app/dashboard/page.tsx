"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import {
  loadGamification, xpForNextLevel, levelTitle, ACHIEVEMENTS,
  getStruggles, type GamificationState,
} from "../services/gamificationService";
import { Flame, Zap, Trophy, Star, BookOpen, Target, TrendingUp, BarChart3, ArrowRight, Mic, Lock } from "lucide-react";

export default function DashboardPage() {
  const [state, setState] = useState<GamificationState | null>(null);

  useEffect(() => { setState(loadGamification()); }, []);

  if (!state) return <LoadingSkeleton />;

  const lvl = xpForNextLevel(state.totalXp);
  const struggles = getStruggles(5);
  const recentSessions = state.sessions.slice(0, 7);
  const avgAccuracy = recentSessions.length
    ? Math.round(recentSessions.reduce((s, x) => s + x.accuracy, 0) / recentSessions.length)
    : 0;

  const isEmpty = state.totalSessions === 0;

  return (
    <div className="min-h-screen bg-[#050907] text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-20">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[#57d996] text-[11px] font-bold tracking-widest uppercase mb-1">My Progress</p>
          <h1 className="text-3xl font-black">Hifz Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">Your personal AI memorization journey</p>
        </div>

        {isEmpty ? <EmptyState /> : (
          <>
            {/* Top stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <StatCard icon={<Flame size={18} className="text-orange-400" />} value={`${state.currentStreak}`} label="Day Streak" accent="orange" />
              <StatCard icon={<Zap size={18} className="text-[#57d996]" />} value={`${state.totalXp.toLocaleString()}`} label="Total XP" accent="green" />
              <StatCard icon={<Target size={18} className="text-blue-400" />} value={`${avgAccuracy}%`} label="Avg Accuracy" accent="blue" />
              <StatCard icon={<BookOpen size={18} className="text-purple-400" />} value={`${state.totalSessions}`} label="Sessions" accent="purple" />
            </div>

            {/* Level progress */}
            <div className="bg-white/5 border border-white/8 rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white font-black text-lg">Level {lvl.level} — {levelTitle(lvl.level)}</p>
                  <p className="text-white/40 text-xs">{lvl.currentLevelXp} / {lvl.neededXp} XP to Level {lvl.level + 1}</p>
                </div>
                <div className="text-4xl font-black text-[#57d996]">{lvl.level}</div>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#57d996] to-[#18c8d8] rounded-full transition-all duration-700"
                  style={{ width: `${lvl.progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-white/25 text-[10px]">Lv.{lvl.level}</span>
                <span className="text-[#57d996] text-[10px] font-bold">{lvl.progress}% to next level</span>
                <span className="text-white/25 text-[10px]">Lv.{lvl.level + 1}</span>
              </div>
            </div>

            {/* Accuracy trend + Streak calendar */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <AccuracyChart sessions={recentSessions} />
              <StreakCalendar sessions={state.sessions} streak={state.currentStreak} />
            </div>

            {/* Struggles */}
            {struggles.length > 0 && (
              <div className="bg-white/5 border border-white/8 rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center">
                    <Target size={14} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Needs Attention</p>
                    <p className="text-white/35 text-xs">Ayahs you&apos;ve struggled with most</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {struggles.map((s, i) => (
                    <Link
                      key={i}
                      href={`/quran/${s.surah}?ayah=${s.ayah}`}
                      className="flex items-center gap-3 p-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/15 rounded-xl transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 text-xs font-black flex-shrink-0">
                        {s.mistakes}x
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-bold">{s.surahName} — Ayah {s.ayah}</p>
                        <p className="text-red-400/70 text-xs">Missed {s.mistakes} times — review recommended</p>
                      </div>
                      <ArrowRight size={13} className="text-white/25 flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            <AchievementsGrid unlocked={state.unlockedAchievements} />

            {/* Recent sessions */}
            {recentSessions.length > 0 && (
              <div className="bg-white/5 border border-white/8 rounded-2xl p-5 mt-6">
                <p className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                  <BarChart3 size={15} className="text-[#57d996]" /> Recent Sessions
                </p>
                <div className="space-y-2">
                  {recentSessions.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                      <div className="text-white/25 text-[10px] w-20 flex-shrink-0">{s.date}</div>
                      <div className="text-white/60 text-xs flex-shrink-0">Surah {s.surah}</div>
                      <div className="flex-1">
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${s.accuracy >= 80 ? "bg-green-400" : s.accuracy >= 60 ? "bg-yellow-400" : "bg-red-400"}`}
                            style={{ width: `${s.accuracy}%` }}
                          />
                        </div>
                      </div>
                      <div className={`text-xs font-bold w-10 text-right flex-shrink-0 ${s.accuracy >= 80 ? "text-green-400" : s.accuracy >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                        {s.accuracy}%
                      </div>
                      <div className="text-[#57d996] text-[10px] w-12 text-right flex-shrink-0">+{s.xpEarned} XP</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <div className="mt-8 flex gap-3 flex-wrap">
          <Link href="/quran/1" className="inline-flex items-center gap-2 bg-[#57d996] text-black font-black px-6 py-3 rounded-full text-sm hover:bg-[#6ff2a8] transition-all">
            <Mic size={15} /> Start Reciting
          </Link>
          <Link href="/quran" className="inline-flex items-center gap-2 bg-white/8 border border-white/10 text-white/70 font-bold px-6 py-3 rounded-full text-sm hover:bg-white/12 transition-all">
            <BookOpen size={15} /> Browse Surahs
          </Link>
        </div>

      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, value, label, accent }: { icon: React.ReactNode; value: string; label: string; accent: string }) {
  const bg = accent === "orange" ? "bg-orange-500/10 border-orange-500/20" :
             accent === "green"  ? "bg-[#57d996]/10 border-[#57d996]/20" :
             accent === "blue"   ? "bg-blue-500/10 border-blue-500/20" :
             "bg-purple-500/10 border-purple-500/20";
  return (
    <div className={`${bg} border rounded-2xl p-4`}>
      <div className="mb-2">{icon}</div>
      <div className="text-white font-black text-2xl">{value}</div>
      <div className="text-white/40 text-xs mt-0.5">{label}</div>
    </div>
  );
}

function AccuracyChart({ sessions }: { sessions: ReturnType<typeof loadGamification>["sessions"] }) {
  const max = 100;
  const h = 80;
  const pts = sessions.slice().reverse();

  if (pts.length === 0) return (
    <div className="bg-white/5 border border-white/8 rounded-2xl p-5 flex items-center justify-center">
      <p className="text-white/25 text-sm">No sessions yet</p>
    </div>
  );

  const w = 240;
  const step = pts.length > 1 ? w / (pts.length - 1) : w;
  const points = pts.map((s, i) => `${i * step},${h - (s.accuracy / max) * h}`).join(" ");

  return (
    <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={14} className="text-[#57d996]" />
        <p className="text-white font-bold text-sm">Accuracy Trend</p>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20" preserveAspectRatio="none">
        <defs>
          <linearGradient id="acc-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#57d996" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#57d996" stopOpacity="0" />
          </linearGradient>
        </defs>
        {pts.length > 1 && (
          <polygon
            points={`0,${h} ${points} ${(pts.length - 1) * step},${h}`}
            fill="url(#acc-grad)"
          />
        )}
        {pts.length > 1 && (
          <polyline points={points} fill="none" stroke="#57d996" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {pts.map((s, i) => (
          <circle key={i} cx={i * step} cy={h - (s.accuracy / max) * h} r="3" fill="#57d996" />
        ))}
      </svg>
      <div className="flex justify-between mt-2">
        {pts.map((s, i) => (
          <span key={i} className="text-[9px] text-white/25">{s.accuracy}%</span>
        ))}
      </div>
    </div>
  );
}

function StreakCalendar({ sessions, streak }: { sessions: ReturnType<typeof loadGamification>["sessions"]; streak: number }) {
  // Build last 28 days
  const days: { date: string; practiced: boolean; accuracy: number }[] = [];
  const dateSet = new Map<string, number>();
  for (const s of sessions) {
    const prev = dateSet.get(s.date) ?? 0;
    dateSet.set(s.date, Math.max(prev, s.accuracy));
  }
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const acc = dateSet.get(iso);
    days.push({ date: iso, practiced: acc !== undefined, accuracy: acc ?? 0 });
  }

  return (
    <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Flame size={14} className="text-orange-400" />
        <p className="text-white font-bold text-sm">Practice Calendar</p>
        <span className="ml-auto text-orange-400 text-xs font-bold">{streak} day streak</span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <div key={i} className="text-center text-[9px] text-white/20 pb-1">{d}</div>
        ))}
        {days.map((day, i) => {
          const color = !day.practiced ? "bg-white/5" :
            day.accuracy >= 90 ? "bg-green-500" :
            day.accuracy >= 70 ? "bg-yellow-500" :
            day.accuracy >= 50 ? "bg-orange-500" : "bg-red-500";
          return (
            <div
              key={i}
              title={day.practiced ? `${day.date}: ${day.accuracy}%` : day.date}
              className={`aspect-square rounded-sm ${color} transition-all`}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-3 justify-end">
        <span className="flex items-center gap-1 text-[9px] text-white/30"><span className="w-2 h-2 rounded-sm bg-white/10 inline-block" /> None</span>
        <span className="flex items-center gap-1 text-[9px] text-white/30"><span className="w-2 h-2 rounded-sm bg-orange-500 inline-block" /> 50%+</span>
        <span className="flex items-center gap-1 text-[9px] text-white/30"><span className="w-2 h-2 rounded-sm bg-green-500 inline-block" /> 90%+</span>
      </div>
    </div>
  );
}

function AchievementsGrid({ unlocked }: { unlocked: string[] }) {
  const all = Object.values(ACHIEVEMENTS);
  return (
    <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={14} className="text-[#f7ca45]" />
        <p className="text-white font-bold text-sm">Achievements</p>
        <span className="ml-auto text-white/30 text-xs">{unlocked.length}/{all.length}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {all.map(ach => {
          const earned = unlocked.includes(ach.id);
          return (
            <div key={ach.id} className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all ${
              earned ? "bg-[#f7ca45]/8 border-[#f7ca45]/20" : "bg-white/3 border-white/5 opacity-50"
            }`}>
              <span className={`text-xl ${earned ? "" : "grayscale"}`}>{ach.icon}</span>
              <div className="min-w-0">
                <p className={`text-xs font-bold truncate ${earned ? "text-white" : "text-white/40"}`}>{ach.title}</p>
                <p className="text-[10px] text-white/25 truncate">{ach.desc}</p>
                {!earned && <Lock size={9} className="text-white/20 mt-0.5" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🎤</div>
      <h2 className="text-white font-black text-xl mb-2">Your journey starts here</h2>
      <p className="text-white/40 text-sm mb-6 max-w-xs mx-auto">
        Complete your first AI-checked recitation to see your progress, earn XP, and unlock achievements.
      </p>
      <Link href="/quran/1" className="inline-flex items-center gap-2 bg-[#57d996] text-black font-black px-6 py-3 rounded-full text-sm hover:bg-[#6ff2a8] transition-all">
        <Mic size={15} /> Start with Al-Fatiha
      </Link>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#050907]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-20 space-y-4 animate-pulse">
        <div className="h-8 bg-white/5 rounded w-48" />
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-2xl" />)}
        </div>
        <div className="h-32 bg-white/5 rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-40 bg-white/5 rounded-2xl" />
          <div className="h-40 bg-white/5 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
