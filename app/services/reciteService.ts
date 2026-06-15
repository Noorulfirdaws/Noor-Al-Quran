/**
 * reciteService.ts
 * Core DNA of Noor-ul-Quran — AI-powered Quran recitation correction.
 *
 * Handles:
 *   - Comprehensive Arabic normalization (strips tashkeel, unifies letter variants)
 *   - Word-level comparison with fuzzy fallback for near-matches
 *   - Web Speech API wrapper with auto-restart and language fallback
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export type WordStatus = "idle" | "current" | "correct" | "incorrect" | "skipped";

// ─── Arabic normalisation ─────────────────────────────────────────────────────
// Web Speech API returns Modern Standard Arabic (no diacritics, simplified
// orthography).  Quranic text uses Uthmanic script with full tashkeel and
// special Unicode codepoints.  We strip everything down to bare consonants so
// the two can be compared fairly.

export function normalizeArabic(s: string): string {
  return s
    // 1. Strip ALL Arabic diacritics (harakat U+064B–065F, shadda, sukun, etc.)
    .replace(/[ً-ٟ]/g, "")
    // 2. Strip extended Quranic symbols (U+0610–061A, U+0670, U+06D6–06ED)
    .replace(/[ؐ-ؚٰۖ-ۭ]/g, "")
    // 3. Unify ALL alef variants → bare alef ا
    //    ٱ alef wasla, أ hamza above, إ hamza below, آ madda, ٰ superscript alef
    .replace(/[آأإٱ]/g, "ا")
    // 4. Unify final ya / alef maqsura → ي
    .replace(/[ىی]/g, "ي")
    // 5. Hamza on carriers → bare letter
    .replace(/ؤ/g, "و") // ؤ → و
    .replace(/ئ/g, "ي") // ئ → ي
    // 6. Remove standalone hamza and superscript glyphs
    .replace(/[ءٕٔ]/g, "")
    // 7. Ta marbuta → ha (spoken the same in pause)
    .replace(/ة/g, "ه")
    // 8. Remove tatweel / kashida
    .replace(/ـ/g, "")
    // 9. Remove anything that isn't Arabic script or whitespace
    .replace(/[^؀-ۿ\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Normalised Basmala skeleton — "بسم الله الرحمن الرحيم" stripped of diacritics.
const BASMALA_NORM = normalizeArabic("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ");

/**
 * Remove a leading Basmala from an ayah's text, if present.
 *
 * The quran-uthmani edition prepends the Basmala to ayah 1 of every surah
 * except Al-Fatiha (1) and At-Tawbah (9). Since the reader renders its own
 * Basmala header, the prepended copy must be removed to avoid showing it twice.
 *
 * Works by normalising the first four words and comparing against the Basmala
 * skeleton — immune to the diacritic / alef-variant differences that made the
 * old regex approach miss some surahs. Never strips a Basmala-only ayah.
 */
export function stripLeadingBasmala(text: string): string {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 4) return text; // the ayah IS just the Basmala — keep it
  const firstFour = normalizeArabic(words.slice(0, 4).join(" "));
  if (firstFour === BASMALA_NORM) {
    return words.slice(4).join(" ");
  }
  return text;
}

// Simple Levenshtein distance for short strings (max 20 chars)
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/**
 * Similarity between a Quranic expected word and a spoken word, 0..1.
 * 1 = exact (after normalization); decreases with edit distance.
 * This is the confidence primitive the aligner and error engine build on.
 */
export function wordSimilarity(expected: string, spoken: string): number {
  const e = normalizeArabic(expected);
  const s = normalizeArabic(spoken);
  if (!e || !s) return 0;
  if (e === s) return 1;
  const maxLen = Math.max(e.length, s.length);
  if (maxLen === 0) return 0;
  const dist = levenshtein(e, s);
  const ratio = 1 - dist / maxLen;
  // Very short words are risky to fuzzy-match — require near-exact.
  if (e.length <= 2 || s.length <= 2) return e === s ? 1 : 0;
  return ratio;
}

