"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import {
  GOAL_TEMPLATES, createGoal, getGoal, clearGoal, goalProgress, fmtDate,
  type GoalTemplate, type ActiveGoal, type GoalProgress,
} from "../services/goalService";
import { Target, Calendar, TrendingUp, CheckCircle2, AlertTriangle, Mic, ArrowRight, RotateCcw, Sparkles } from "lucide-react";

export default function GoalsPage() {
  const [goal, setGoal] = useState<ActiveGoal | null>(null);
  const [progress, setProgress] = useState<GoalProgress | null>(null);
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const g = getGoal();
    setGoal(g);
    if (g) setProgress(goalProgress(g));
  }, []);

  const start = (t: GoalTemplate) => {
    const g = createGoal(t, days ?? undefined);
    setGoal(g);
    setProgress(goalProgress(g));
  };

  const reset = () => { clearGoal(); setGoal(null); setProgress(null); setDays(null); };

  return (
    <div className="min-h-screen bg-[#050907] text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-20">

        <div className="mb-8">
          <p className="text-[#57d996] text-[11px] font-bold tracking-widest uppercase mb-1">Smart Goals</p>
          <h1 className="text-3xl font-black">Your Hifz Goal</h1>
          <p className="text-white/40 text-sm mt-1">
            Pick a target and Noor-ul-Quran builds a daily plan — then forecasts your finish date from your real pace.
          </p>
        </div>

        {goal && progress ? (
          <GoalDashboard goal={goal} progress={progress} onReset={reset} />
        ) : (
          <>
            {/* Optional custom timeframe */}
            <div className="mb-5 bg-white/5 border border-white/8 rounded-2xl p-4 flex items-center gap-3 flex-wrap">
              <Sparkles size={16} className="text-[#57d996]" />
              <span className="text-white/60 text-sm">Custom timeframe (optional):</span>
              <input
                type="number" min={1} placeholder="days"
                value={days ?? ""}
                onChange={(e) => setDays(e.target.value ? parseInt(e.target.value) : null)}
                className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#57d996]/50"
              />
              <span className="text-white/30 text-xs">Leave blank to use the suggested pace.</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {GOAL_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => start(t)}
                  className="text-left bg-white/[0.03] border border-white/8 hover:border-[#57d996]/30 rounded-2xl p-5 transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-3xl">{t.icon}</span>
                    <span className="text-[10px] text-white/30 bg-white/5 rounded-full px-2 py-1">{t.totalAyahs} ayahs</span>
                  </div>
                  <h3 className="text-white font-black">{t.title}</h3>
                  <p className="text-white/40 text-xs mt-1 leading-relaxed">{t.desc}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[#57d996] text-xs font-bold">
                      ~{Math.ceil(t.totalAyahs / (days ?? t.suggestedDays))} ayahs/day
                    </span>
                    <span className="text-white/30 text-xs flex items-center gap-1 group-hover:text-[#57d996] transition-colors">
                      Start <ArrowRight size={12} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function GoalDashboard({ goal, progress, onReset }: { goal: ActiveGoal; progress: GoalProgress; onReset: () => void }) {
  return (
    <>
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#57d996]/10 to-[#18c8d8]/8 border border-[#57d996]/20 rounded-3xl p-6 mb-5">
        <div className="flex items-start gap-4">
          <span className="text-4xl">{goal.icon}</span>
          <div className="flex-1">
            <h2 className="text-2xl font-black">{goal.title}</h2>
            <p className="text-white/45 text-sm">{goal.ayahsPerDay} ayahs/day · {goal.targetDays}-day plan</p>
          </div>
          <button onClick={onReset} title="Change goal" className="text-white/30 hover:text-white p-2"><RotateCcw size={16} /></button>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-white/60 text-sm font-bold">{progress.ayahsMemorized} / {progress.totalAyahs} ayahs</span>
            <span className="text-[#57d996] font-black">{progress.percent}%</span>
          </div>
          <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#57d996] to-[#18c8d8] rounded-full transition-all duration-700" style={{ width: `${progress.percent}%` }} />
          </div>
        </div>
      </div>

      {/* Forecast cards */}
      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        <ForecastCard
          icon={<Calendar size={16} className="text-blue-400" />}
          label="Target date"
          value={fmtDate(progress.targetDate)}
          sub={`${goal.targetDays}-day plan`}
        />
        <ForecastCard
          icon={<TrendingUp size={16} className="text-[#57d996]" />}
          label="AI forecast"
          value={progress.forecastDate ? fmtDate(progress.forecastDate) : "—"}
          sub={progress.forecastDays != null ? `${progress.forecastDays} days at your pace` : "Recite to forecast"}
        />
        <ForecastCard
          icon={progress.onTrack ? <CheckCircle2 size={16} className="text-green-400" /> : <AlertTriangle size={16} className="text-yellow-400" />}
          label="Status"
          value={progress.onTrack ? "On track" : "Behind plan"}
          sub={`${progress.pacePerDay.toFixed(1)} ayahs/day actual`}
          accent={progress.onTrack ? "green" : "yellow"}
        />
      </div>

      {/* AI coach line */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-4 mb-5 flex items-start gap-3">
        <Sparkles size={15} className="text-[#57d996] flex-shrink-0 mt-0.5" />
        <p className="text-white/60 text-sm leading-relaxed">
          {forecastMessage(progress, goal)}
        </p>
      </div>

      {/* Surahs in this goal */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-5 mb-5">
        <p className="text-white font-bold text-sm mb-3 flex items-center gap-2"><Target size={14} className="text-[#57d996]" /> Surahs in this goal</p>
        <div className="flex flex-wrap gap-2">
          {goal.surahs.map((n) => (
            <Link key={n} href={`/quran/${n}`} className="bg-white/5 hover:bg-[#57d996]/15 border border-white/10 hover:border-[#57d996]/30 rounded-lg px-3 py-1.5 text-xs font-bold transition-all">
              Surah {n}
            </Link>
          ))}
        </div>
      </div>

      {progress.percent >= 100 && (
        <Link href="/certificate" className="block mb-4 bg-gradient-to-r from-[#f7ca45]/15 to-[#f7ca45]/5 border border-[#f7ca45]/30 rounded-2xl p-4 hover:border-[#f7ca45]/50 transition-all">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div className="flex-1">
              <p className="text-[#f7ca45] font-black text-sm">Goal complete — claim your certificate!</p>
              <p className="text-white/45 text-xs">A printable, shareable certificate of achievement awaits.</p>
            </div>
            <ArrowRight size={16} className="text-[#f7ca45]" />
          </div>
        </Link>
      )}

      <Link href="/quran" className="inline-flex items-center gap-2 bg-[#57d996] text-black font-black px-6 py-3 rounded-full text-sm hover:bg-[#6ff2a8] transition-all">
        <Mic size={15} /> Continue Memorizing
      </Link>
    </>
  );
}

function ForecastCard({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string; sub: string; accent?: string }) {
  const border = accent === "green" ? "border-green-500/20 bg-green-500/5" : accent === "yellow" ? "border-yellow-500/20 bg-yellow-500/5" : "border-white/8 bg-white/4";
  return (
    <div className={`border rounded-2xl p-4 ${border}`}>
      <div className="flex items-center gap-1.5 mb-2">{icon}<span className="text-white/40 text-[11px] uppercase tracking-wider">{label}</span></div>
      <p className="text-white font-black text-lg leading-tight">{value}</p>
      <p className="text-white/35 text-[11px] mt-0.5">{sub}</p>
    </div>
  );
}

function forecastMessage(p: GoalProgress, goal: ActiveGoal): string {
  if (p.ayahsMemorized === 0) {
    return `Your plan is set: ${goal.ayahsPerDay} ayahs a day finishes ${goal.title} by ${fmtDate(p.targetDate)}. Recite your first ayah to start the forecast.`;
  }
  if (p.percent >= 100) {
    return `Masha'Allah — you've completed ${goal.title}! Set a new goal to keep your momentum going.`;
  }
  if (p.forecastDate && p.forecastDate <= p.targetDate) {
    return `At your current pace of ${p.pacePerDay.toFixed(1)} ayahs/day, you're projected to finish by ${fmtDate(p.forecastDate)} — ahead of your ${fmtDate(p.targetDate)} target. Keep it up!`;
  }
  return `You're averaging ${p.pacePerDay.toFixed(1)} ayahs/day. To hit your ${fmtDate(p.targetDate)} target, aim for ${goal.ayahsPerDay}/day — a short daily session will close the gap.`;
}
