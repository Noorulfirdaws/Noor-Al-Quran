import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/recite/score
 *
 * Hosted AI recitation scoring (audio plan Option C — see
 * docs/TAJWEED_AUDIO_ML_PLAN.md). Accepts an audio clip + the expected ayah
 * text, runs Whisper for a transcript, then asks an LLM for concise tajweed/
 * fluency feedback.
 *
 * Cost control lives on the CLIENT (quotaService: Free 5 / Premium 50 per
 * month). This route is the spend surface, so it also refuses to run unless a
 * key is configured, keeping spend at exactly $0 until you opt in.
 *
 * ── Setup (when you're ready) ────────────────────────────────────────────────
 *   Set ONE env var on Railway (or .env.local for local dev):
 *     OPENAI_API_KEY=sk-...
 *   No code change needed — drop the key in and this route goes live.
 *
 * Request: multipart/form-data
 *   audio:    Blob   (the recitation clip)
 *   expected: string (expected ayah text, Arabic)
 *   surah:    string (number, for the prompt context)
 *   ayah:     string (number)
 *
 * Response: { configured, transcript, feedback, tajweedNotes[] }
 */

export const runtime = "nodejs";

const OPENAI = "https://api.openai.com/v1";

export async function POST(req: NextRequest) {
  const key = process.env.OPENAI_API_KEY;

  // Hard guard: no key → no spend. UI falls back to the free on-device engine.
  if (!key) {
    return NextResponse.json(
      {
        configured: false,
        message:
          "AI scoring is not configured yet. Add OPENAI_API_KEY to enable hosted tajweed feedback. " +
          "The free on-device word-by-word engine is unaffected.",
      },
      { status: 200 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data." }, { status: 400 });
  }

  const audio = form.get("audio");
  const expected = String(form.get("expected") ?? "");
  const surah = String(form.get("surah") ?? "");
  const ayah = String(form.get("ayah") ?? "");

  if (!(audio instanceof Blob)) {
    return NextResponse.json({ error: "Missing audio file." }, { status: 400 });
  }
  // Guard against oversized clips (cost + abuse). ~25 MB is Whisper's limit.
  if (audio.size > 25 * 1024 * 1024) {
    return NextResponse.json({ error: "Audio too large (max 25 MB)." }, { status: 413 });
  }

  try {
    // ── 1. Transcribe with Whisper (Arabic) ──
    const whisperForm = new FormData();
    whisperForm.append("file", audio, "recitation.webm");
    whisperForm.append("model", "whisper-1");
    whisperForm.append("language", "ar");
    whisperForm.append("response_format", "json");

    const wRes = await fetch(`${OPENAI}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: whisperForm,
    });

    if (!wRes.ok) {
      const detail = await wRes.text().catch(() => "");
      return NextResponse.json({ error: "Transcription failed.", detail: detail.slice(0, 300) }, { status: 502 });
    }
    const { text: transcript } = (await wRes.json()) as { text: string };

    // ── 2. LLM feedback (concise, teacher tone) ──
    const sys =
      "You are an expert Quran recitation teacher (a Qari) giving concise, encouraging tajweed feedback. " +
      "Compare the student's transcribed recitation to the expected ayah. Be specific but brief. " +
      "Never invent errors the transcript doesn't support. Respond as strict JSON only.";
    const user =
      `Surah ${surah}, Ayah ${ayah}.\n` +
      `Expected ayah (Arabic): ${expected}\n` +
      `Student recitation (transcribed): ${transcript}\n\n` +
      `Return JSON: { "feedback": "<2 sentences max, warm teacher tone>", ` +
      `"tajweedNotes": ["<short note>", "..."] (0-3 items, only if clearly supported) }`;

    const cRes = await fetch(`${OPENAI}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini", // cheapest capable model — keeps per-call cost ~$0.002
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 250,
      }),
    });

    if (!cRes.ok) {
      // Transcript still useful even if the feedback call fails.
      return NextResponse.json({ configured: true, transcript, feedback: "", tajweedNotes: [] }, { status: 200 });
    }

    const cJson = (await cRes.json()) as { choices: { message: { content: string } }[] };
    let feedback = "";
    let tajweedNotes: string[] = [];
    try {
      const parsed = JSON.parse(cJson.choices[0]?.message?.content ?? "{}");
      feedback = String(parsed.feedback ?? "");
      tajweedNotes = Array.isArray(parsed.tajweedNotes) ? parsed.tajweedNotes.slice(0, 3).map(String) : [];
    } catch { /* keep transcript-only response */ }

    return NextResponse.json({ configured: true, transcript, feedback, tajweedNotes }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Scoring failed.", detail: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}
