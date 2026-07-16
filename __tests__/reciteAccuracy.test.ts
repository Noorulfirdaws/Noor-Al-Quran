/**
 * Accuracy & efficiency regression guard for the recitation error-tracker.
 *
 * The word-by-word engine in app/services/reciteService.ts is the product's DNA.
 * These tests pin down the properties that MUST hold as the engine evolves:
 *   • it never tells a student a mistake was correct (zero false-greens),
 *   • it catches real mistakes (recall) without crying wolf (precision),
 *   • it stays fast enough to run live on every spoken phrase.
 *
 * Scenarios simulate what a browser speech recognizer feeds the aligner for a
 * real ayah — perfect, mispronounced, skipped, ASR noise, mixed, and a benign
 * diacritic near-miss that must stay "correct".
 */
import { alignRecitation, type WordStatus } from "../app/services/reciteService";

// Al-Fatiha 1:7 (Uthmani) — 9 words
const EXPECTED = [
  "صِرَٰطَ", "ٱلَّذِينَ", "أَنْعَمْتَ", "عَلَيْهِمْ", "غَيْرِ",
  "ٱلْمَغْضُوبِ", "عَلَيْهِمْ", "وَلَا", "ٱلضَّآلِّينَ",
];
// A perfect recitation as a browser ASR would return it (MSA, no tashkeel).
const PERFECT = ["صراط", "الذين", "أنعمت", "عليهم", "غير", "المغضوب", "عليهم", "ولا", "الضالين"];

const C: WordStatus = "correct", I: WordStatus = "incorrect", S: WordStatus = "skipped";
const fresh = (n: number): WordStatus[] =>
  Array.from({ length: n }, (_, i) => (i === 0 ? "current" : "idle"));

type Scenario = { name: string; spoken: string[]; truth: WordStatus[] };

const SCENARIOS: Scenario[] = [
  { name: "perfect", spoken: PERFECT, truth: [C, C, C, C, C, C, C, C, C] },
  {
    name: "mispronounced #3 (أنعمت→كتاب)",
    spoken: ["صراط", "الذين", "كتاب", "عليهم", "غير", "المغضوب", "عليهم", "ولا", "الضالين"],
    truth: [C, C, I, C, C, C, C, C, C],
  },
  {
    name: "skipped #5 (غير)",
    spoken: ["صراط", "الذين", "أنعمت", "عليهم", "المغضوب", "عليهم", "ولا", "الضالين"],
    truth: [C, C, C, C, S, C, C, C, C],
  },
  {
    name: "ASR noise (extra inserted words)",
    spoken: ["صراط", "يا", "الذين", "أنعمت", "اه", "عليهم", "غير", "المغضوب", "عليهم", "ولا", "الضالين"],
    truth: [C, C, C, C, C, C, C, C, C],
  },
  {
    name: "two errors (mispronounce #2 + skip #6)",
    spoken: ["صراط", "والذي", "أنعمت", "عليهم", "غير", "عليهم", "ولا", "الضالين"],
    truth: [C, I, C, C, C, S, C, C, C],
  },
  {
    name: "benign diacritic near-miss stays correct (عليهم→عليهام)",
    spoken: ["صراط", "الذين", "أنعمت", "عليهام", "غير", "المغضوب", "عليهم", "ولا", "الضالين"],
    truth: [C, C, C, C, C, C, C, C, C],
  },
];

function scoreScenario(sc: Scenario) {
  const res = alignRecitation(EXPECTED, fresh(EXPECTED.length), 0, sc.spoken);
  let tp = 0, fp = 0, fn = 0, falseGreen = 0;
  for (let k = 0; k < EXPECTED.length; k++) {
    if (k >= res.cursor) continue; // word not reached yet — not an error, pending
    const got = res.statuses[k];
    const want = sc.truth[k];
    const gotErr = got === I || got === S;
    const wantErr = want === I || want === S;
    if (wantErr && gotErr) tp++;
    else if (!wantErr && gotErr) fp++;
    else if (wantErr && !gotErr) fn++;
    if (wantErr && got === C) falseGreen++;
  }
  return { tp, fp, fn, falseGreen };
}

describe("recitation error-tracker — accuracy regression", () => {
  it("NEVER marks a real mistake as correct (zero false-greens)", () => {
    for (const sc of SCENARIOS) {
      expect(scoreScenario(sc).falseGreen).toBe(0);
    }
  });

  it("catches ≥90% of real mistakes with ≥90% precision across scenarios", () => {
    let TP = 0, FP = 0, FN = 0;
    for (const sc of SCENARIOS) {
      const r = scoreScenario(sc);
      TP += r.tp; FP += r.fp; FN += r.fn;
    }
    const recall = TP / (TP + FN);
    const precision = TP / (TP + FP);
    expect(recall).toBeGreaterThanOrEqual(0.9);
    expect(precision).toBeGreaterThanOrEqual(0.9);
  });

  it("aligns a live phrase fast enough to run in real time (<2ms/call)", () => {
    const N = 5000;
    const t0 = performance.now();
    for (let k = 0; k < N; k++) alignRecitation(EXPECTED, fresh(EXPECTED.length), 0, PERFECT);
    const perCall = (performance.now() - t0) / N;
    expect(perCall).toBeLessThan(2);
  });
});
