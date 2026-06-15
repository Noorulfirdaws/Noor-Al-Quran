"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, SkipForward, Star, Zap, Trophy, RotateCcw, ChevronRight, Flame, Sparkles, Loader2, Lock } from "lucide-react";
import { recordSession, coachComment, xpForNextLevel, levelTitle, ACHIEVEMENTS } from "../../services/gamificationService";
import type { SessionResult } from "../../services/gamificationService";
import { reviewSurah } from "../../services/revisionService";
import { usePremium } from "../../context/PremiumContext";
import { canScore, consumeQuota, quotaRemaining, quotaLimit } from "../../services/quotaService";
import { scoreRecitation, type ScoreResult } from "../../services/aiScoringService";
import { listRecordings, getRecording } from "../../services/recordingService";

interface Props {
  surahNumber: number;
  surahName: string;
  correct: number;
  incorrect: number;
  skipped: number;
  accuracy: number;
  ayahsRecited: number;
  expectedText?: string; // expected ayah text(s) for hosted AI tajweed scoring
  onReset: () => void;
  onClose: () => void;
}

export default function RecitationSummary({
  surahNumber, surahName, correct, incorrect, skipped, accuracy, ayahsRecited, expectedText = "", onReset, onClose,
}: Props) {
  const { isPremium } = usePremium();
  const [result, setResult] = useState<SessionResult | null>(null);
  const [showAch, setShowAch] = useState(false);

  // Hosted AI tajweed feedback (on-demand — only spends when the user clicks).
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<ScoreResult | null>(null);
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    const r = recordSession({ surah: surahNumber, ayahsRecited, correct, incorrect, skipped, accuracy });
    reviewSurah(surahNumber, surahName, accuracy); // schedule next spaced-repetition review
    setResult(r);
    setRemaining(quotaRemaining(isPremium));
    if (r.newAchievements.length > 0) setTimeout(() => setShowAch(true), 800);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getAiFeedback = async () => {
    if (!canScore(isPremium)) { setRemaining(0); return; }
    setAiLoading(true);
    try {
      // Use the most recent recording for this surah as the audio source.
      const all = await listRecordings();
      const latest = all.find((r) => r.surah === surahNumber) ?? all[0];
      if (!latest) { setAiResult({ configured: false, message: "No recording found for this session." }); return; }
      const full = await getRecording(latest.id);
      if (!full) { setAiResult({ configured: false, message: "Recording unavailable." }); return; }
      const res = await scoreRecitation(full.blob, expectedText, surahNumber, 1);
      // Only consume a quota unit when the API actually did paid work.
      if (res.configured && res.transcript !== undefined) {
        consumeQuota(isPremium);
        setRemaining(quotaRemaining(isPremium));
      }
      setAiResult(res);
    } catch {
      setAiResult({ configured: false, error: "Could not reach the scoring service." });
    } finally {
      setAiLoading(false);
    }
  };

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

        {/* Hosted AI Tajweed Feedback (on-demand, quota-limited) */}
        <div className="px-6 py-4 border-b border-white/5">
          {!aiResult && (
            <button
              onClick={getAiFeedback}
              disabled={aiLoading || remaining <= 0}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#18c8d8]/15 to-[#57d996]/15 border border-[#18c8d8]/30 hover:border-[#18c8d8]/50 text-white font-bold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50"
            >
              {aiLoading ? (
                <><Loader2 size={15} className="animate-spin" /> Analyzing your recitation…</>
              ) : remaining <= 0 ? (
                <><Lock size={14} /> Monthly AI feedback used up</>
              ) : (
                <><Sparkles size={15} className="text-[#18c8d8]" /> Verify with AI (accuracy + tajweed)</>
              )}
            </button>
          )}
          {!aiResult && remaining > 0 && (
            <p className="text-white/30 text-[10px] text-center mt-1.5">
              {remaining} of {quotaLimit(isPremium)} AI analyses left this month{!isPremium && " · Premium gets 50"}
            </p>
          )}

          {/* AI result */}
          {aiResult?.configured && (aiResult.feedback || aiResult.tajweedNotes?.length || aiResult.words?.length) ? (
            <div className="bg-[#18c8d8]/8 border border-[#18c8d8]/20 rounded-xl p-3 mt-1">
              {/* Authoritative server accuracy (real Whisper ASR + NW alignment) */}
              {typeof aiResult.accuracy === "number" && (
                <div className="mb-2 pb-2 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#18c8d8] font-bold uppercase tracking-widest flex items-center gap-1">
                      <Sparkles size={11} /> AI-Verified Accuracy
                    </span>
                    <span className={`font-black text-sm ${aiResult.accuracy >= 80 ? "text-green-400" : aiResult.accuracy >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                      {aiResult.accuracy}%
                    </span>
                  </div>
                  {Math.abs(aiResult.accuracy - accuracy) >= 10 && (
                    <p className="text-white/40 text-[11px] mt-1">
                      The AI re-analyzed your recording ({aiResult.correct ?? 0} correct, {aiResult.missed ?? 0} missed) —
                      more accurate than the live estimate of {accuracy}%.
                    </p>
                  )}

                  {/* Authoritative per-word mistake list (the teacher-grade detail) */}
                  {aiResult.words && aiResult.words.some((w) => w.status !== "correct") && (
                    <div className="mt-2">
                      <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1.5">Words to review</p>
                      <div className="flex flex-wrap gap-1.5" dir="rtl">
                        {aiResult.words.filter((w) => w.status !== "correct").slice(0, 14).map((w, i) => (
                          <span
                            key={i}
                            title={`${w.status === "missed" ? "Missed / skipped" : "Mispronounced"} · ${Math.round(w.confidence * 100)}% confidence`}
                            className={`inline-block px-2 py-0.5 rounded-lg text-base font-bold ${
                              w.status === "missed"
                                ? "text-yellow-400 bg-yellow-400/10 ring-1 ring-yellow-400/25"
                                : "text-red-400 bg-red-400/10 ring-1 ring-red-400/25"
                            }`}
                            style={{ fontFamily: "var(--font-quran), var(--font-amiri), serif" }}
                          >
                            {w.text}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-3 mt-1.5" dir="ltr">
                        <span className="text-[10px] text-yellow-400/80">▢ missed</span>
                        <span className="text-[10px] text-red-400/80">▢ mispronounced</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <p className="text-[10px] text-[#18c8d8] font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                <Sparkles size={11} /> AI Tajweed Analysis
              </p>
              {aiResult.feedback && <p className="text-white/70 text-sm leading-relaxed">{aiResult.feedback}</p>}
              {aiResult.tajweedNotes && aiResult.tajweedNotes.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {aiResult.tajweedNotes.map((n, i) => (
                    <li key={i} className="text-white/55 text-xs flex items-start gap-1.5">
                      <span className="text-[#18c8d8] mt-0.5">•</span> {n}
                    </li>
                  ))}
                </ul>
              )}

              {/* Acoustic tajweed category scores */}
              {aiResult.tajweed && Object.keys(aiResult.tajweed.categories).length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  {aiResult.tajweed.overall != null && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Tajweed Score</span>
                      <span className="text-[#18c8d8] font-black text-sm">{aiResult.tajweed.overall}%</span>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    {Object.entries(aiResult.tajweed.categories).map(([name, score]) => (
                      <div key={name} className="flex items-center gap-2">
                        <span className="text-white/45 text-[11px] capitalize w-16 flex-shrink-0">{name}</span>
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${score >= 80 ? "bg-green-400" : score >= 60 ? "bg-yellow-400" : "bg-red-400"}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="text-white/50 text-[10px] font-mono w-8 text-right">{score}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Phase-3 per-letter notes (which madd was clipped, by how much) */}
                  {aiResult.tajweed.details && aiResult.tajweed.details.length > 0 && (
                    <ul className="mt-2.5 space-y-1">
                      {aiResult.tajweed.details.map((d, i) => (
                        <li key={i} className="text-white/45 text-[11px] flex items-start gap-1.5">
                          <span className="text-yellow-400/70 mt-0.5">⚠</span> {d}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ) : aiResult && !aiResult.configured ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 mt-1">
              <p className="text-white/50 text-xs leading-relaxed">
                {aiResult.message ?? aiResult.error ?? "AI tajweed scoring isn't enabled yet."} Your free word-by-word
                feedback above is always available.
              </p>
            </div>
          ) : null}
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
