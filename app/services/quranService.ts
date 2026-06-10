import type { SurahMeta, AyahData, AyahWithWords, WordData } from "../types/quran";

// ─── Cache helpers ───────────────────────────────────────────────────────────

const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
// Bump this string to invalidate all qs: cached data (e.g. after Bismillah-strip fix)
const CACHE_VERSION = "v2";

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

/**
 * Try our own API proxy first (server-side, avoids CORS + adds caching).
 * Fall back to AlQuran Cloud directly if the proxy is unavailable.
 * proxyPath  – path relative to /api/quran  (e.g. "/surah", "/surah/1")
 * directPath – path relative to AlQuran Base (e.g. "/surah", "/surah/1/editions/...")
 */
async function fetchWithFallback<T>(proxyPath: string, directPath: string): Promise<T> {
  // 1. Proxy attempt
  try {
    const res = await fetch(`/api/quran${proxyPath}`);
    if (res.ok) {
      const json = await res.json();
      // proxy routes return the upstream JSON as-is; upstream errors have json.error
      if (!json.error) return json as T;
    }
  } catch { /* proxy unavailable */ }

  // 2. Direct fallback
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

  // Proxy path: /api/quran/surah/{id}  (route appends editions internally)
  // Direct path: full editions URL
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

  // The quran-uthmani edition prepends Bismillah to the first ayah text for
  // all surahs except Al-Fatiha (1) and At-Tawbah (9). Since SurahReader
  // renders a separate Bismillah header, we strip it from the ayah text to
  // avoid duplication.
  //
  // We normalise by stripping Arabic diacritics (Tashkeel, Tatweel, etc.)
  // before pattern-matching so we're robust to any Unicode variation the API
  // may use (ٱ vs ا, full Uthmani diacritics vs simplified, etc.).
  const DIACRITIC_RE = /[ؐ-ًؚ-ٰٟۖ-ۜ۟-۪ۤۧۨ-ۭـ]/g;
  // Normalise alif-wasla (ٱ U+0671) → alif (ا U+0627) for matching
  const normChar = (s: string) => s.replace(/ٱ/g, "ا").replace(DIACRITIC_RE, "");
  // Base consonants of Bismillah without diacritics: بسم الله الرحمن الرحيم
  const BASMALA_PLAIN = "بسم الله الرحمن الرحيم";

  function stripBasmala(text: string): string {
    const plain = normChar(text);
    if (!plain.startsWith("بسم")) return text; // fast early exit
    // Find where رحيم ends in the plain version (last 4 chars of Basmala)
    const rahimEnd = plain.indexOf("رحيم");
    if (rahimEnd === -1 || rahimEnd > BASMALA_PLAIN.length + 5) return text;
    // Map plain-text end position back to original text by counting base chars
    const targetPlainLen = rahimEnd + 4; // رحيم = 4 base chars
    let origIdx = 0, plainCount = 0;
    while (origIdx < text.length && plainCount < targetPlainLen) {
      const cp = text.codePointAt(origIdx) ?? 0;
      const isDiacritic =
        (cp >= 0x0610 && cp <= 0x061A) ||
        (cp >= 0x064B && cp <= 0x065F) ||
        cp === 0x0640 || cp === 0x0670 ||
        (cp >= 0x06D6 && cp <= 0x06ED);
      if (!isDiacritic) plainCount++;
      origIdx += cp > 0xFFFF ? 2 : 1;
    }
    // Advance past any trailing diacritics/spaces after رحيم
    while (origIdx < text.length) {
      const cp = text.codePointAt(origIdx) ?? 0;
      if (cp !== 0x0020 && cp !== 0x00A0 && // spaces
          !((cp >= 0x0610 && cp <= 0x061A) || (cp >= 0x064B && cp <= 0x065F) ||
            cp === 0x0670 || (cp >= 0x06D6 && cp <= 0x06ED))) break;
      origIdx++;
    }
    return text.slice(origIdx);
  }

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

  // First get the surah ayahs so we can merge word data
  const { ayahs } = await getSurah(surahNumber);

  let verses: QuranComVerse[] = [];
  try {
    // Try via proxy first
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

  const result: AyahWithWords[] = ayahs.map((ayah) => {
    const verse = verseMap[ayah.numberInSurah];
    const words: WordData[] = (verse?.words ?? [])
      .filter((w) => w.text_uthmani && w.text_uthmani !== "۝") // skip verse markers
      .map((w) => ({
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