/** Threshold above which two words are considered the "same" word.
 * Raised from 0.6 → 0.72 so a clearly different word is no longer accepted as
 * "correct" — fewer false positives where a mistake was marked good. */
export const MATCH_THRESHOLD = 0.72;

/**
 * Compare a Quranic expected word against a Speech-API spoken word.
 * Boolean wrapper over wordSimilarity, kept for backward compatibility.
 */
export function compareWord(expected: string, spoken: string): boolean {
  return wordSimilarity(expected, spoken) >= MATCH_THRESHOLD;
}

/**
 * Split Quranic Arabic text into individual words (handles zero-width joiners
 * and other special characters used in Uthmanic script).
 */
export function splitWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

// ─── Recitation alignment ─────────────────────────────────────────────────────
// The Web Speech API returns a whole phrase (often a full ayah) in a single
// final result.  We must align that spoken word stream against the expected
// Quran word list — advancing through ALL the words it covers, not just one.
//
// The aligner is greedy with a small look-ahead window so it can recover from:
//   • missed words   → the reciter skipped expected word(s)      → "skipped"
//   • mispronounced  → expected word said wrong / not recognised → "incorrect"
//   • extra words    → ASR inserted a word that isn't in the text → ignored
//
// IMPORTANT: alignment compares NORMALISED forms internally only.  It never
// mutates the displayed text, which always stays in Uthmanic (Hafs) script.

export interface AlignResult {
  statuses: WordStatus[];
  confidences: number[];   // 0..1 per word, parallel to statuses
  cursor: number;
  correct: number;
  incorrect: number;
  skipped: number;
}

// Needleman-Wunsch scoring. Tuned so that one substitution is cheaper than a
// skip+insert pair, keeping mispronunciations as "incorrect" rather than
// fragmenting into skipped+ignored.
const GAP_EXPECTED = -0.6;   // expected word not spoken (skip)
const GAP_SPOKEN = -0.5;     // extra spoken word (insertion)
const MISMATCH = -0.55;      // diagonal where similarity is below threshold

/**
 * Align a spoken word stream against the expected Quran words using global
 * (Needleman-Wunsch) alignment over a bounded window from `cursor`. Optimal —
 * unlike the old greedy matcher it stays correct on repeated/similar verses,
 * and it never advances past a word it didn't actually match.
 *
 * Marks per word: correct (with confidence), incorrect (substitution), or
 * skipped (an expected word the reciter passed over BEFORE a later match).
 * Trailing expected words that weren't reached stay "idle"/"current" so the
 * reciter can continue — they are only resolved on stop (see resolveTrailing).
 */
