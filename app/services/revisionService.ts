// ─── Smart Revision Planner ─────────────────────────────────────────────────
// Spaced-repetition scheduling for memorized surahs, modelled on the SM-2
// algorithm + a forgetting-curve risk score. Pure localStorage, no backend.
//
// Each time a user recites a surah, call reviewSurah() with the accuracy.
// The planner updates the interval (how many days until the next review) and
// an ease factor. getDueReviews() returns what to revise today; getForgetRisk()
// estimates how likely each surah is to be forgotten right now.

const KEY = "noor:revision";
const DAY = 86_400_000;

export interface RevisionCard {
  surah: number;
  surahName: string;
  reps: number;            // successful reviews in a row
  ease: number;            // ease factor (>= 1.3)
  intervalDays: number;    // current interval
  lastReview: number;      // timestamp
  nextReview: number;      // timestamp (lastReview + interval)
  lastAccuracy: number;    // 0–100
  strength: number;        // 0–100 retention strength (decays over time)
}

type CardMap = Record<number, RevisionCard>;

function load(): CardMap {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function save(m: CardMap) {
  try { localStorage.setItem(KEY, JSON.stringify(m)); } catch {}
}

// ─── Record a review ──────────────────────────────────────────────────────────

export function reviewSurah(surah: number, surahName: string, accuracy: number): RevisionCard {
  const m = load();
  const now = Date.now();
  const prev = m[surah];

  // Quality 0–5 (SM-2 style), derived from accuracy
  const q = Math.round((accuracy / 100) * 5);

  let reps = prev?.reps ?? 0;
  let ease = prev?.ease ?? 2.5;
  let intervalDays: number;

  if (q < 3) {
    // Failed recall — reset the interval, start over
    reps = 0;
    intervalDays = 1;
  } else {
    reps += 1;
    if (reps === 1) intervalDays = 1;
    else if (reps === 2) intervalDays = 4;
    else intervalDays = Math.round((prev?.intervalDays ?? 4) * ease);
  }

  // Update ease factor (clamped to >= 1.3)
  ease = Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  const card: RevisionCard = {
    surah,
    surahName,
    reps,
    ease: +ease.toFixed(2),
    intervalDays,
    lastReview: now,
    nextReview: now + intervalDays * DAY,
    lastAccuracy: accuracy,
    strength: Math.min(100, 50 + reps * 10 + (accuracy - 50) / 2),
  };

  m[surah] = card;
  save(m);
  return card;
}

// ─── Forgetting curve ─────────────────────────────────────────────────────────
// Ebbinghaus-style retention: R = e^(-t/S) where t is days since review and S
// is memory stability (scaled by interval + ease). Returns 0–100 % retained.

export function currentRetention(card: RevisionCard): number {
  const daysSince = (Date.now() - card.lastReview) / DAY;
  const stability = Math.max(1, card.intervalDays * card.ease);
  const retention = Math.exp(-daysSince / stability) * card.strength;
  return Math.max(0, Math.min(100, Math.round(retention)));
}

export type RiskLevel = "low" | "medium" | "high";

export function forgetRisk(card: RevisionCard): RiskLevel {
  const r = currentRetention(card);
  if (r >= 70) return "low";
  if (r >= 40) return "medium";
  return "high";
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function getAllCards(): RevisionCard[] {
  return Object.values(load()).sort((a, b) => a.nextReview - b.nextReview);
}

export function getDueReviews(): RevisionCard[] {
  const now = Date.now();
  return getAllCards().filter((c) => c.nextReview <= now);
}

export function getUpcomingReviews(): RevisionCard[] {
  const now = Date.now();
  return getAllCards().filter((c) => c.nextReview > now);
}

/** Cards sorted by forgetting risk (highest risk first). */
export function getByRisk(): { card: RevisionCard; retention: number; risk: RiskLevel }[] {
  return getAllCards()
    .map((card) => ({ card, retention: currentRetention(card), risk: forgetRisk(card) }))
    .sort((a, b) => a.retention - b.retention);
}

export function formatDue(nextReview: number): string {
  const diff = nextReview - Date.now();
  if (diff <= 0) return "Due now";
  const days = Math.ceil(diff / DAY);
  if (days === 1) return "Tomorrow";
  if (days < 7) return `In ${days} days`;
  if (days < 30) return `In ${Math.ceil(days / 7)} weeks`;
  return `In ${Math.ceil(days / 30)} months`;
}

// ─── Memorization map ─────────────────────────────────────────────────────────
// Per-surah strength for the whole-Quran heatmap. Strength decays with time
// (uses currentRetention), so surahs not revised recently fade from green→red.

export type SurahStrength = "none" | "weak" | "review" | "strong";

export function surahStrengthMap(): Record<number, { strength: SurahStrength; retention: number; name: string }> {
  const cards = load();
  const out: Record<number, { strength: SurahStrength; retention: number; name: string }> = {};
  for (const card of Object.values(cards)) {
    const r = currentRetention(card);
    const strength: SurahStrength = r >= 70 ? "strong" : r >= 40 ? "review" : "weak";
    out[card.surah] = { strength, retention: r, name: card.surahName };
  }
  return out;
}

export function memorizationStats(): { started: number; strong: number; review: number; weak: number } {
  const map = surahStrengthMap();
  const vals = Object.values(map);
  return {
    started: vals.length,
    strong: vals.filter((v) => v.strength === "strong").length,
    review: vals.filter((v) => v.strength === "review").length,
    weak: vals.filter((v) => v.strength === "weak").length,
  };
}

// ─── Goal generator ───────────────────────────────────────────────────────────

export interface HifzGoal {
  title: string;
  surahs: number[];
  totalDays: number;
  ayahsPerDay: number;
  startedAt: number;
}

const GOAL_KEY = "noor:hifz-goal";

export function setGoal(goal: HifzGoal) {
  try { localStorage.setItem(GOAL_KEY, JSON.stringify(goal)); } catch {}
}

export function getGoal(): HifzGoal | null {
  try {
    const raw = localStorage.getItem(GOAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearGoal() {
  try { localStorage.removeItem(GOAL_KEY); } catch {}
}
