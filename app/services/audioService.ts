import type { Reciter, RepeatMode } from "../types/quran";

// ─── Available reciters ───────────────────────────────────────────────────────
//
// Two CDN formats supported:
//   "global-ayah"  → cdn.islamic.network/quran/audio/128/{id}/{globalAyah}.mp3
//   "surah-ayah"   → everyayah.com/data/{id}/{surah:03d}{ayah:03d}.mp3

export const RECITERS: Reciter[] = [
  // ── Primary EveryAyah reciters (CORS-enabled, globally reliable) ──────────
  {
    id: "everyayah.alafasy",
    name: "Mishary Rashid Alafasy",
    arabicName: "مشاري راشد العفاسي",
    style: "murattal",
    urlPrefix: "https://everyayah.com/data/Alafasy_128kbps",
    urlFormat: "surah-ayah",
  },
  // ── Murattal – Islamic Network CDN ───────────────────────────────────────
  {
    id: "ar.alafasy",
    name: "Mishary Rashid Alafasy",
    arabicName: "مشاري راشد العفاسي",
    style: "murattal",
    urlPrefix: "https://cdn.islamic.network/quran/audio/128/ar.alafasy",
    fallbackPrefix: "https://everyayah.com/data/Alafasy_128kbps",
  },
  {
    id: "ar.abdurrahmaansudais",
    name: "Abdurrahmaan As-Sudais",
    arabicName: "عبدالرحمن السديس",
    style: "murattal",
    urlPrefix: "https://cdn.islamic.network/quran/audio/128/ar.abdurrahmaansudais",
    fallbackPrefix: "https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps",
  },
  {
    id: "ar.saoodshuraym",
    name: "Saud Al-Shuraim",
    arabicName: "سعود الشريم",
    style: "murattal",
    urlPrefix: "https://cdn.islamic.network/quran/audio/128/ar.saoodshuraym",
    fallbackPrefix: "https://everyayah.com/data/Saud_al-Ghamdi_128kbps",
  },
  {
    id: "ar.mahermuaiqly",
    name: "Maher Al-Muaiqly",
    arabicName: "ماهر المعيقلي",
    style: "murattal",
    urlPrefix: "https://cdn.islamic.network/quran/audio/128/ar.mahermuaiqly",
    fallbackPrefix: "https://everyayah.com/data/Maher_AlMuaiqly_128kbps",
  },
  {
    id: "ar.husary",
    name: "Mahmoud Khalil Al-Husary",
    arabicName: "محمود خليل الحصري",
    style: "murattal",
    urlPrefix: "https://cdn.islamic.network/quran/audio/128/ar.husary",
    fallbackPrefix: "https://everyayah.com/data/Husary_128kbps",
  },
  {
    id: "ar.minshawi",
    name: "Mohamed El-Minshawi",
    arabicName: "محمد صديق المنشاوي",
    style: "murattal",
    urlPrefix: "https://cdn.islamic.network/quran/audio/128/ar.minshawi",
    fallbackPrefix: "https://everyayah.com/data/Minshawy_Murattal_128kbps",
  },
  {
    id: "ar.shaatree",
    name: "Abu Bakr Ash-Shaatree",
    arabicName: "أبو بكر الشاطري",
    style: "murattal",
    urlPrefix: "https://cdn.islamic.network/quran/audio/128/ar.shaatree",
    fallbackPrefix: "https://everyayah.com/data/Abu_Bakr_Ash-Shaatree_128kbps",
  },
  {
    id: "ar.ahmedajamy",
    name: "Ahmed Al-Ajamy",
    arabicName: "أحمد بن علي العجمي",
    style: "murattal",
    urlPrefix: "https://cdn.islamic.network/quran/audio/128/ar.ahmedajamy",
    fallbackPrefix: "https://everyayah.com/data/Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah",
  },
  {
    id: "ar.hanirifai",
    name: "Hani Ar-Rifai",
    arabicName: "هاني الرفاعي",
    style: "murattal",
    urlPrefix: "https://cdn.islamic.network/quran/audio/128/ar.hanirifai",
    fallbackPrefix: "https://everyayah.com/data/Hani_Rifai_192kbps",
  },
  {
    id: "ar.hudhaify",
    name: "Ali Al-Huthaify",
    arabicName: "علي الحذيفي",
    style: "murattal",
    urlPrefix: "https://cdn.islamic.network/quran/audio/128/ar.hudhaify",
    fallbackPrefix: "https://everyayah.com/data/Ali_Alhuthaify_128kbps",
  },
  {
    id: "ar.muhammadayyoub",
    name: "Muhammad Ayyoub",
    arabicName: "محمد أيوب",
    style: "murattal",
    urlPrefix: "https://cdn.islamic.network/quran/audio/128/ar.muhammadayyoub",
    fallbackPrefix: "https://everyayah.com/data/Muhammad_Ayyoub_128kbps",
  },
  {
    id: "ar.muhammadjibreel",
    name: "Muhammad Jibreel",
    arabicName: "محمد جبريل",
    style: "murattal",
    urlPrefix: "https://cdn.islamic.network/quran/audio/128/ar.muhammadjibreel",
    fallbackPrefix: "https://everyayah.com/data/Muhammad_Jibreel_128kbps",
  },
  {
    id: "ar.abdullahbasfar",
    name: "Abdullah Basfar",
    arabicName: "عبدالله بصفر",
    style: "murattal",
    urlPrefix: "https://cdn.islamic.network/quran/audio/128/ar.abdullahbasfar",
    fallbackPrefix: "https://everyayah.com/data/Abdullah_Basfar_128kbps",
  },
  {
    id: "ar.ibrahimakhbar",
    name: "Ibrahim Al-Akhdar",
    arabicName: "إبراهيم الأخضر",
    style: "murattal",
    urlPrefix: "https://cdn.islamic.network/quran/audio/128/ar.ibrahimakhbar",
    fallbackPrefix: "https://everyayah.com/data/Ibrahim_Akhdar_128kbps",
  },
  {
    id: "ar.parhizgar",
    name: "Nasser Al-Qatami",
    arabicName: "ناصر القطامي",
    style: "murattal",
    urlPrefix: "https://cdn.islamic.network/quran/audio/128/ar.parhizgar",
    fallbackPrefix: "https://everyayah.com/data/Nasser_Alqatami_128kbps",
  },
  // ── Mujawwad – Islamic Network CDN ───────────────────────────────────────
  {
    id: "ar.minshawimujawwad",
    name: "El-Minshawi (Mujawwad)",
    arabicName: "المنشاوي (مجوّد)",
    style: "mujawwad",
    urlPrefix: "https://cdn.islamic.network/quran/audio/128/ar.minshawimujawwad",
    fallbackPrefix: "https://everyayah.com/data/Minshawy_Mujawwad_128kbps",
  },
  {
    id: "ar.abdulsamad",
    name: "Abdul Basit Abdul Samad (Mujawwad)",
    arabicName: "عبد الباسط عبد الصمد (مجوّد)",
    style: "mujawwad",
    urlPrefix: "https://cdn.islamic.network/quran/audio/128/ar.abdulsamad",
    fallbackPrefix: "https://everyayah.com/data/Abdul_Basit_Mujawwad_128kbps",
  },
  // ── EveryAyah CDN (surah+ayah URL format) ────────────────────────────────
  {
    id: "everyayah.husary-mujawwad",
    name: "Al-Husary (Mujawwad)",
    arabicName: "الحصري (مجوّد)",
    style: "mujawwad",
    urlPrefix: "https://everyayah.com/data/Husary_128kbps_Mujawwad",
    urlFormat: "surah-ayah",
  },
  {
    id: "everyayah.tablawy",
    name: "Mohammad Al-Tablawi",
    arabicName: "محمد الطبلاوي",
    style: "murattal",
    urlPrefix: "https://everyayah.com/data/Mohammad_al_Tablawi_128kbps",
    urlFormat: "surah-ayah",
  },
  {
    id: "everyayah.khalil",
    name: "Khalil Al-Husary (Muallim)",
    arabicName: "خليل الحصري (معلم)",
    style: "murattal",
    urlPrefix: "https://everyayah.com/data/khalil_al_husary_128kbps",
    urlFormat: "surah-ayah",
  },
  {
    id: "everyayah.ali-sufi",
    name: "Ali Sufi",
    arabicName: "علي الصوفي",
    style: "murattal",
    urlPrefix: "https://everyayah.com/data/Ali_Alhuthaify_128kbps",
    urlFormat: "surah-ayah",
  },
  {
    id: "everyayah.noreen",
    name: "Noreen Muhammad Siddiq",
    arabicName: "نورين محمد صديق",
    style: "murattal",
    urlPrefix: "https://everyayah.com/data/Noreen_Mohammed_Siddiq_192kbps",
    urlFormat: "surah-ayah",
  },
  {
    id: "everyayah.saad-ghamdi",
    name: "Saad Al-Ghamdi",
    arabicName: "سعد الغامدي",
    style: "murattal",
    urlPrefix: "https://everyayah.com/data/Saad_al-Ghamdi_128kbps",
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