export function alignRecitation(
  expected: string[],
  statuses: WordStatus[],
  cursor: number,
  spokenWords: string[],
  lookahead = 4,
): AlignResult {
  const out = statuses.slice();
  const confidences: number[] = new Array(statuses.length).fill(0);

  if (spokenWords.length === 0 || cursor >= expected.length) {
    return { statuses: out, confidences, cursor, correct: 0, incorrect: 0, skipped: 0 };
  }

  // Bounded window of expected words to align against this spoken phrase.
  const winEnd = Math.min(expected.length, cursor + spokenWords.length + lookahead);
  const E = expected.slice(cursor, winEnd);   // expected window
  const S = spokenWords;
  const n = E.length, m = S.length;

  // DP matrix + traceback. dp[i][j] = best score aligning E[0..i) with S[0..j).
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  const sim: number[][] = Array.from({ length: n }, () => new Array(m).fill(0));
  for (let i = 1; i <= n; i++) dp[i][0] = dp[i - 1][0] + GAP_EXPECTED;
  for (let j = 1; j <= m; j++) dp[0][j] = dp[0][j - 1] + GAP_SPOKEN;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const sm = wordSimilarity(E[i - 1], S[j - 1]);
      sim[i - 1][j - 1] = sm;
      const diagScore = sm >= MATCH_THRESHOLD ? sm : MISMATCH;
      dp[i][j] = Math.max(
        dp[i - 1][j - 1] + diagScore,   // align E[i-1] with S[j-1]
        dp[i - 1][j] + GAP_EXPECTED,    // E[i-1] skipped
        dp[i][j - 1] + GAP_SPOKEN,      // S[j-1] inserted
      );
    }
  }

  // Semi-global: FREE end-gaps on the expected side. The reciter hasn't
  // necessarily reached the end of the window, so trailing expected words must
  // not be force-consumed (which would mismark them) — and on ties (e.g. a
  // repeated refrain) we want the EARLIEST occurrence, i.e. the smallest i*.
  let iStar = 0;
  let bestEnd = dp[0][m];
  for (let ii = 1; ii <= n; ii++) {
    if (dp[ii][m] > bestEnd) { bestEnd = dp[ii][m]; iStar = ii; }
  }

  // Traceback from (iStar, m); expected words >= iStar stay untouched (idle).
  type Op = { ei: number; kind: "match" | "mismatch" | "skip" };
  const ops: Op[] = [];
  let i = iStar, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const sm = sim[i - 1][j - 1];
      const diagScore = sm >= MATCH_THRESHOLD ? sm : MISMATCH;
      if (dp[i][j] === dp[i - 1][j - 1] + diagScore) {
        ops.push({ ei: i - 1, kind: sm >= MATCH_THRESHOLD ? "match" : "mismatch" });
        i--; j--; continue;
      }
    }
    if (i > 0 && dp[i][j] === dp[i - 1][j] + GAP_EXPECTED) {
      ops.push({ ei: i - 1, kind: "skip" });
      i--; continue;
    }
    // else: spoken insertion — consume S, no expected word touched
    j--;
  }
  ops.reverse();

  // Find the last expected window index that was actually matched/substituted.
  // Trailing skips (after the last real match) are NOT marked — the reciter
  // simply hasn't reached them yet.
  let lastTouched = -1;
  for (const op of ops) {
    if (op.kind === "match" || op.kind === "mismatch") lastTouched = op.ei;
  }

  let correct = 0, incorrect = 0, skipped = 0;
  for (const op of ops) {
    const abs = cursor + op.ei;
    if (op.kind === "match") {
      out[abs] = "correct"; confidences[abs] = sim[op.ei][/*any matched j*/ findMatchedJ(sim, op.ei, S.length)];
      correct++;
    } else if (op.kind === "mismatch") {
      out[abs] = "incorrect"; confidences[abs] = 1 - bestSim(sim, op.ei); incorrect++;
    } else if (op.kind === "skip" && op.ei < lastTouched) {
      out[abs] = "skipped"; confidences[abs] = 0.9; skipped++;
    }
  }

  const newCursor = lastTouched >= 0 ? cursor + lastTouched + 1 : cursor;
  return { statuses: out, confidences, cursor: newCursor, correct, incorrect, skipped };
}

function findMatchedJ(sim: number[][], ei: number, mLen: number): number {
  let best = 0, bestV = -1;
  for (let j = 0; j < mLen; j++) {
    if (sim[ei] && sim[ei][j] > bestV) { bestV = sim[ei][j]; best = j; }
  }
  return best;
}
function bestSim(sim: number[][], ei: number): number {
  let v = 0;
  if (sim[ei]) for (const x of sim[ei]) if (x > v) v = x;
  return v;
}

// ─── Ayah / surah completion engine ───────────────────────────────────────────
// Never finalize feedback before completion is genuinely reached. Completion
// requires the END of the expected text to have been matched — not merely a
// cursor that ran off the end via over-advancing.

export interface CompletionState {
  complete: boolean;
  score: number;        // 0..100 — how much of the expected text was reached
  reachedEnd: boolean;
}

