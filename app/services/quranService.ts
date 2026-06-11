import type { SurahMeta, AyahData, AyahWithWords, WordData } from "../types/quran";

// ─── Cache helpers ───────────────────────────────────────────────────────────

const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
// Bump this string to invalidate all qs: cached data
const CACHE_VERSION = "v4";

function cacheSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify({ v: value, ts: Date.now() }));
  } catch {
    // storage full or SSR — ignore
  }
}

function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { v, ts } = JSON.parse(raw) as { v: T; ts: number };
    if (Date.now() - ts > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return v;
  } catch {
    return null;
  }
}

// ─── Internal fetch helpers ──────────────────────────────────────────────────

const ALQURAN_BASE = "https://api.alquran.cloud/v1";

async function fetchWithFallback<T>(proxyPath: string, directPath: string): Promise<T> {
  try {
    const res = await fetch(`/api/quran${proxyPath}`);
    if (res.ok) {
      const json = await res.json();
      if (!json.error) return json as T;
    }
  } catch { /* proxy unavailable */ }

  const res = await fetch(`${ALQURAN_BASE}${directPath}`);
  if (!res.ok) throw new Error(`Failed to load Quran data (HTTP ${res.status})`);
  return res.json() as Promise<T>;
}

// ─── Surah List ──────────────────────────────────────────────────────────────

export async function getSurahList(): Promise<SurahMeta[]> {
  const cached = cacheGet<SurahMeta[]>(`qs:${CACHE_VERSION}:surah-list`);
  if (cached) return cached;

  const json = await fetchWithFallback<{ data: SurahMeta[] }>("/surah", "/surah");
  const list = json.data;
  cacheSet(`qs:${CACHE_VERSION}:surah-list`, list);
  return list;
}

// ─── Basmala strip ───────────────────────────────────────────────────────────
// The quran-uthmani edition from AlQuran Cloud prepends Bismillah text to
// ayah 1 of every surah except Al-Fatiha (1, where it IS ayah 1) and
// At-Tawbah (9, which has no Bismillah).
// SurahReader renders its own Bismillah header, so we must strip the prepended
// one from the raw ayah text.
//
// Uses a regex built from explicit \uXXXX escapes for the 18 consonants of
// Bismillah, allowing any number of diacritics between each consonant.
// This is immune to font/encoding differences in how the API returns the text.

// Arabic diacritic character class (explicit hex — no inline Arabic chars)
const D = "[\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u0640]*";

// Alef + alef-wasla class
const A = "[\\u0627\\u0671]";

// Regex for full Bismillah: بسم الله الرحمن الرحيم  (with any diacritics)
// ب=ب س=س م=م ل=ل ه=ه ر=ر ح=ح ن=ن ي=ي
const BASMALA_RE = new RegExp(
  `^${D}\\u0628${D}\\u0633${D}\\u0645${D}\\s+` +         // بسم
  `${A}${D}\\u0644${D}\\u0644${D}\\u0647${D}\\s+` +       // الله
  `${A}${D}\\u0644${D}\\u0631${D}\\u062D${D}\\u0645${D}\\u0670?${D}\\u0646${D}\\s+` + // الرحمن
  `${A}${D}\\u0644${D}\\u0631${D}\\u062D${D}\\u064A${D}\\u0645${D}\\s*`              // الرحيم
);

function stripBasmala(text: string): string {
  const match = BASMALA_RE.exec(text);
  if (!match) return text;
  const stripped = text.slice(match[0].length).trim();
  return stripped || text; // safety: never return empty
}

// ─── Surah Data ──────────────────────────────────────────────────────────────

export interface SurahResult {
  meta: SurahMeta;
  ayahs: AyahData[];
}

export async function getSurah(surahNumber: number): Promise<SurahResult> {
  const cacheKey = `qs:${CACHE_VERSION}:surah-${surahNumber}`;
  const cached = cacheGet<SurahResult>(cacheKey);
  if (cached) return cached;

  type AlQuranEdition = {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
    edition: { identifier: string };
    ayahs: {
      number: number;
      numberInSurah: number;
      text: string;
      juz: number;
      page: number;
      hizbQuarter: number;
      sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
    }[];
  };

  const json = await fetchWithFallback<{ data: AlQuranEdition[] }>(
    `/surah/${surahNumber}`,
    `/surah/${surahNumber}/editions/quran-uthmani,en.transliteration,en.sahih`
  );

  const [arabic, translit, translation] = json.data;

  const meta: SurahMeta = {
    number: arabic.number,
    name: arabic.name,
    englishName: arabic.englishName,
    englishNameTranslation: arabic.englishNameTranslation,
    numberOfAyahs: arabic.numberOfAyahs,
    revelationType: arabic.revelationType as "Meccan" | "Medinan",
  };

  // Strip Bismillah from ayah 1 for all surahs except 1 and 9
  const needsStrip = meta.number !== 1 && meta.number !== 9;

  const ayahs: AyahData[] = arabic.ayahs.map((a, i) => {
    let text = a.text;
    if (needsStrip && a.numberInSurah === 1) {
      text = stripBasmala(text);
    }
    return {
      number: a.number,
      numberInSurah: a.numberInSurah,
      text,
      transliteration: translit.ayahs[i]?.text ?? "",
      translation: translation.ayahs[i]?.text ?? "",
      juz: a.juz,
      page: a.page,
      hizbQuarter: a.hizbQuarter,
      sajda: a.sajda,
    };
  });

  const result: SurahResult = { meta, ayahs };
  cacheSet(cacheKey, result);
  return result;
}

