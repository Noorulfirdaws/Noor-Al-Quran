/**
 * Unit tests for the recitation alignment engine — the core AI mistake-detection
 * logic. Verifies that a spoken word stream is aligned against the expected
 * Uthmani word list, marking correct / incorrect / skipped per word.
 *
 * Run with: npx jest reciteService
 */
import {
  alignRecitation,
  compareWord,
  wordSimilarity,
  stripLeadingBasmala,
  recitationCompletion,
  resolveTrailing,
  type WordStatus,
} from "../app/services/reciteService";

// Al-Fatiha ayah 2 expected words (Uthmani)
const AYAH = ["ٱلْحَمْدُ", "لِلَّهِ", "رَبِّ", "ٱلْعَٰلَمِينَ"];

function freshStatuses(n: number): WordStatus[] {
  return Array.from({ length: n }, (_, i) => (i === 0 ? "current" : "idle"));
}

describe("compareWord", () => {
  it("matches identical words after normalization", () => {
    expect(compareWord("ٱلْحَمْدُ", "الحمد")).toBe(true);
  });
  it("rejects clearly different words", () => {
    expect(compareWord("رَبِّ", "مالك")).toBe(false);
  });
});

describe("stripLeadingBasmala", () => {
  it("removes a prepended Basmala from ayah 1 (e.g. Al-Baqarah)", () => {
    const raw = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ الٓمٓ";
    expect(stripLeadingBasmala(raw)).toBe("الٓمٓ");
  });
  it("keeps a Basmala-only ayah (Al-Fatiha 1) intact", () => {
    const basmala = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
    expect(stripLeadingBasmala(basmala)).toBe(basmala);
  });
  it("leaves text without a leading Basmala untouched", () => {
    const t = "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ";
    expect(stripLeadingBasmala(t)).toBe(t);
  });
});

describe("alignRecitation — whole-phrase processing", () => {
  it("marks every word correct when the full ayah is recited at once", () => {
    const res = alignRecitation(AYAH, freshStatuses(4), 0, [
      "الحمد", "لله", "رب", "العالمين",
    ]);
    expect(res.statuses).toEqual(["correct", "correct", "correct", "correct"]);
    expect(res.cursor).toBe(4);
    expect(res.correct).toBe(4);
    expect(res.incorrect).toBe(0);
  });

  it("advances through ALL spoken words, not just the first", () => {
    // The old engine only ever marked one word per event — this guards that.
    const res = alignRecitation(AYAH, freshStatuses(4), 0, ["الحمد", "لله"]);
    expect(res.cursor).toBe(2);
    expect(res.statuses[0]).toBe("correct");
    expect(res.statuses[1]).toBe("correct");
  });

  it("marks a missed word as skipped", () => {
    // Reciter jumps from "الحمد" straight to "رب" (skips "لله")
    const res = alignRecitation(AYAH, freshStatuses(4), 0, ["الحمد", "رب", "العالمين"]);
    expect(res.statuses[0]).toBe("correct");
    expect(res.statuses[1]).toBe("skipped");
    expect(res.statuses[2]).toBe("correct");
    expect(res.statuses[3]).toBe("correct");
    expect(res.skipped).toBe(1);
  });

  it("marks a mispronounced word as incorrect", () => {
    const res = alignRecitation(AYAH, freshStatuses(4), 0, ["الحمد", "كلب", "رب", "العالمين"]);
    expect(res.statuses[1]).toBe("incorrect");
    expect(res.incorrect).toBe(1);
  });

  it("ignores an extra inserted word", () => {
    const res = alignRecitation(AYAH, freshStatuses(4), 0, ["الحمد", "يا", "لله", "رب", "العالمين"]);
    expect(res.statuses).toEqual(["correct", "correct", "correct", "correct"]);
    expect(res.cursor).toBe(4);
  });

  it("resumes from a mid-surah cursor without touching earlier words", () => {
    const statuses: WordStatus[] = ["correct", "current", "idle", "idle"];
    const res = alignRecitation(AYAH, statuses, 1, ["لله", "رب"]);
    expect(res.statuses[0]).toBe("correct"); // untouched
    expect(res.statuses[1]).toBe("correct");
    expect(res.statuses[2]).toBe("correct");
    expect(res.cursor).toBe(3);
  });
});

