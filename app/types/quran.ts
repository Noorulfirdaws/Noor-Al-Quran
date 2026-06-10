// ─── Surah / Ayah ───────────────────────────────────────────────────────────

export interface SurahMeta {
  number: number;
  name: string;                        // Arabic: سُورَةُ الفَاتِحَةِ
  englishName: string;                 // Al-Faatiha
  englishNameTranslation: string;      // The Opening
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
}

export interface AyahData {
  number: number;              // global ayah number (1–6236)
  numberInSurah: number;
  text: string;                // Arabic Uthmani script
  transliteration: string;
  translation: string;
  juz: number;
  page: number;
  hizbQuarter: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
}

// ─── Word-by-Word ────────────────────────────────────────────────────────────

export interface WordData {
  id: number;
  position: number;
  textUthmani: string;
  transliteration: string;
  translation: string;
  audioUrl?: string;
  rootLetters?: string;
}

export interface AyahWithWords extends AyahData {
  words: WordData[];
}

// ─── Audio ───────────────────────────────────────────────────────────────────

export interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  style: "murattal" | "mujawwad";
  urlPrefix: string;
  /** How to build the per-ayah URL.
   * "global-ayah"  → {prefix}/{globalAyah}.mp3          (Islamic Network CDN)
   * "surah-ayah"   → {prefix}/{surah:03d}{ayah:03d}.mp3  (EveryAyah CDN)
   */
  urlFormat?: "global-ayah" | "surah-ayah";
}

export type RepeatMode = "off" | "verse" | "range" | "memorization";

// ─── Reader Settings ─────────────────────────────────────────────────────────

export interface ReaderSettings {
  fontSize: 1 | 2 | 3 | 4 | 5;
  showArabic: boolean;
  showTransliteration: boolean;
  showTranslation: boolean;
  reciterId: string;
  repeatMode: RepeatMode;
  repeatCount: number;       // number of times to repeat
}

export const DEFAULT_SETTINGS: ReaderSettings = {
  fontSize: 3,
  showArabic: true,
  showTransliteration: true,
  showTranslation: true,
  reciterId: "ar.alafasy",
  repeatMode: "off",
  repeatCount: 3,
};

// ─── Bookmarks / Progress ────────────────────────────────────────────────────

export interface Bookmark {
  surahNumber: number;
  ayahNumber: number;         // numberInSurah
  surahName: string;
  note?: string;
  createdAt: string;          // ISO string
}

export interface ReadingProgress {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  updatedAt: string;
}

// ─── Reader Mode ─────────────────────────────────────────────────────────────

export type ReaderMode = "reading" | "word-by-word" | "memorization";

// ─── Premium ─────────────────────────────────────────────────────────────────

export type PremiumFeature =
  | "word-by-word"
  | "memorization"
  | "audio-repeat"
  | "audio-range"
  | "analytics";

export interface PremiumGateConfig {
  feature: PremiumFeature;
  surahNumber: number;
}
