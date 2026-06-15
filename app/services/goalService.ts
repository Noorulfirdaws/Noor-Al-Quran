// ─── Smart Goal Generator + Hifz Completion Forecast ────────────────────────
// Turns a memorization target into a concrete daily plan, then forecasts a
// realistic completion date from the user's ACTUAL recitation pace.
// Pure localStorage — builds on gamification session history.

import { loadGamification } from "./gamificationService";

const KEY = "noor:hifz-goal";
const DAY = 86_400_000;

export interface GoalTemplate {
  id: string;
  title: string;
  desc: string;
  surahs: number[];     // surah numbers included
  totalAyahs: number;   // total ayahs to memorize
  suggestedDays: number;
  icon: string;
}

// Curated, well-known Hifz targets with correct ayah totals.
export const GOAL_TEMPLATES: GoalTemplate[] = [
  { id: "fatiha",   title: "Al-Fatiha",        desc: "The Opening — the perfect first goal", surahs: [1], totalAyahs: 7, suggestedDays: 7, icon: "🌟" },
  { id: "mulk",     title: "Surah Al-Mulk",    desc: "The nightly protector (30 ayahs)", surahs: [67], totalAyahs: 30, suggestedDays: 30, icon: "🌙" },
  { id: "kahf",     title: "Surah Al-Kahf",    desc: "The Friday surah (110 ayahs)", surahs: [18], totalAyahs: 110, suggestedDays: 60, icon: "🕯️" },
  { id: "juzamma",  title: "Juz Amma",         desc: "The 30th Juz — Surahs 78–114 (564 ayahs)", surahs: range(78, 114), totalAyahs: 564, suggestedDays: 120, icon: "📖" },
  { id: "yaseen",   title: "Surah Ya-Sin",     desc: "The heart of the Quran (83 ayahs)", surahs: [36], totalAyahs: 83, suggestedDays: 45, icon: "💚" },
  { id: "lastten",  title: "Last 10 Surahs",   desc: "Short surahs for daily prayer (Surahs 105–114)", surahs: range(105, 114), totalAyahs: 56, suggestedDays: 21, icon: "✨" },
];

function range(a: number, b: number): number[] {
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
}

export interface ActiveGoal {
  templateId: string;
  title: string;
  icon: string;
  surahs: number[];
  totalAyahs: number;
  targetDays: number;
  startedAt: number;     // timestamp
  ayahsPerDay: number;   // plan
}

export function createGoal(t: GoalTemplate, targetDays?: number): ActiveGoal {
  const days = targetDays && targetDays > 0 ? targetDays : t.suggestedDays;
  const goal: ActiveGoal = {
    templateId: t.id,
    title: t.title,
    icon: t.icon,
    surahs: t.surahs,
    totalAyahs: t.totalAyahs,
    targetDays: days,
    startedAt: Date.now(),
    ayahsPerDay: Math.max(1, Math.ceil(t.totalAyahs / days)),
  };
  try { localStorage.setItem(KEY, JSON.stringify(goal)); } catch {}
  return goal;
}

export function getGoal(): ActiveGoal | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ActiveGoal) : null;
  } catch { return null; }
}

export function clearGoal() {
  try { localStorage.removeItem(KEY); } catch {}
}

// ─── Progress + forecast ──────────────────────────────────────────────────────

export interface GoalProgress {
  ayahsMemorized: number;     // ayahs in the goal's surahs recited with good accuracy
  totalAyahs: number;
  percent: number;
  daysElapsed: number;
  onTrack: boolean;
  // Forecast
  pacePerDay: number;         // measured ayahs/day on this goal
  forecastDays: number | null;// days remaining at current pace
  forecastDate: number | null;// predicted completion timestamp
  targetDate: number;         // the planned target date
}

/**
 * Memorization is counted from gamification sessions: an ayah counts once a
 * session for its surah reaches a solid accuracy. We approximate "ayahs done"
 * as the best (max) accuracy-weighted ayah coverage seen per surah in the goal.
 */
export function goalProgress(goal: ActiveGoal): GoalProgress {
  const g = loadGamification();
  const goalSurahs = new Set(goal.surahs);

  // For each goal surah, the best session = max(accuracy * ayahsRecited).
  const bestPerSurah = new Map<number, number>();
  for (const s of g.sessions) {
    if (!goalSurahs.has(s.surah)) continue;
    const memorized = Math.round((s.accuracy / 100) * s.ayahsRecited);
    bestPerSurah.set(s.surah, Math.max(bestPerSurah.get(s.surah) ?? 0, memorized));
  }
  const ayahsMemorized = Math.min(goal.totalAyahs, Array.from(bestPerSurah.values()).reduce((a, b) => a + b, 0));

  const daysElapsed = Math.max(1, Math.ceil((Date.now() - goal.startedAt) / DAY));
  const percent = Math.round((ayahsMemorized / goal.totalAyahs) * 100);
  const targetDate = goal.startedAt + goal.targetDays * DAY;

  // Measured pace = ayahs done / days elapsed.
  const pacePerDay = ayahsMemorized / daysElapsed;
  const remaining = goal.totalAyahs - ayahsMemorized;
  const forecastDays = pacePerDay > 0 ? Math.ceil(remaining / pacePerDay) : null;
  const forecastDate = forecastDays != null ? Date.now() + forecastDays * DAY : null;

  const expectedByNow = goal.ayahsPerDay * daysElapsed;
  const onTrack = ayahsMemorized >= expectedByNow * 0.8;

  return {
    ayahsMemorized, totalAyahs: goal.totalAyahs, percent, daysElapsed,
    onTrack, pacePerDay, forecastDays, forecastDate, targetDate,
  };
}

export function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