// ─── Hard cases from the engine audit ─────────────────────────────────────────

describe("alignRecitation — repeated & similar verses (NW stability)", () => {
  // Ar-Rahman's refrain repeats; a phrase must align to the CURRENT occurrence,
  // not jump to a later one the way the old greedy matcher did.
  const REFRAIN = ["فبأي", "آلاء", "ربكما", "تكذبان"];
  const TWICE = [...REFRAIN, ...REFRAIN]; // two consecutive refrains

  it("aligns the first occurrence without jumping to the second", () => {
    const res = alignRecitation(TWICE, freshStatuses(8), 0, ["فبأي", "آلاء", "ربكما", "تكذبان"]);
    // Exactly the first four are correct; the second four remain unreached.
    expect(res.statuses.slice(0, 4)).toEqual(["correct", "correct", "correct", "correct"]);
    expect(res.statuses[4]).not.toBe("skipped");
    expect(res.cursor).toBe(4);
    expect(res.skipped).toBe(0);
  });

  it("does not mark trailing unreached words as skipped", () => {
    const res = alignRecitation(AYAH, freshStatuses(4), 0, ["الحمد"]);
    expect(res.statuses[0]).toBe("correct");
    expect(res.statuses[1]).not.toBe("skipped"); // not reached yet, not an error
    expect(res.cursor).toBe(1);
  });

  it("handles a repeated word (reciter says a word twice)", () => {
    const res = alignRecitation(AYAH, freshStatuses(4), 0, ["الحمد", "الحمد", "لله"]);
    expect(res.statuses[0]).toBe("correct");
    expect(res.statuses[1]).toBe("correct"); // the duplicate is treated as insertion
    expect(res.cursor).toBe(2);
  });
});

describe("wordSimilarity — confidence primitive", () => {
  it("returns 1 for an exact normalized match", () => {
    expect(wordSimilarity("ٱلْحَمْدُ", "الحمد")).toBe(1);
  });
  it("returns a high value for a near-miss and low for a clear miss", () => {
    // العالمين vs العلمين (one dropped alef) — should still read as near-match
    expect(wordSimilarity("ٱلْعَٰلَمِينَ", "العلمين")).toBeGreaterThan(0.7);
    // a clearly different word scores low
    expect(wordSimilarity("ٱلْعَٰلَمِينَ", "مالك")).toBeLessThan(0.4);
  });
});

describe("recitationCompletion — completion engine", () => {
  it("is NOT complete mid-ayah even if some words are done", () => {
    const statuses: WordStatus[] = ["correct", "correct", "current", "idle"];
    const c = recitationCompletion(statuses, 2, 4);
    expect(c.complete).toBe(false);
    expect(c.reachedEnd).toBe(false);
    expect(c.score).toBe(50);
  });
  it("is complete only when the LAST word is resolved and cursor reached end", () => {
    const statuses: WordStatus[] = ["correct", "correct", "correct", "correct"];
    const c = recitationCompletion(statuses, 4, 4);
    expect(c.reachedEnd).toBe(true);
    expect(c.complete).toBe(true);
    expect(c.score).toBe(100);
  });
  it("is not complete if cursor ran off the end but the last word is still idle", () => {
    // Guards the false-completion failure mode from the audit.
    const statuses: WordStatus[] = ["correct", "correct", "correct", "idle"];
    const c = recitationCompletion(statuses, 4, 4);
    expect(c.reachedEnd).toBe(false);
    expect(c.complete).toBe(false);
  });
});

describe("resolveTrailing — honest scoring on stop", () => {
  it("marks unreached trailing words as skipped when the user stops", () => {
    const statuses: WordStatus[] = ["correct", "correct", "current", "idle"];
    const out = resolveTrailing(statuses, 2);
    expect(out).toEqual(["correct", "correct", "skipped", "skipped"]);
  });
});
