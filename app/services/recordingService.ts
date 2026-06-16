// ─── Voice Recording History ───────────────────────────────────────────────
// Captures recitation audio with MediaRecorder and stores clips in IndexedDB
// (large binary, stays on-device — private by default, works offline).
// Powers Voice Recording History (#9) and Recitation Comparison (#10).
// No backend, no API key. When the audio-ML scoring engine lands, these same
// blobs feed straight into it (see docs/TAJWEED_AUDIO_ML_PLAN.md).

const DB_NAME = "noor-recordings";
const STORE = "clips";
const DB_VERSION = 1;

export interface RecordingMeta {
  id: string;
  surah: number;
  surahName: string;
  date: number;        // timestamp
  durationMs: number;
  accuracy: number;    // from the recite session, 0–100
  correct: number;
  incorrect: number;
  skipped: number;
  mimeType: string;
  silent?: boolean;   // true if no audio level was detected during capture
}

export interface RecordingRecord extends RecordingMeta {
  blob: Blob;
}

// ─── IndexedDB plumbing ───────────────────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("no-indexeddb"));
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const os = db.createObjectStore(STORE, { keyPath: "id" });
        os.createIndex("date", "date");
        os.createIndex("surah", "surah");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveRecording(rec: RecordingRecord): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(rec);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function listRecordings(): Promise<RecordingMeta[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      const recs = (req.result as RecordingRecord[])
        .map(({ blob, ...meta }) => meta) // eslint-disable-line @typescript-eslint/no-unused-vars
        .sort((a, b) => b.date - a.date);
      resolve(recs);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getRecording(id: string): Promise<RecordingRecord | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve((req.result as RecordingRecord) ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteRecording(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getObjectURL(id: string): Promise<string | null> {
  const rec = await getRecording(id);
  if (!rec) return null;
  return URL.createObjectURL(rec.blob);
}

// ─── MediaRecorder controller ─────────────────────────────────────────────────
// Records from the mic alongside the Web Speech recognizer (they can share the
// mic). Call start() when recitation begins, stop() to get the blob.

export function isRecordingSupported(): boolean {
  return typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia;
}

function pickMimeType(): string {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
  for (const c of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c)) return c;
  }
  return "";
}

export class RecitationRecorder {
  private recorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private startedAt = 0;
  private mimeType = "";

  private silent = false;

  /** True if the captured audio looked silent (helps surface a mic problem). */
  wasSilent(): boolean { return this.silent; }

  async start(): Promise<void> {
    if (!isRecordingSupported()) throw new Error("recording-unsupported");
    // Raw capture: disable echo-cancel / noise-suppression / auto-gain. These
    // processors — especially when the browser's speech recognizer is also using
    // the mic — can gate quiet recitation down to silence on Windows.
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: 1,
      } as MediaTrackConstraints,
    });
    this.mimeType = pickMimeType();
    this.chunks = [];
    this.silent = false;
    this.startLevelMonitor(this.stream);
    this.recorder = new MediaRecorder(this.stream, this.mimeType ? { mimeType: this.mimeType } : undefined);
    this.recorder.ondataavailable = (e) => { if (e.data.size > 0) this.chunks.push(e.data); };
    this.recorder.start(1000); // collect in 1s chunks so we never lose everything
    this.startedAt = Date.now();
  }

  /** Stop and return the recorded blob + duration. Releases the mic. */
  stop(): Promise<{ blob: Blob; durationMs: number; mimeType: string } | null> {
    return new Promise((resolve) => {
      const rec = this.recorder;
      if (!rec || rec.state === "inactive") { this.cleanup(); return resolve(null); }
      rec.onstop = () => {
        const blob = new Blob(this.chunks, { type: this.mimeType || "audio/webm" });
        const durationMs = Date.now() - this.startedAt;
        this.cleanup();
        resolve(blob.size > 0 ? { blob, durationMs, mimeType: this.mimeType || "audio/webm" } : null);
      };
      rec.stop();
    });
  }

  private audioCtx: AudioContext | null = null;
  private rafId: number | null = null;

  /** Watch the input level; if it never rises above a tiny floor, the mic was
   * effectively silent (wrong device, muted, or grabbed by speech recognition). */
  private startLevelMonitor(stream: MediaStream) {
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext; // eslint-disable-line @typescript-eslint/no-explicit-any
      this.audioCtx = new AC();
      const src = this.audioCtx.createMediaStreamSource(stream);
      const analyser = this.audioCtx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      const buf = new Uint8Array(analyser.fftSize);
      let peak = 0;
      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        for (let i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs(buf[i] - 128));
        this.silent = peak < 3; // ~zero deflection over the whole take = silence
        this.rafId = requestAnimationFrame(tick);
      };
      tick();
    } catch { /* monitor is best-effort */ }
  }

  private cleanup() {
    if (this.rafId != null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    try { this.audioCtx?.close(); } catch { /* ignore */ }
    this.audioCtx = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.recorder = null;
  }
}

export function fmtDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}