export function recitationCompletion(
  statuses: WordStatus[],
  cursor: number,
  total: number,
): CompletionState {
  if (total === 0) return { complete: false, score: 0, reachedEnd: false };
  const touched = statuses.filter((s) => s !== "idle" && s !== "current").length;
  const score = Math.round((touched / total) * 100);
  // Reached the end only when the cursor is at/after the last word AND the last
  // word actually has a resolved (non-idle) status.
  const lastResolved = statuses[total - 1] !== "idle" && statuses[total - 1] !== "current";
  const reachedEnd = cursor >= total && lastResolved;
  return { complete: reachedEnd && score >= 90, score, reachedEnd };
}

/**
 * On explicit stop, resolve any words the reciter never reached. Everything
 * from the cursor to the end that is still idle/current becomes "skipped" so
 * the score reflects an incomplete recitation honestly.
 */
export function resolveTrailing(statuses: WordStatus[], cursor: number): WordStatus[] {
  const out = statuses.slice();
  for (let k = cursor; k < out.length; k++) {
    if (out[k] === "idle" || out[k] === "current") out[k] = "skipped";
  }
  return out;
}

// ─── Web Speech API wrapper ───────────────────────────────────────────────────

export interface RecognitionCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onFinalResult?: (transcript: string, alternatives: string[]) => void;
  onInterimResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

export interface RecognitionHandle {
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Create a managed speech recognition session with auto-restart.
 * When `autoRestart` is true and the browser stops recognition (common in
 * Chrome after a few seconds of silence), we restart automatically.
 */
export function createRecognition(
  callbacks: RecognitionCallbacks,
  autoRestart = true,
): RecognitionHandle {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    callbacks.onError?.("not-supported");
    return { start: () => {}, stop: () => {}, abort: () => {} };
  }

  let recognition: any = null;
  let active = false;       // user intent: should we be listening?
  let restarting = false;
  let restartTimer: ReturnType<typeof setTimeout> | null = null;

  function scheduleRestart(delay: number) {
    if (restartTimer) clearTimeout(restartTimer);
    restartTimer = setTimeout(() => {
      restartTimer = null;
      if (!active) return;
      try {
        recognition = build();
        recognition.start();
      } catch {
        // start() can throw if the previous instance is still winding down —
        // try again shortly so we never silently stop mid-recitation.
        scheduleRestart(150);
      }
    }, delay);
  }

  function build() {
    const r = new SR();
    r.lang = "ar-SA";
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 5;

    r.onstart = () => {
      if (!restarting) callbacks.onStart?.();
      restarting = false;
    };

    r.onend = () => {
      // Web Speech ends on its own after a brief silence — a breath, a pause for
      // tajweed, a slow reciter. As long as the USER hasn't stopped, we treat
      // every onend as "keep listening" and restart immediately (minimal gap),
      // so pauses never end the session and as little audio as possible is lost.
      if (active && autoRestart) {
        restarting = true;
        scheduleRestart(50);
      } else {
        callbacks.onEnd?.();
      }
    };

    r.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) {
          const alts: string[] = [];
          for (let a = 0; a < result.length; a++) {
            alts.push(result[a].transcript.trim());
          }
          callbacks.onFinalResult?.(alts[0] ?? "", alts);
        } else {
          callbacks.onInterimResult?.(result[0].transcript);
        }
      }
    };

    r.onerror = (e: any) => {
      if (e.error === "no-speech") {
        // Normal — browser just didn't hear anything, let onend handle restart
        return;
      }
      if (e.error === "aborted") return;
      callbacks.onError?.(e.error);
    };

    return r;
  }

  return {
    start() {
      active = true;
      recognition = build();
      try { recognition.start(); } catch { /* already running */ }
    },
    stop() {
      active = false;
      if (restartTimer) { clearTimeout(restartTimer); restartTimer = null; }
      try { recognition?.stop(); } catch { /* ignore */ }
    },
    abort() {
      active = false;
      if (restartTimer) { clearTimeout(restartTimer); restartTimer = null; }
      try { recognition?.abort(); } catch { /* ignore */ }
    },
  };
}
