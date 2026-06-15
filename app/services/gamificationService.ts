// ─── Gamification: XP · Levels · Streaks · Achievements ─────────────────────
// All state lives in localStorage so it works without a backend.

const KEY = "noor:gamification";
const TODAY = () => new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReciteSession {
  date: string;          // YYYY-MM-DD
  surah: number;
  ayahsRecited: number;
  correct: number;
  incorrect: number;
  skipped: number;
  accuracy: number;      // 0–100
  xpEarned: number;
}

export interface AchievementId
  extends String {} // typed alias for readability

export const ACHIEVEMENTS: Record<string, { id: string; title: string; desc: string; icon: string; xp: number; condition: (s: GamificationState) => boolean }> = {
  first_recite:   { id: "first_recite",   title: "First Recitation",   desc: "Complete your first AI-checked recitation",    icon: "🎤", xp: 50,  condition: s => s.totalSessions >= 1 },
  streak_3:       { id: "streak_3",        title: "3-Day Streak",        desc: "Practice 3 days in a row",                    icon: "🔥", xp: 75,  condition: s => s.currentStreak >= 3 },
  streak_7:       { id: "streak_7",        title: "Week Warrior",        desc: "Practice 7 days in a row",                    icon: "⚡", xp: 150, condition: s => s.currentStreak >= 7 },
  streak_30:      { id: "streak_30",       title: "Month Master",        desc: "Practice 30 days in a row",                   icon: "🏆", xp: 500, condition: s => s.currentStreak >= 30 },
  perfect_ayah:   { id: "perfect_ayah",   title: "Perfect Ayah",        desc: "Recite an ayah with 100% accuracy",           icon: "✨", xp: 100, condition: s => s.perfectSessions >= 1 },
  accuracy_90:    { id: "accuracy_90",    title: "Tajweed Expert",      desc: "Average accuracy above 90% for 5 sessions",   icon: "🌟", xp: 200, condition: s => s.sessions.filter(x => x.accuracy >= 90).length >= 5 },
  ten_sessions:   { id: "ten_sessions",   title: "Dedicated Student",   desc: "Complete 10 recitation sessions",             icon: "📖", xp: 150, condition: s => s.totalSessions >= 10 },
  fifty_sessions: { id: "fifty_sessions", title: "Hifz Devotee",        desc: "Complete 50 recitation sessions",             icon: "🕌", xp: 400, condition: s => s.totalSessions >= 50 },
  surah_fatiha:   { id: "surah_fatiha",   title: "Al-Fatiha Complete",  desc: "Recite Surah Al-Fatiha with AI feedback",     icon: "🌙", xp: 75,  condition: s => s.sessions.some(x => x.surah === 1) },
  level_5:        { id: "level_5",        title: "Rising Scholar",      desc: "Reach Level 5",                               icon: "📚", xp: 0,   condition: s => levelFromXp(s.totalXp) >= 5 },
  level_10:       { id: "level_10",       title: "Quran Guardian",      desc: "Reach Level 10",                              icon: "🛡️", xp: 0,   condition: s => levelFromXp(s.totalXp) >= 10 },
};

export interface GamificationState {
  totalXp: number;
  totalSessions: number;
  perfectSessions: number;         // sessions with 100% accuracy
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;   // YYYY-MM-DD
  sessions: ReciteSession[];       // last 90 sessions max
  unlockedAchievements: string[];  // achievement IDs
}

// ─── Level math ───────────────────────────────────────────────────────────────

export function levelFromXp(xp: number): number {
  // Each level requires 20% more XP than the last. Level 1 = 0 XP.
  let level = 1;
  let needed = 100;
  let accumulated = 0;
  while (xp >= accumulated + needed) {
    accumulated += needed;
    needed = Math.ceil(needed * 1.2);
    level++;
  }
  return level;
}

export function xpForNextLevel(currentXp: number): { level: number; currentLevelXp: number; neededXp: number; progress: number } {
  let level = 1;
  let needed = 100;
  let accumulated = 0;
  while (currentXp >= accumulated + needed) {
    accumulated += needed;
    needed = Math.ceil(needed * 1.2);
    level++;
  }
  const currentLevelXp = currentXp - accumulated;
  return { level, currentLevelXp, neededXp: needed, progress: Math.round((currentLevelXp / needed) * 100) };
}

