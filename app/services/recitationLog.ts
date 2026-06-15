// ─── Recitation Diagnostic Log (Phase 9) ────────────────────────────────────
// Records the measurable outcome of every finalized recitation so systematic
// engine problems are visible (e.g. a surah that always scores low = a data or
// alignment issue, not the user). Local ring buffer, last 50 sessions.
// Privacy: stays on-device; no audio, no transcript text is stored by default.

const KEY = "noor:recite-log";
const MAX = 50;

export interface RecitationLogEntry {
  ts: number;
  surah: number;
  totalWords: number;
  correct: number;
  incorrect: number;
  skipped: number;
  accuracy: number;
  completionScore: number;   // 0..100 how much of the surah was reached
  reachedEnd: boolean;       // did the engine see a true completion?
  finalizeReason: "completed" | "fallback" | "manual";
}

export function logRecitation(entry: Omit<RecitationLogEntry, "ts">) {
  try {
    const raw = localStorage.getItem(KEY);
    const list: RecitationLogEntry[] = raw ? JSON.parse(raw) : [];
    list.unshift({ ts: Date.now(), ...entry });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch { /* logging is best-effort */ }
}

export function getRecitationLog(): RecitationLogEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RecitationLogEntry[]) : [];
  } catch { return []; }
}

export function clearRecitationLog() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

/** Quick health summary across recent sessions — surfaces systematic problems. */
export function recitationHealth(): {
  sessions: number;
  avgAccuracy: number;
  avgCompletion: number;
  incompleteRate: number;     // fraction that never reached a true end
} {
  const log = getRecitationLog();
  if (log.length === 0) return { sessions: 0, avgAccuracy: 0, avgCompletion: 0, incompleteRate: 0 };
  const n = log.length;
  const avgAccuracy = Math.round(log.reduce((s, e) => s + e.accuracy, 0) / n);
  const avgCompletion = Math.round(log.reduce((s, e) => s + e.completionScore, 0) / n);
  const incompleteRate = +(log.filter((e) => !e.reachedEnd).length / n).toFixed(2);
  return { sessions: n, avgAccuracy, avgCompletion, incompleteRate };
}
