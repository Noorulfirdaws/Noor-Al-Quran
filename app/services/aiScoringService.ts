// ─── Hosted AI scoring client ──────────────────────────────────────────────
// Thin client for POST /api/recite/score. The route returns configured:false
// (and costs nothing) until OPENAI_API_KEY is set, so the UI can always call
// it safely and fall back to the free on-device engine.

export interface TajweedScore {
  overall: number | null;
  categories: Record<string, number>; // e.g. { madd: 88, ghunnah: 92, fluency: 80 }
  details?: string[];                  // per-letter Phase-3 notes (clipped/short madd)
}

export interface ScoreResult {
  configured: boolean;
  transcript?: string;
  feedback?: string;
  tajweedNotes?: string[];
  tajweed?: TajweedScore | null;
  message?: string;
  error?: string;
}

export async function scoreRecitation(
  blob: Blob,
  expected: string,
  surah: number,
  ayah: number,
): Promise<ScoreResult> {
  const form = new FormData();
  form.append("audio", blob, "recitation.webm");
  form.append("expected", expected);
  form.append("surah", String(surah));
  form.append("ayah", String(ayah));

  try {
    const res = await fetch("/api/recite/score", { method: "POST", body: form });
    return (await res.json()) as ScoreResult;
  } catch (err) {
    return { configured: false, error: err instanceof Error ? err.message : "network error" };
  }
}