export const LEVEL_TITLES = [
  "", "Beginner", "Student", "Reciter", "Reader", "Scholar",
  "Hafiz Candidate", "Hafiz", "Hifz Guide", "Tajweed Expert", "Quran Master",
];

export function levelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length - 1)] ?? "Grand Hafiz";
}

// ─── XP calculation per session ───────────────────────────────────────────────

export function calcSessionXp(accuracy: number, ayahsRecited: number, streak: number): number {
  let xp = 0;
  xp += ayahsRecited * 10;                          // 10 XP per ayah
  xp += Math.round(accuracy * 0.5);                 // up to 50 XP for 100% accuracy
  if (accuracy === 100) xp += 25;                   // perfection bonus
  if (streak >= 7) xp = Math.round(xp * 1.5);      // 7-day streak: 1.5× multiplier
  else if (streak >= 3) xp = Math.round(xp * 1.25); // 3-day streak: 1.25× multiplier
  return Math.max(xp, 5);                           // minimum 5 XP
}

// ─── State management ─────────────────────────────────────────────────────────

function defaultState(): GamificationState {
  return {
    totalXp: 0, totalSessions: 0, perfectSessions: 0,
    currentStreak: 0, longestStreak: 0, lastActiveDate: null,
    sessions: [], unlockedAchievements: [],
  };
}

export function loadGamification(): GamificationState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch { return defaultState(); }
}

function save(s: GamificationState) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

// ─── Core: record a completed recitation session ──────────────────────────────

export interface SessionInput {
  surah: number;
  ayahsRecited: number;
  correct: number;
  incorrect: number;
  skipped: number;
  accuracy: number;
}

export interface SessionResult {
  xpEarned: number;
  newAchievements: typeof ACHIEVEMENTS[string][];
  levelUp: boolean;
  newLevel: number;
  streakBonus: boolean;
  state: GamificationState;
}

export function recordSession(input: SessionInput): SessionResult {
  const s = loadGamification();
  const today = TODAY();
  const prevLevel = levelFromXp(s.totalXp);

  // ── Update streak ──
  if (s.lastActiveDate === null) {
    s.currentStreak = 1;
  } else {
    const diffMs = new Date(today).getTime() - new Date(s.lastActiveDate).getTime();
    const diffDays = Math.round(diffMs / 86_400_000);
    if (diffDays === 0) {
      // same day — don't touch streak
    } else if (diffDays === 1) {
      s.currentStreak += 1;
    } else {
      s.currentStreak = 1; // streak broken
    }
  }
  s.lastActiveDate = today;
  if (s.currentStreak > s.longestStreak) s.longestStreak = s.currentStreak;

  const streakBonus = s.currentStreak >= 3;

  // ── Calc XP ──
  const xpEarned = calcSessionXp(input.accuracy, input.ayahsRecited, s.currentStreak);
  s.totalXp += xpEarned;
  s.totalSessions += 1;
  if (input.accuracy === 100) s.perfectSessions += 1;

  // ── Store session ──
  const session: ReciteSession = {
    date: today,
    surah: input.surah,
    ayahsRecited: input.ayahsRecited,
    correct: input.correct,
    incorrect: input.incorrect,
    skipped: input.skipped,
    accuracy: input.accuracy,
    xpEarned,
  };
  s.sessions = [session, ...s.sessions].slice(0, 90);

  // ── Check achievements ──
  const newAchievements: typeof ACHIEVEMENTS[string][] = [];
  for (const ach of Object.values(ACHIEVEMENTS)) {
    if (!s.unlockedAchievements.includes(ach.id) && ach.condition(s)) {
      s.unlockedAchievements.push(ach.id);
      s.totalXp += ach.xp; // bonus XP for achievement
      newAchievements.push(ach);
    }
  }

  const newLevel = levelFromXp(s.totalXp);
  const levelUp = newLevel > prevLevel;

  save(s);
  return { xpEarned, newAchievements, levelUp, newLevel, streakBonus, state: s };
}

// ─── Struggle detection ───────────────────────────────────────────────────────

const STRUGGLE_KEY = "noor:struggles";

