"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, SkipForward, Star, Zap, Trophy, RotateCcw, ChevronRight, Flame } from "lucide-react";
import { recordSession, coachComment, xpForNextLevel, levelTitle, ACHIEVEMENTS } from "../../services/gamificationService";
import type { SessionResult } from "../../services/gamificationService";

interface Props {
  surahNumber: number;
  surahName: string;
  correct: number;
  incorrect: number;
  skipped: number;
  accuracy: number;
  ayahsRecited: number;
  onReset: () => void;
  onClose: () => void;
}

export default function RecitationSummary({
  surahNumber, surahName, correct, incorrect, skipped, accuracy, ayahsRecited, onReset, onClose,
}: Props) {
  const [result, setResult] = useState<SessionResult | null>(null);
  const [showAch, setShowAch] = useState(false);

  useEffect(() => {
    const r = recordSession({ surah: surahNumber, ayahsRecited, correct, incorrect, skipped, accuracy });
    setResult(r);
    if (r.newAchievements.length > 0) setTimeout(() => setShowAch(true), 800);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const comment = coachComment(accuracy, result?.state.currentStreak ?? 0);
  const lvlInfo = result ? xpForNextLevel(result.state.totalXp) : null;
  const streak = result?.state.currentStreak ?? 0;

  const accuracyColor =
    accuracy >= 90 ? "text-green-400" :
    accuracy >= 70 ? "text-yellow-400" :
    accuracy >= 50 ? "text-orange-400" :
    "text-red-400";

  const accuracyBg =
    accuracy >= 90 ? "from-green-500/20 to-transparent" :
    accuracy >= 70 ? "from-yellow-500/20 to-transparent" :
    accuracy >= 50 ? "from-orange-500/20 to-transparent" :
    "from-red-500/20 to-transparent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0a1510] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">

        {/* Accuracy hero */}
        <div className={`relative bg-gradient-to-b ${accuracyBg} px-6 pt-8 pb-6 text-center border-b border-white/5`}>
          <p className="text-white/40 text-xs uppercase tracking-widest mb-1">{surahName}</p>
          <div className={`text-7xl font-black ${accuracyColor} mb-1`}>{accuracy}%</div>
          <p className="text-white/50 text-sm">Recitation Accuracy</p>

          {/* Streak badge */}
          {streak > 0 && (
            <div className="inline-flex items-center gap-1.5 mt-3 bg-orange-500/15 border border-orange-500/30 rounded-full px-3 py-1">
              <Flame size={13} className="text-orange-400" />
              <span className="text-orange-300 text-xs font-bold">{streak}-day streak</span>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 border-b border-white/5">
          <div className="flex flex-col items-center py-4 border-r border-white/5">
            <CheckCircle2 size={18} className="text-green-400 mb-1" />
            <span className="text-white font-black text-xl">{correct}</span>
            <span className="text-white/35 text-[10px]">Correct</span>
          </div>
          <div className="flex flex-col items-center py-4 border-r border-white/5">
            <XCircle size={18} className="text-red-400 mb-1" />
            <span className="text-white font-black text-xl">{incorrect}</span>
            <span className="text-white/35 text-[10px]">Missed</span>
          </div>
          <div className="flex flex-col items-center py-4">
            <SkipForward size={18} className="text-yellow-400 mb-1" />
            <span className="text-white font-black text-xl">{skipped}</span>
            <span className="text-white/35 text-[10px]">Skipped</span>
          </div>
        </div>

        {/* XP earned + level */}
        {result && lvlInfo && (
          <div className="px-6 py-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap size={15} className="text-[#57d996]" />
                <span className="text-white/70 text-sm">+{result.xpEarned} XP earned</span>
                {result.streakBonus && (
                  <span className="text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full px-2 py-0.5">streak bonus</span>
                )}
              </div>
              <span className="text-white/40 text-xs">Lv.{lvlInfo.level} {levelTitle(lvlInfo.level)}</span>
            </div>
            {/* XP progress bar */}
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#57d996] to-[#18c8d8] rounded-full transition-all duration-1000"
                style={{ width: `${lvlInfo.progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-white/25 text-[10px]">{lvlInfo.currentLevelXp} XP</span>
              <span className="text-white/25 text-[10px]">{lvlInfo.neededXp} XP to Lv.{lvlInfo.level + 1}</span>
            </div>
          </div>
        )}

        {/* AI Coach comment */}
        <div className="px-6 py-4 border-b border-white/5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#57d996]/15 border border-[#57d996]/25 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Star size={14} className="text-[#57d996]" />
            </div>
            <div>
              <p className="text-[11px] text-[#57d996]/80 font-bold mb-0.5 uppercase tracking-widest">AI Coach</p>
              <p className="text-white/65 text-sm leading-relaxed">{comment}</p>
            </div>
          </div>
        </div>

        {/* New achievements */}
        {showAch && result && result.newAchievements.length > 0 && (
          <div className="px-6 py-3 border-b border-white/5 bg-[#f7ca45]/5">
            {result.newAchievements.map(ach => (
              <div key={ach.id} className="flex items-center gap-3">
                <span className="text-2xl">{ach.icon}</span>
                <div>
                  <p className="text-[#f7ca45] text-xs font-black flex items-center gap-1">
                    <Trophy size={11} /> Achievement Unlocked
                  </p>
                  <p className="text-white text-sm font-bold">{ach.title}</p>
                  <p className="text-white/40 text-[11px]">{ach.desc}</p>
                </div>
                {ach.xp > 0 && (
                  <span className="ml-auto text-[#57d996] text-xs font-bold">+{ach.xp} XP</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Level up */}
        {result?.levelUp && (
          <div className="px-6 py-3 border-b border-white/5 bg-[#57d996]/5 text-center">
            <p className="text-[#57d996] font-black text-sm">
              🎉 Level Up! You&apos;re now Level {result.newLevel} — {levelTitle(result.newLevel)}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="px-6 py-4 flex gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-2 flex-1 justify-center bg-white/8 hover:bg-white/12 border border-white/10 text-white/70 font-bold py-3 rounded-2xl text-sm transition-all"
          >
            <RotateCcw size={14} /> Try Again
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 flex-1 justify-center bg-[#57d996] hover:bg-[#6ff2a8] text-black font-black py-3 rounded-2xl text-sm transition-all"
          >
            Continue <ChevronRight size={15} />
          </button>
        </div>

      </div>
    </div>
  );
}
