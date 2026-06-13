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
  stripLeadingBasmala,
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
