import type { Reciter, RepeatMode } from "../types/quran";

// ─── Available reciters ───────────────────────────────────────────────────────

export const RECITERS: Reciter[] = [
  {
    id: "ar.alafasy",
    name: "Mishary Rashid Alafasy",
    arabicName: "مشاري راشد العفاسي",
    style: "murattal",
    urlPrefix: "https://cdn.islamic.network/quran/audio/128/ar.alafasy",
  },
  {
    id: "ar.abdurrahmaansudais",
    name: "Abdurrahmaan As-Sudais",
    arabicName: "عبدالرحمن السديس",
    style: "murattal",
    urlPrefix: "https://cdn.islamic.network/quran/audio/128/ar.abdurrahmaansudais",
  },
  {
    id: "ar.minshawi",
    name: "Mohamed El-Minshawi",
    arabicName: "محمد المنشاوي",
    style: "murattal",
    urlPrefix: "https://cdn.islamic.network/quran/audio/128/ar.minshawi",
  },
  {
    id: "ar.husary",
    name: "Mahmoud Khalil Al-Husary",
    arabicName: "محمود خليل الحصري",
    style: "murattal",
    urlPrefix: "https://cdn.islamic.network/quran/audio/128/ar.husary",
  },
  {
    id: "ar.shaatree",
    name: "Abu Bakr Ash-Shaatree",
    arabicName: "أبو بكر الشاطري",
    style: "murattal",
    urlPrefix: "https://cdn.islamic.network/quran/audio/128/ar.shaatree",
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

export function getAyahAudioUrl(
  reciterId: string,
  surahNumber: number,
  ayahNumber: number
): string {
  const reciter = getReciterById(reciterId);
  const globalNumber = toGlobalAyah(surahNumber, ayahNumber);
  return `${reciter.urlPrefix}/${globalNumber}.mp3`;
}

// Legacy export kept for any existing tests
export type { RepeatMode };
