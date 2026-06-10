/**
 * Unit tests for quranService helpers.
 * These run without a browser — no DOM/localStorage required for the pure logic.
 *
 * Run with: npx jest
 * (Install jest + ts-jest if not already: npm i -D jest ts-jest @types/jest)
 */

// ─── normalizeArabic ─────────────────────────────────────────────────────────
// Inline the function since it lives in AIRecitationDemo; here we test the
// standalone port of the same logic.

function normalizeArabic(s: string): string {
  return s
    .replace(/[ً-ٰٟۖ-ۜ۟-۪ۤۧۨ-ۭ]/g, "")
    .replace(/[ٱ]/g, "ا")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/[ىی]/g, "ي")
    .replace(/[^؀-ۿ\s]/g, "")
    .trim();
}

describe("normalizeArabic", () => {
  it("strips diacritics from Uthmanic script", () => {
    expect(normalizeArabic("بِسْمِ")).toBe("بسم");
  });

  it("normalizes alef wasla to plain alef", () => {
    expect(normalizeArabic("ٱللَّهِ")).toBe("الله");
  });

  it("normalizes hamza variants", () => {
    expect(normalizeArabic("أَنتَ")).toBe("انت");
    expect(normalizeArabic("إِنَّ")).toBe("ان");
  });

  it("normalizes ta marbuta", () => {
    expect(normalizeArabic("سُورَةُ")).toBe("سوره");
  });

  it("normalizes alef maqsura", () => {
    expect(normalizeArabic("يَهْدِى")).toBe("يهدي");
  });

  it("empty string returns empty", () => {
    expect(normalizeArabic("")).toBe("");
  });
});

// ─── wordOf (whitespace split) ────────────────────────────────────────────────

function wordsOf(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

describe("wordsOf", () => {
  it("splits on spaces", () => {
    expect(wordsOf("بسم الله الرحمن")).toEqual(["بسم", "الله", "الرحمن"]);
  });

  it("handles multiple spaces", () => {
    expect(wordsOf("  a  b  ")).toEqual(["a", "b"]);
  });

  it("empty string returns []", () => {
    expect(wordsOf("")).toEqual([]);
  });
});

// ─── compareWord ─────────────────────────────────────────────────────────────

function compareWord(expected: string, spoken: string): boolean {
  return normalizeArabic(expected) === normalizeArabic(spoken);
}

describe("compareWord", () => {
  it("matches Uthmanic with speech-api output (alef wasla)", () => {
    expect(compareWord("ٱللَّهِ", "الله")).toBe(true);
  });

  it("matches despite diacritics", () => {
    expect(compareWord("بِسْمِ", "بسم")).toBe(true);
  });

  it("rejects genuinely different words", () => {
    expect(compareWord("الله", "محمد")).toBe(false);
  });
});

// ─── bookmarkService logic ────────────────────────────────────────────────────
// Uses a mock localStorage

const store: Record<string, string> = {};
const mockStorage = {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v; },
  removeItem: (k: string) => { delete store[k]; },
};

// Inline the service functions with injected storage for testability
function getBookmarks(storage = mockStorage) {
  try { return JSON.parse(storage.getItem("noor:bookmarks") ?? "[]"); }
  catch { return []; }
}

function addBookmark(
  bm: { surahNumber: number; ayahNumber: number; surahName: string },
  storage = mockStorage
) {
  const list = getBookmarks(storage);
  const exists = list.find(
    (b: { surahNumber: number; ayahNumber: number }) =>
      b.surahNumber === bm.surahNumber && b.ayahNumber === bm.ayahNumber
  );
  if (exists) return;
  list.unshift({ ...bm, createdAt: new Date().toISOString() });
  storage.setItem("noor:bookmarks", JSON.stringify(list));
}

function removeBookmark(surahNumber: number, ayahNumber: number, storage = mockStorage) {
  const list = getBookmarks(storage).filter(
    (b: { surahNumber: number; ayahNumber: number }) =>
      !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber)
  );
  storage.setItem("noor:bookmarks", JSON.stringify(list));
}

