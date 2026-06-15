// ─── In-browser Whisper ASR ─────────────────────────────────────────────────
// Real Whisper speech recognition running CLIENT-SIDE via transformers.js — no
// server, no API key. Far more accurate on Quranic Arabic than the browser's
// Web Speech API (which is biased toward the expected text). The model is
// downloaded once (~q8 quantized, cached by the browser) and then runs offline.
//
// Flow: record audio (already done) → decode to 16 kHz mono → Whisper transcribe
// → the NW aligner turns the transcript into per-word correct/incorrect/missed.

/* eslint-disable @typescript-eslint/no-explicit-any */

// Multilingual Whisper; "base" balances accuracy vs. size/speed for Arabic.
const MODEL = "onnx-community/whisper-base";

export interface WhisperProgress {
  status: string;          // "downloading" | "loading" | "ready" | ...
  file?: string;
  progress?: number;       // 0..100
  loaded?: number;
  total?: number;
}

let transcriber: any = null;
let loadingPromise: Promise<any> | null = null;

export function isWhisperSupported(): boolean {
  return typeof window !== "undefined" &&
    typeof (window.AudioContext || (window as any).webkitAudioContext) !== "undefined";
}

/** Load (once) the Whisper pipeline. Reports download/load progress. */
export async function loadWhisper(onProgress?: (p: WhisperProgress) => void): Promise<any> {
  if (transcriber) return transcriber;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const { pipeline, env } = await import("@huggingface/transformers");
    // Allow remote model download (from the Hugging Face hub), no local models.
    env.allowLocalModels = false;
    transcriber = await pipeline("automatic-speech-recognition", MODEL, {
      dtype: "q8",                       // quantized — smaller + faster
      // WebGPU is much faster when available; fall back to WASM everywhere else.
      device: (navigator as any).gpu ? "webgpu" : "wasm",
      progress_callback: (p: any) => onProgress?.({
        status: p.status,
        file: p.file,
        progress: typeof p.progress === "number" ? Math.round(p.progress) : undefined,
        loaded: p.loaded, total: p.total,
      }),
    });
    return transcriber;
  })();

  try {
    return await loadingPromise;
  } catch (e) {
    loadingPromise = null; // allow retry on failure
    throw e;
  }
}

/** Decode an audio Blob to a 16 kHz mono Float32Array (what Whisper expects). */
async function decodeToMono16k(blob: Blob): Promise<Float32Array> {
  const arrayBuf = await blob.arrayBuffer();
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  // Requesting a 16 kHz context makes decodeAudioData resample for us where supported.
  let ctx: AudioContext;
  try { ctx = new AudioCtx({ sampleRate: 16000 }); }
  catch { ctx = new AudioCtx(); }

  const audio = await ctx.decodeAudioData(arrayBuf.slice(0));
  let data: Float32Array;
  if (audio.numberOfChannels > 1) {
    // Downmix to mono.
    const a = audio.getChannelData(0);
    const b = audio.getChannelData(1);
    data = new Float32Array(a.length);
    for (let i = 0; i < a.length; i++) data[i] = (a[i] + b[i]) / 2;
  } else {
    data = audio.getChannelData(0).slice();
  }

  // Manual resample if the context didn't honor 16 kHz.
  if (audio.sampleRate !== 16000) {
    data = resample(data, audio.sampleRate, 16000);
  }
  try { ctx.close(); } catch { /* ignore */ }
  return data;
}

function resample(input: Float32Array, from: number, to: number): Float32Array {
  if (from === to) return input;
  const ratio = from / to;
  const outLen = Math.round(input.length / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const idx = i * ratio;
    const i0 = Math.floor(idx);
    const i1 = Math.min(i0 + 1, input.length - 1);
    const frac = idx - i0;
    out[i] = input[i0] * (1 - frac) + input[i1] * frac;
  }
  return out;
}

export interface WhisperResult {
  text: string;
  words: string[];
}

/** Transcribe a recorded recitation clip to Arabic text. */
export async function transcribeRecitation(
  blob: Blob,
  onProgress?: (p: WhisperProgress) => void,
): Promise<WhisperResult> {
  const pipe = await loadWhisper(onProgress);
  onProgress?.({ status: "transcribing" });
  const audio = await decodeToMono16k(blob);
  const out = await pipe(audio, {
    language: "arabic",
    task: "transcribe",
    chunk_length_s: 30,
    return_timestamps: false,
  });
  const text = (Array.isArray(out) ? out[0]?.text : out?.text) ?? "";
  const words = text.split(/\s+/).filter(Boolean);
  return { text: text.trim(), words };
}

// ─── Whisper → authoritative per-word analysis ────────────────────────────────
// Transcribe the clip, then run the SAME tested NW aligner the live engine uses
// to produce per-expected-word correct/incorrect/missed + accuracy.

export interface WhisperAnalysis {
  ok: boolean;
  transcript: string;
  accuracy: number;
  correct: number;
  missed: number;
  words: { text: string; status: "correct" | "incorrect" | "missed"; confidence: number }[];
  error?: string;
}

export async function analyzeWithWhisper(
  blob: Blob,
  expectedText: string,
  onProgress?: (p: WhisperProgress) => void,
): Promise<WhisperAnalysis> {
  const { splitWords, alignRecitation, resolveTrailing } = await import("./reciteService");
  try {
    const expected = splitWords(expectedText);
    if (expected.length === 0) {
      return { ok: false, transcript: "", accuracy: 0, correct: 0, missed: 0, words: [], error: "no-expected-text" };
    }
    const { text, words: spoken } = await transcribeRecitation(blob, onProgress);

    const init = expected.map((_, i) => (i === 0 ? "current" : "idle")) as any;
    const res = alignRecitation(expected, init, 0, spoken);
    const resolved = resolveTrailing(res.statuses, res.cursor); // unreached → skipped (missed)

    const words = expected.map((w, i) => {
      const s = resolved[i];
      const status = s === "correct" ? "correct" : s === "incorrect" ? "incorrect" : "missed";
      return { text: w, status: status as "correct" | "incorrect" | "missed", confidence: res.confidences[i] ?? 0 };
    });
    const correct = words.filter((w) => w.status === "correct").length;
    const missed = words.filter((w) => w.status !== "correct").length;
    const accuracy = Math.round((correct / expected.length) * 100);
    onProgress?.({ status: "ready" });
    return { ok: true, transcript: text, accuracy, correct, missed, words };
  } catch (e) {
    return { ok: false, transcript: "", accuracy: 0, correct: 0, missed: 0, words: [], error: e instanceof Error ? e.message : "whisper-failed" };
  }
}
