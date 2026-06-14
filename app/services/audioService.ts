import type { Reciter, RepeatMode } from "../types/quran";

// ─── Available reciters ───────────────────────────────────────────────────────
//
// All reciters use EveryAyah as the primary source — it is CORS-enabled,
// globally reliable, and every folder below has been verified to serve audio.
// (The previous Islamic-Network CDN 403'd many reciters, which made most of
// them silently fail to play.)
//
//   URL format ("surah-ayah"): everyayah.com/data/{folder}/{surah:03d}{ayah:03d}.mp3

export const RECITERS: Reciter[] = [
  // ── Murattal (verified EveryAyah folders) ────────────────────────────────
  {
    id: "everyayah.alafasy",
    name: "Mishary Rashid Alafasy",
    arabicName: "مشاري راشد العفاسي",
    style: "murattal",
    urlPrefix: "https://everyayah.com/data/Alafasy_128kbps",
    urlFormat: "surah-ayah",
  },
  {
    id: "everyayah.sudais",
    name: "Abdurrahman As-Sudais",
    arabicName: "عبدالرحمن السديس",
    style: "murattal",
    urlPrefix: "https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps",
    urlFormat: "surah-ayah",
  },
  {
    id: "everyayah.husary",
    name: "Mahmoud Khalil Al-Husary",
    arabicName: "محمود خليل الحصري",
    style: "murattal",
    urlPrefix: "https://everyayah.com/data/Husary_128kbps",
    urlFormat: "surah-ayah",
  },
  {
    id: "everyayah.minshawi",
    name: "Mohamed El-Minshawi",
    arabicName: "محمد صديق المنشاوي",
    style: "murattal",
    urlPrefix: "https://everyayah.com/data/Minshawy_Murattal_128kbps",
    urlFormat: "surah-ayah",
  },
  {
    id: "everyayah.maher",
    name: "Maher Al-Muaiqly",
    arabicName: "ماهر المعيقلي",
    style: "murattal",
    urlPrefix: "https://everyayah.com/data/Maher_AlMuaiqly_64kbps",
    urlFormat: "surah-ayah",
  },
  {
    id: "everyayah.shuraim",
    name: "Saud Al-Shuraim",
    arabicName: "سعود الشريم",
    style: "murattal",
    urlPrefix: "https://everyayah.com/data/Saood_ash-Shuraym_128kbps",
    urlFormat: "surah-ayah",
  },
  {
    id: "everyayah.ghamdi",
    name: "Saad Al-Ghamdi",
    arabicName: "سعد الغامدي",
    style: "murattal",
    urlPrefix: "https://everyayah.com/data/Ghamadi_40kbps",
    urlFormat: "surah-ayah",
  },
  {
    id: "everyayah.basfar",
    name: "Abdullah Basfar",
    arabicName: "عبدالله بصفر",
    style: "murattal",
    urlPrefix: "https://everyayah.com/data/Abdullah_Basfar_192kbps",
    urlFormat: "surah-ayah",
  },
  {
    id: "everyayah.akhdar",
    name: "Ibrahim Al-Akhdar",
    arabicName: "إبراهيم الأخضر",
    style: "murattal",
    urlPrefix: "https://everyayah.com/data/Ibrahim_Akhdar_32kbps",
    urlFormat: "surah-ayah",
  },
  {
    id: "everyayah.rifai",
    name: "Hani Ar-Rifai",
    arabicName: "هاني الرفاعي",
    style: "murattal",
    urlPrefix: "https://everyayah.com/data/Hani_Rifai_192kbps",
    urlFormat: "surah-ayah",
  },
  {
    id: "everyayah.qatami",
    name: "Nasser Al-Qatami",
    arabicName: "ناصر القطامي",
    style: "murattal",
    urlPrefix: "https://everyayah.com/data/Nasser_Alqatami_128kbps",
    urlFormat: "surah-ayah",
  },
  {
    id: "everyayah.suesy",
    name: "Ali Hajjaj Al-Suesy",
    arabicName: "علي حجاج السويسي",
    style: "murattal",
    urlPrefix: "https://everyayah.com/data/Ali_Hajjaj_AlSuesy_128kbps",
    urlFormat: "surah-ayah",
  },
  {
    id: "everyayah.shaatree",
    name: "Abu Bakr Ash-Shaatree",
    arabicName: "أبو بكر الشاطري",
    style: "murattal",
    urlPrefix: "https://everyayah.com/data/Abu_Bakr_Ash-Shaatree_128kbps",
    urlFormat: "surah-ayah",
  },
  {
    id: "everyayah.ayyoub",
    name: "Muhammad Ayyoub",
    arabicName: "محمد أيوب",
    style: "murattal",
    urlPrefix: "https://everyayah.com/data/Muhammad_Ayyoub_128kbps",
    urlFormat: "surah-ayah",
  },
  {
    id: "everyayah.dussary",
    name: "Yasser Ad-Dussary",
    arabicName: "ياسر الدوسري",
    style: "murattal",
    urlPrefix: "https://everyayah.com/data/Yasser_Ad-Dussary_128kbps",
    urlFormat: "surah-ayah",
  },
  {
    id: "everyayah.budair",
    name: "Salah Al-Budair",
    arabicName: "صلاح البدير",
    style: "murattal",
    urlPrefix: "https://everyayah.com/data/Salah_Al_Budair_128kbps",
    urlFormat: "surah-ayah",
  },
  {
    id: "everyayah.banna",
    name: "Mahmoud Ali Al-Banna",
    arabicName: "محمود علي البنا",
    style: "murattal",
    urlPrefix: "https://everyayah.com/data/Mahmoud_Ali_Al_Banna_32kbps",
    urlFormat: "surah-ayah",
  },
  {
    id: "everyayah.abdulbasit-murattal",
    name: "Abdul Basit Abdul Samad (Murattal)",
    arabicName: "عبد الباسط عبد الصمد (مرتل)",
    style: "murattal",
    urlPrefix: "https://everyayah.com/data/Abdul_Basit_Murattal_192kbps",
    urlFormat: "surah-ayah",
  },
  // ── Mujawwad (verified EveryAyah folders) ────────────────────────────────
  {
    id: "everyayah.abdulbasit-mujawwad",
    name: "Abdul Basit Abdul Samad (Mujawwad)",
    arabicName: "عبد الباسط عبد الصمد (مجوّد)",
    style: "mujawwad",
    urlPrefix: "https://everyayah.com/data/Abdul_Basit_Mujawwad_128kbps",
    urlFormat: "surah-ayah",
  },
  {
    id: "everyayah.minshawi-mujawwad",
    name: "El-Minshawi (Mujawwad)",
    arabicName: "المنشاوي (مجوّد)",
    style: "mujawwad",
    urlPrefix: "https://everyayah.com/data/Minshawy_Mujawwad_192kbps",
    urlFormat: "surah-ayah",
  },
  {
    id: "everyayah.husary-mujawwad",
    name: "Al-Husary (Mujawwad)",
    arabicName: "الحصري (مجوّد)",
    style: "mujawwad",
    urlPrefix: "https://everyayah.com/data/Husary_128kbps_Mujawwad",
    urlFormat: "surah-ayah",
  },
];