// ─── Word-by-Word ────────────────────────────────────────────────────────────

interface QuranComVerse {
  id: number;
  verse_number: number;
  verse_key: string;
  words: {
    id: number;
    position: number;
    audio_url: string | null;
    text_uthmani: string;
    transliteration: { text: string } | null;
    translation: { text: string } | null;
  }[];
}

export async function getWordsForSurah(surahNumber: number): Promise<AyahWithWords[]> {
  const cacheKey = `qs:${CACHE_VERSION}:words-${surahNumber}`;
  const cached = cacheGet<AyahWithWords[]>(cacheKey);
  if (cached) return cached;

  const { ayahs } = await getSurah(surahNumber);

  let verses: QuranComVerse[] = [];
  try {
    let res: Response;
    try {
      res = await fetch(`/api/quran/words/${surahNumber}`);
      if (!res.ok) throw new Error("proxy failed");
    } catch {
      res = await fetch(
        `https://api.quran.com/api/v4/verses/by_chapter/${surahNumber}` +
          `?words=true&word_fields=text_uthmani,transliteration,translation,audio_url&per_page=300&language=en`
      );
    }
    if (res.ok) {
      const json = (await res.json()) as { verses: QuranComVerse[] };
      verses = json.verses ?? [];
    }
  } catch {
    // word data unavailable — return ayahs with empty words
  }

  const verseMap: Record<number, QuranComVerse> = {};
  for (const v of verses) {
    verseMap[v.verse_number] = v;
  }

  // Bismillah word text in bare consonants (used to filter leading Basmala words
  // from word-by-word data for surahs that aren't 1 or 9)
  const BASMALA_WORDS_COUNT = 4; // بسم / الله / الرحمن / الرحيم

  const result: AyahWithWords[] = ayahs.map((ayah) => {
    const verse = verseMap[ayah.numberInSurah];
    let rawWords = (verse?.words ?? []).filter(
      (w) => w.text_uthmani && w.text_uthmani !== "۝" && w.text_uthmani !== "۞"
    );

    // Strip leading Bismillah words from ayah 1 for surahs 2–114 (except 9)
    // Quran.com word API includes Bismillah as the first 4 words of ayah 1
    if (
      ayah.numberInSurah === 1 &&
      surahNumber !== 1 &&
      surahNumber !== 9 &&
      rawWords.length > BASMALA_WORDS_COUNT
    ) {
      // Verify the first word really starts with ب (ba) before stripping
      const firstWordBare = rawWords[0].text_uthmani.replace(/[ً-ٰٟۖ-ۭ]/g, "");
      if (firstWordBare.startsWith("ب")) {
        rawWords = rawWords.slice(BASMALA_WORDS_COUNT);
      }
    }

    const words: WordData[] = rawWords.map((w) => ({
      id: w.id,
      position: w.position,
      textUthmani: w.text_uthmani,
      transliteration: w.transliteration?.text ?? "",
      translation: w.translation?.text ?? "",
      audioUrl: w.audio_url
        ? w.audio_url.startsWith("http")
          ? w.audio_url
          : `https://audio.qurancdn.com/${w.audio_url}`
        : undefined,
    }));

    return { ...ayah, words };
  });

  cacheSet(cacheKey, result);
  return result;
}

// ─── Search ──────────────────────────────────────────────────────────────────

export async function searchSurahs(query: string): Promise<SurahMeta[]> {
  const list = await getSurahList();
  const q = query.toLowerCase().trim();
  if (!q) return list;
  return list.filter(
    (s) =>
      s.englishName.toLowerCase().includes(q) ||
      s.englishNameTranslation.toLowerCase().includes(q) ||
      String(s.number).includes(q)
  );
}

// ─── Cache management ────────────────────────────────────────────────────────

export function clearQuranCache(): void {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("qs:"))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // SSR or storage unavailable
  }
}
