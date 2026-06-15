// ─── Shareable Progress Report (Parent / Teacher) ───────────────────────────
// A student generates a snapshot of their progress; a parent or teacher opens
// the shared link to view a clean, printable report. Honest fit for the
// client-side architecture: the snapshot self-encodes (base64url, like promo
// codes) — no multi-user backend, no account linking, nothing leaves the device
// until the student chooses to share the link.

import { loadGamification, levelFromXp, levelTitle } from "./gamificationService";
import { getGoal, goalProgress } from "./goalService";
import { getByRisk } from "./revisionService";

export interface ProgressSnapshot {
  name: string;
  generatedAt: number;
  level: number;
  levelTitle: string;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  avgAccuracy: number;       // last 10 sessions
  perfectSessions: number;
  achievements: number;
  goal?: { title: string; percent: number; onTrack: boolean } | null;
  weakSpots: { surahName: string; retention: number }[];
}

export function buildSnapshot(name: string): ProgressSnapshot {
  const g = loadGamification();
  const recent = g.sessions.slice(0, 10);
  const avg = recent.length ? Math.round(recent.reduce((s, x) => s + x.accuracy, 0) / recent.length) : 0;
  const level = levelFromXp(g.totalXp);

  const goal = getGoal();
  const gp = goal ? goalProgress(goal) : null;

  const weak = getByRisk()
    .filter((r) => r.risk !== "low")
    .slice(0, 3)
    .map((r) => ({ surahName: r.card.surahName, retention: r.retention }));

  return {
    name: name.trim() || "Student",
    generatedAt: Date.now(),
    level,
    levelTitle: levelTitle(level),
    totalXp: g.totalXp,
    currentStreak: g.currentStreak,
    longestStreak: g.longestStreak,
    totalSessions: g.totalSessions,
    avgAccuracy: avg,
    perfectSessions: g.perfectSessions,
    achievements: g.unlockedAchievements.length,
    goal: goal && gp ? { title: goal.title, percent: gp.percent, onTrack: gp.onTrack } : null,
    weakSpots: weak,
  };
}

// ─── Encode / decode (base64url, URL-safe) ────────────────────────────────────

function b64urlEncode(s: string): string {
  const b = typeof window !== "undefined"
    ? btoa(unescape(encodeURIComponent(s)))
    : Buffer.from(s).toString("base64");
  return b.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(s: string): string {
  const b = s.replace(/-/g, "+").replace(/_/g, "/");
  return typeof window !== "undefined"
    ? decodeURIComponent(escape(atob(b)))
    : Buffer.from(b, "base64").toString();
}

export function encodeSnapshot(snap: ProgressSnapshot): string {
  return b64urlEncode(JSON.stringify(snap));
}

export function decodeSnapshot(code: string): ProgressSnapshot | null {
  try {
    const obj = JSON.parse(b64urlDecode(code));
    if (typeof obj.totalXp !== "number" || typeof obj.name !== "string") return null;
    return obj as ProgressSnapshot;
  } catch {
    return null;
  }
}

/** Shareable URL a student sends to a parent/teacher. */
export function shareUrl(snap: ProgressSnapshot): string {
  const code = encodeSnapshot(snap);
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/report?d=${code}`;
}
