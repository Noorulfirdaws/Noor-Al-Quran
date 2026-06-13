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
 * Compare a Quranic expected word against a Speech-API spoken word.
 * Returns true if they match after normalization, with a 1-edit fuzzy
 * allowance for words longer than 3 characters.
 */
export function compareWord(expected: string, spoken: string): boolean {
  const e = normalizeArabic(expected);
  const s = normalizeArabic(spoken);
  if (!e || !s) return false;
  if (e === s) return true;
  // Very short words — exact only
  if (e.length <= 2 || s.length <= 2) return false;
  // Reject if length differs too much
  if (Math.abs(e.length - s.length) > 2) return false;
  // Allow 1-edit distance for medium words, 2-edit for long words
  const maxEdits = e.length >= 6 ? 2 : 1;
  return levenshtein(e, s) <= maxEdits;
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
  cursor: number;
  correct: number;
  incorrect: number;
  skipped: number;
}

export function alignRecitation(
  expected: string[],
  statuses: WordStatus[],
  cursor: number,
  spokenWords: string[],
  lookahead = 3,
): AlignResult {
  const out = statuses.slice();
  let i = cursor;          // index into expected words
  let s = 0;               // index into spoken words
  let correct = 0, incorrect = 0, skipped = 0;

  // Find the first index k in arr[from..to) whose word matches `word`.
  // `expectedSide` says which argument is the expected (Quran) side, so
  // compareWord's (expected, spoken) order is honoured.
  const findAhead = (
    arr: string[], from: number, to: number, word: string, expectedSide: boolean,
  ): number => {
    for (let k = from; k < to && k < arr.length; k++) {
      const ok = expectedSide ? compareWord(arr[k], word) : compareWord(word, arr[k]);
      if (ok) return k;
    }
    return -1;
  };

  while (s < spokenWords.length && i < expected.length) {
    const spoken = spokenWords[s];

    // Direct hit
    if (compareWord(expected[i], spoken)) {
      out[i] = "correct"; correct++; i++; s++; continue;
    }

    // Did the reciter skip some expected words? (spoken matches a word ahead)
    const jExp = findAhead(expected, i + 1, i + 1 + lookahead, spoken, true);
    // Did the ASR insert an extra word? (expected[i] matches a later spoken word)
    const kSpk = findAhead(spokenWords, s + 1, s + 1 + lookahead, expected[i], false);

    if (jExp !== -1 && (kSpk === -1 || (jExp - i) <= (kSpk - s))) {
      // Words i..jExp-1 were missed
      for (let k = i; k < jExp; k++) { out[k] = "skipped"; skipped++; }
      out[jExp] = "correct"; correct++;
      i = jExp + 1; s++;
    } else if (kSpk !== -1) {
      // spoken[s..kSpk-1] were extra/insertions — ignore them, keep expected[i]
      s = kSpk;
    } else {
      // Genuine mismatch — the expected word was recited incorrectly
      out[i] = "incorrect"; incorrect++; i++; s++;
    }
  }

  return { statuses: out, cursor: i, correct, incorrect, skipped };
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
      if (active && autoRestart) {
        // Chrome killed it — restart after a short pause
        restarting = true;
        setTimeout(() => {
          if (active) {
            recognition = build();
            try { recognition.start(); } catch { /* ignore */ }
          }
        }, 200);
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
      try { recognition?.stop(); } catch { /* ignore */ }
    },
    abort() {
      active = false;
      try { recognition?.abort(); } catch { /* ignore */ }
    },
  };
}
