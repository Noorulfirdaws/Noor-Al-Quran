"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import {
  listRecordings, getObjectURL, getRecording, deleteRecording, fmtDuration,
  type RecordingMeta,
} from "../services/recordingService";
import { Mic, Play, Pause, Trash2, GitCompare, X, Calendar, Clock, Sparkles, Loader2 } from "lucide-react";
import { isWhisperSupported, analyzeWithWhisper, type WhisperProgress } from "../services/whisperService";
import { getSurah } from "../services/quranService";

export default function RecordingsPage() {
  const [recs, setRecs] = useState<RecordingMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [compare, setCompare] = useState<string[]>([]); // ids selected for comparison

  const refresh = useCallback(() => {
    listRecordings().then((r) => { setRecs(r); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const toggleCompare = (id: string) => {
    setCompare((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : [prev[1], id]
    );
  };

  const onDelete = async (id: string) => {
    await deleteRecording(id);
    setCompare((p) => p.filter((x) => x !== id));
    refresh();
  };

  const compareRecs = compare.map((id) => recs.find((r) => r.id === id)).filter(Boolean) as RecordingMeta[];

  return (
    <div className="min-h-screen bg-[#050907] text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-20">

        <div className="mb-8">
          <p className="text-[#57d996] text-[11px] font-bold tracking-widest uppercase mb-1">Voice History</p>
          <h1 className="text-3xl font-black">My Recordings</h1>
          <p className="text-white/40 text-sm mt-1">
            Every recitation is recorded privately on your device. Replay it, hear your progress, and compare two
            sessions side by side. Nothing leaves your browser.
          </p>
        </div>

        {/* Compare bar */}
        {compareRecs.length === 2 && (
          <CompareView recs={compareRecs} onClose={() => setCompare([])} />
        )}
        {compareRecs.length === 1 && (
          <div className="mb-4 bg-[#57d996]/8 border border-[#57d996]/20 rounded-2xl p-3 flex items-center gap-2 text-sm">
            <GitCompare size={15} className="text-[#57d996]" />
            <span className="text-white/60">Select one more recording to compare.</span>
            <button onClick={() => setCompare([])} className="ml-auto text-white/40 hover:text-white"><X size={14} /></button>
          </div>
        )}

        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-2xl" />)}
          </div>
        ) : recs.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {recs.map((r) => (
              <RecordingRow
                key={r.id}
                rec={r}
                selected={compare.includes(r.id)}
                onToggleCompare={() => toggleCompare(r.id)}
                onDelete={() => onDelete(r.id)}
              />
            ))}
          </div>
        )}

        <div className="mt-6">
          <Link href="/quran/1?recite=1" className="inline-flex items-center gap-2 bg-[#57d996] text-black font-black px-6 py-3 rounded-full text-sm hover:bg-[#6ff2a8] transition-all">
            <Mic size={15} /> Record a Recitation
          </Link>
        </div>
      </div>
    </div>
  );
}

function RecordingRow({ rec, selected, onToggleCompare, onDelete }: {
  rec: RecordingMeta; selected: boolean; onToggleCompare: () => void; onDelete: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const togglePlay = async () => {
    if (playing && audio) { audio.pause(); setPlaying(false); return; }
    let u = url;
    if (!u) { u = await getObjectURL(rec.id); setUrl(u); }
    if (!u) return;
    const a = audio ?? new Audio(u);
    a.onended = () => setPlaying(false);
    setAudio(a);
    a.play();
    setPlaying(true);
  };

  const accColor = rec.accuracy >= 80 ? "text-green-400" : rec.accuracy >= 60 ? "text-yellow-400" : "text-red-400";

  // ── Verify with AI (in-browser Whisper) on this saved clip ──
  const [verifying, setVerifying] = useState(false);
  const [vMsg, setVMsg] = useState("");
  const [vResult, setVResult] = useState<{ accuracy: number; correct: number; missed: number; transcript: string; words: { text: string; status: string }[] } | null>(null);
  const [vError, setVError] = useState("");

  const verify = async () => {
    if (!isWhisperSupported()) { setVError("AI verification isn't supported on this browser."); return; }
    setVerifying(true); setVError(""); setVResult(null);
    try {
      const full = await getRecording(rec.id);
      if (!full) { setVError("Recording unavailable."); return; }
      const surah = await getSurah(rec.surah);
      const expected = surah.ayahs.map((a) => a.text).join(" ");
      const w = await analyzeWithWhisper(full.blob, expected, (p: WhisperProgress) => {
        if (p.status === "transcribing") setVMsg("Listening to your recitation…");
        else if (typeof p.progress === "number") setVMsg(`Downloading AI model… ${p.progress}% (one-time)`);
        else setVMsg("Loading AI…");
      });
      setVMsg("");
      if (!w.ok) { setVError("Could not analyze this recording. Make sure it has audio."); return; }
      setVResult({ accuracy: w.accuracy, correct: w.correct, missed: w.missed, transcript: w.transcript, words: w.words });
    } catch {
      setVError("AI verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  return (
   <div className="space-y-0">
    <div className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
      selected ? "bg-[#57d996]/10 border-[#57d996]/30" : "bg-white/4 border-white/8"
    }`}>
      <button
        onClick={togglePlay}
        className="w-11 h-11 rounded-full bg-[#57d996]/15 hover:bg-[#57d996]/25 border border-[#57d996]/30 flex items-center justify-center text-[#57d996] flex-shrink-0 transition-all"
      >
        {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-bold truncate">{rec.surahName}</p>
        <div className="flex items-center gap-3 text-white/35 text-[11px] mt-0.5">
          <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(rec.date).toLocaleDateString()}</span>
          <span className="flex items-center gap-1"><Clock size={10} /> {fmtDuration(rec.durationMs)}</span>
        </div>
      </div>

      <div className={`text-right flex-shrink-0 ${accColor}`}>
        <p className="font-black text-lg leading-none">{rec.accuracy}%</p>
        <p className="text-[9px] text-white/30 mt-0.5">accuracy</p>
      </div>

      <button
        onClick={verify}
        disabled={verifying}
        title="Verify with AI (real Whisper)"
        className="p-2 rounded-lg flex-shrink-0 text-[#18c8d8] hover:bg-[#18c8d8]/10 transition-all disabled:opacity-50"
      >
        {verifying ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
      </button>
      <button
        onClick={onToggleCompare}
        title="Compare"
        className={`p-2 rounded-lg flex-shrink-0 transition-all ${selected ? "bg-[#57d996]/20 text-[#57d996]" : "text-white/30 hover:text-white hover:bg-white/8"}`}
      >
        <GitCompare size={15} />
      </button>
      <button onClick={onDelete} title="Delete" className="p-2 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-400/10 flex-shrink-0 transition-all">
        <Trash2 size={15} />
      </button>
    </div>

    {/* AI verify status / result */}
    {(verifying || vResult || vError) && (
      <div className="mt-1.5 mx-1 bg-[#18c8d8]/8 border border-[#18c8d8]/20 rounded-xl p-3">
        {verifying && (
          <p className="text-[#18c8d8] text-xs flex items-center gap-2">
            <Loader2 size={13} className="animate-spin" /> {vMsg || "Analyzing…"}
          </p>
        )}
        {vError && <p className="text-red-400/80 text-xs">{vError}</p>}
        {vResult && (
          <>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[#18c8d8] font-bold uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={11} /> AI-Verified
              </span>
              <span className={`font-black text-sm ${vResult.accuracy >= 80 ? "text-green-400" : vResult.accuracy >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                {vResult.accuracy}%
              </span>
            </div>
            <p className="text-white/40 text-[11px] mb-2">{vResult.correct} correct · {vResult.missed} to review</p>
            {vResult.transcript && (
              <p className="text-white/35 text-[11px] mb-2" dir="rtl" style={{ fontFamily: "var(--font-quran), serif" }}>
                Heard: {vResult.transcript}
              </p>
            )}
            {vResult.words.some((w) => w.status !== "correct") && (
              <div className="flex flex-wrap gap-1.5" dir="rtl">
                {vResult.words.filter((w) => w.status !== "correct").slice(0, 12).map((w, i) => (
                  <span key={i} className={`px-2 py-0.5 rounded text-sm font-bold ${w.status === "missed" ? "text-yellow-400 bg-yellow-400/10" : "text-red-400 bg-red-400/10"}`}
                    style={{ fontFamily: "var(--font-quran), serif" }}>{w.text}</span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    )}
   </div>
  );
}

function CompareView({ recs, onClose }: { recs: RecordingMeta[]; onClose: () => void }) {
  const [a, b] = recs;
  // Order chronologically so "then" vs "now" reads naturally
  const [older, newer] = a.date <= b.date ? [a, b] : [b, a];
  const diff = (k: "accuracy" | "correct" | "incorrect" | "skipped") => newer[k] - older[k];

  const metric = (label: string, key: "accuracy" | "correct" | "incorrect" | "skipped", suffix = "", goodUp = true) => {
    const d = diff(key);
    const improved = goodUp ? d > 0 : d < 0;
    const worse = goodUp ? d < 0 : d > 0;
    return (
      <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
        <span className="text-white/50 text-xs">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-white/40 text-xs font-mono w-12 text-right">{older[key]}{suffix}</span>
          <span className="text-white/20">→</span>
          <span className="text-white text-xs font-mono w-12 text-right">{newer[key]}{suffix}</span>
          <span className={`text-[11px] font-bold w-12 text-right ${improved ? "text-green-400" : worse ? "text-red-400" : "text-white/30"}`}>
            {d > 0 ? "+" : ""}{d}{suffix}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-5 bg-white/5 border border-[#57d996]/20 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <GitCompare size={15} className="text-[#57d996]" />
        <p className="text-white font-bold text-sm">Comparison</p>
        <button onClick={onClose} className="ml-auto text-white/40 hover:text-white"><X size={15} /></button>
      </div>
      <div className="flex items-center justify-between text-[10px] text-white/30 mb-2 px-1">
        <span>{older.surahName}</span>
        <div className="flex gap-3">
          <span className="w-12 text-right">{new Date(older.date).toLocaleDateString()}</span>
          <span className="w-4" />
          <span className="w-12 text-right">{new Date(newer.date).toLocaleDateString()}</span>
          <span className="w-12 text-right">change</span>
        </div>
      </div>
      {metric("Accuracy", "accuracy", "%")}
      {metric("Correct words", "correct")}
      {metric("Missed words", "incorrect", "", false)}
      {metric("Skipped words", "skipped", "", false)}
      <p className="text-white/30 text-[11px] mt-3 leading-relaxed">
        {diff("accuracy") > 0
          ? `Masha'Allah — your accuracy improved by ${diff("accuracy")}% between these sessions. Keep going!`
          : diff("accuracy") < 0
          ? `Accuracy dipped ${Math.abs(diff("accuracy"))}% — revisit the words marked red and try again.`
          : "Accuracy held steady. Consistency is the foundation of strong Hifz."}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🎙️</div>
      <h2 className="text-white font-black text-xl mb-2">No recordings yet</h2>
      <p className="text-white/40 text-sm mb-6 max-w-xs mx-auto">
        Enter Recite mode on any surah and your recitation is automatically recorded — privately, on your device.
      </p>
      <Link href="/quran/1?recite=1" className="inline-flex items-center gap-2 bg-[#57d996] text-black font-black px-6 py-3 rounded-full text-sm hover:bg-[#6ff2a8] transition-all">
        <Mic size={15} /> Recite Al-Fatiha
      </Link>
    </div>
  );
}