describe("bookmarkService", () => {
  beforeEach(() => {
    Object.keys(store).forEach((k) => delete store[k]);
  });

  it("starts with empty bookmarks", () => {
    expect(getBookmarks()).toEqual([]);
  });

  it("adds a bookmark", () => {
    addBookmark({ surahNumber: 1, ayahNumber: 1, surahName: "Al-Fatiha" });
    expect(getBookmarks()).toHaveLength(1);
    expect(getBookmarks()[0].surahNumber).toBe(1);
  });

  it("does not add duplicate", () => {
    addBookmark({ surahNumber: 1, ayahNumber: 1, surahName: "Al-Fatiha" });
    addBookmark({ surahNumber: 1, ayahNumber: 1, surahName: "Al-Fatiha" });
    expect(getBookmarks()).toHaveLength(1);
  });

  it("removes a bookmark", () => {
    addBookmark({ surahNumber: 1, ayahNumber: 1, surahName: "Al-Fatiha" });
    removeBookmark(1, 1);
    expect(getBookmarks()).toHaveLength(0);
  });

  it("preserves other bookmarks on remove", () => {
    addBookmark({ surahNumber: 1, ayahNumber: 1, surahName: "Al-Fatiha" });
    addBookmark({ surahNumber: 2, ayahNumber: 1, surahName: "Al-Baqarah" });
    removeBookmark(1, 1);
    const remaining = getBookmarks();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].surahNumber).toBe(2);
  });
});

// ─── Premium logic ────────────────────────────────────────────────────────────

type PremiumFeature = "word-by-word" | "memorization" | "audio-repeat" | "audio-range" | "analytics";

function isFeatureAllowed(
  feature: PremiumFeature,
  surahNumber: number,
  isPremium: boolean
): boolean {
  if (surahNumber === 1) return true;
  if (isPremium) return true;
  return false;
}

describe("Premium gating logic", () => {
  it("always allows all features for Surah 1", () => {
    expect(isFeatureAllowed("word-by-word", 1, false)).toBe(true);
    expect(isFeatureAllowed("memorization", 1, false)).toBe(true);
    expect(isFeatureAllowed("audio-repeat", 1, false)).toBe(true);
  });

  it("blocks premium features for Surah 2 without premium", () => {
    expect(isFeatureAllowed("word-by-word", 2, false)).toBe(false);
    expect(isFeatureAllowed("memorization", 2, false)).toBe(false);
  });

  it("allows all features for any surah when premium", () => {
    expect(isFeatureAllowed("word-by-word", 114, true)).toBe(true);
    expect(isFeatureAllowed("memorization", 50, true)).toBe(true);
  });
});

// ─── Audio URL generation ─────────────────────────────────────────────────────

function getAyahAudioUrl(reciterId: string, surahNumber: number, ayahNumber: number): string {
  const urlPrefix = `https://everyayah.com/data/${reciterId}`;
  const s = String(surahNumber).padStart(3, "0");
  const a = String(ayahNumber).padStart(3, "0");
  return `${urlPrefix}/${s}${a}.mp3`;
}

describe("getAyahAudioUrl", () => {
  it("pads surah and ayah numbers to 3 digits", () => {
    expect(getAyahAudioUrl("Alafasy_128kbps", 1, 1)).toBe(
      "https://everyayah.com/data/Alafasy_128kbps/001001.mp3"
    );
  });

  it("handles two-digit surah numbers", () => {
    expect(getAyahAudioUrl("Alafasy_128kbps", 36, 1)).toBe(
      "https://everyayah.com/data/Alafasy_128kbps/036001.mp3"
    );
  });

  it("handles triple-digit surah", () => {
    expect(getAyahAudioUrl("Alafasy_128kbps", 114, 6)).toBe(
      "https://everyayah.com/data/Alafasy_128kbps/114006.mp3"
    );
  });
});