interface StruggleEntry {
  surah: number;
  ayah: number;
  surahName: string;
  mistakes: number;
  lastSeen: string; // ISO
}

export function recordMistake(surah: number, ayah: number, surahName: string) {
  try {
    const raw = localStorage.getItem(STRUGGLE_KEY);
    const map: Record<string, StruggleEntry> = raw ? JSON.parse(raw) : {};
    const key = `${surah}:${ayah}`;
    const prev = map[key] ?? { surah, ayah, surahName, mistakes: 0, lastSeen: new Date().toISOString() };
    map[key] = { ...prev, mistakes: prev.mistakes + 1, lastSeen: new Date().toISOString() };
    localStorage.setItem(STRUGGLE_KEY, JSON.stringify(map));
  } catch {}
}

export function getStruggles(limit = 5): StruggleEntry[] {
  try {
    const raw = localStorage.getItem(STRUGGLE_KEY);
    if (!raw) return [];
    const map: Record<string, StruggleEntry> = JSON.parse(raw);
    return Object.values(map)
      .filter(e => e.mistakes >= 2)
      .sort((a, b) => b.mistakes - a.mistakes)
      .slice(0, limit);
  } catch { return []; }
}

// ─── Coach comment generator ──────────────────────────────────────────────────

// ─── Daily AI coach guidance (dashboard banner) ───────────────────────────────
// Synthesizes streak, recent accuracy, and struggles into one actionable nudge.

export function dailyCoachTip(): { headline: string; body: string; cta: { label: string; href: string } } {
  const s = loadGamification();
  const struggles = getStruggles(1);
  const recent = s.sessions.slice(0, 5);
  const avg = recent.length ? Math.round(recent.reduce((a, x) => a + x.accuracy, 0) / recent.length) : 0;
  const today = TODAY();
  const practicedToday = s.lastActiveDate === today;

  if (s.totalSessions === 0) {
    return {
      headline: "Begin your Hifz journey today",
      body: "Start with Surah Al-Fatiha — recite it aloud and your AI teacher will give instant, word-by-word feedback.",
      cta: { label: "Recite Al-Fatiha", href: "/quran/1" },
    };
  }
  if (struggles.length > 0) {
    const st = struggles[0];
    return {
      headline: `Strengthen ${st.surahName} today`,
      body: `You've missed Ayah ${st.ayah} ${st.mistakes} times — it's your weakest verse. Repeat it 3 times to lock it in.`,
      cta: { label: `Review ${st.surahName}`, href: `/quran/${st.surah}?ayah=${st.ayah}` },
    };
  }
  if (!practicedToday && s.currentStreak > 0) {
    return {
      headline: `Keep your ${s.currentStreak}-day streak alive 🔥`,
      body: "A short session today protects your streak and your memory. Even one ayah counts.",
      cta: { label: "Recite now", href: "/quran" },
    };
  }
  if (avg >= 90) {
    return {
      headline: "Your accuracy is excellent — push further",
      body: `You're averaging ${avg}%. Try memorizing a new surah, or revise an older one before you forget it.`,
      cta: { label: "Open Revision Planner", href: "/revision" },
    };
  }
  return {
    headline: "Consistency builds Hifz",
    body: `Your recent average is ${avg}%. Focus on the words marked red — daily repetition is the key to retention.`,
    cta: { label: "Continue reciting", href: "/quran" },
  };
}

export function coachComment(accuracy: number, streak: number): string {
  if (accuracy === 100) {
    return streak >= 7
      ? "Masha'Allah! Perfect recitation and a 7-day streak — you are building true Hifz momentum. Keep going!"
      : "Exceptional! Perfect accuracy. Your connection with the Words of Allah is growing stronger each session.";
  }
  if (accuracy >= 90) return "Excellent recitation. Minor refinements will take you to perfection. Review the highlighted words once more.";
  if (accuracy >= 75) return "Good effort. Focus on the words marked in red — repeating them 3 times will anchor them in memory.";
  if (accuracy >= 60) return "A solid attempt. The AI has marked your weak spots — these are your golden revision targets for tomorrow.";
  if (accuracy >= 40) return "Keep practicing. Repetition is the mother of memorization. Listen to a reciter, then recite again.";
  return "Every journey begins with a single step. Listen carefully to the audio, then try again — you will improve.";
}