export function getReciterById(id: string): Reciter {
  return RECITERS.find((r) => r.id === id) ?? RECITERS[0];
}

// ─── Surah → global ayah offset table (1-indexed) ────────────────────────────
const SURAH_STARTS: readonly number[] = [
  0,
  1,    8,    294,  494,  670,  790,  955,  1161, 1236, 1365,
  1474, 1597, 1708, 1751, 1803, 1902, 2030, 2141, 2251, 2349,
  2484, 2596, 2674, 2792, 2856, 2933, 3160, 3253, 3341, 3410,
  3470, 3504, 3534, 3607, 3661, 3706, 3789, 3971, 4059, 4134,
  4219, 4273, 4326, 4415, 4474, 4511, 4546, 4584, 4613, 4631,
  4676, 4736, 4785, 4847, 4902, 4980, 5076, 5105, 5127, 5151,
  5164, 5178, 5189, 5200, 5218, 5230, 5242, 5272, 5324, 5376,
  5420, 5448, 5476, 5496, 5552, 5592, 5623, 5673, 5713, 5759,
  5801, 5830, 5849, 5885, 5910, 5932, 5949, 5968, 5994, 6024,
  6044, 6059, 6080, 6091, 6099, 6107, 6126, 6131, 6139, 6147,
  6158, 6169, 6177, 6180, 6189, 6194, 6198, 6205, 6208, 6214,
  6217, 6222, 6226, 6231,
];

export function toGlobalAyah(surahNumber: number, ayahInSurah: number): number {
  return (SURAH_STARTS[surahNumber] ?? 1) + ayahInSurah - 1;
}

/** Build the direct CDN URL (used internally and for the proxy). */
export function buildDirectUrl(
  reciterId: string,
  surahNumber: number,
  ayahNumber: number
): string {
  const reciter = getReciterById(reciterId);
  if (reciter.urlFormat === "surah-ayah") {
    const s = String(surahNumber).padStart(3, "0");
    const a = String(ayahNumber).padStart(3, "0");
    return `${reciter.urlPrefix}/${s}${a}.mp3`;
  }
  const globalNumber = toGlobalAyah(surahNumber, ayahNumber);
  return `${reciter.urlPrefix}/${globalNumber}.mp3`;
}

/**
 * Returns the proxied audio URL.
 * All requests go through /api/audio?url=... so the browser never hits an
 * external CDN directly — no CORS issues, no region-blocking.
 */
export function getAyahAudioUrl(
  reciterId: string,
  surahNumber: number,
  ayahNumber: number
): string {
  const direct = buildDirectUrl(reciterId, surahNumber, ayahNumber);
  return `/api/audio?url=${encodeURIComponent(direct)}`;
}

/**
 * Returns an EveryAyah fallback URL when the primary CDN fails.
 * All EveryAyah URLs use the surah-ayah ({surah:03d}{ayah:03d}.mp3) format.
 * Returns null if no fallback is configured for this reciter.
 */
export function getFallbackAyahAudioUrl(
  reciterId: string,
  surahNumber: number,
  ayahNumber: number
): string | null {
  const reciter = getReciterById(reciterId);
  if (!reciter.fallbackPrefix) return null;
  const s = String(surahNumber).padStart(3, "0");
  const a = String(ayahNumber).padStart(3, "0");
  return `${reciter.fallbackPrefix}/${s}${a}.mp3`;
}

// Legacy export kept for any existing tests
export type { RepeatMode };
