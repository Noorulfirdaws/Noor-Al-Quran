# Audio-ML Backend — Real Tajweed & Pronunciation Scoring

> Scoping doc for the features the current Web Speech API **cannot** deliver
> honestly: tajweed scoring, pronunciation accuracy vs. elite reciters,
> waveform comparison, madd/elongation timing, breath & focus analysis.

## Why the current approach can't do it

The browser `SpeechRecognition` API returns **text only** — a best-guess
transcription of Arabic words. From text we can detect *which words* were
right, wrong, or skipped (this is what powers the existing AI recitation
engine, and it works well). But text carries **none** of the acoustic
information tajweed depends on:

| Feature | Needs | Available from Web Speech? |
|---|---|---|
| Word correctness | word identity | ✅ yes (already shipped) |
| Madd / elongation length | phoneme **duration** (ms) | ❌ no |
| Ghunnah (nasalization) | spectral nasal energy | ❌ no |
| Qalqalah (echo on قطب جد) | onset/burst envelope | ❌ no |
| Ikhfa / Idgham / Iqlab | inter-phoneme transitions | ❌ no |
| Tafkheem / Tarqeeq | formant frequencies (heavy vs light) | ❌ no |
| Letter articulation (ض, ظ, ع…) | per-phoneme acoustic match | ❌ no |
| Voice similarity to a reciter | full audio embedding | ❌ no |
| Breath control | silence/energy gaps + pitch contour | ❌ no |

To score these we must capture the **raw audio waveform** and run signal
processing + an acoustic model. That requires a backend (or on-device WASM
model) — it cannot be faked from a text transcript without lying to the user.

## Architecture options

### Option A — Forced alignment + DSP (no external API, best accuracy/cost)
The strongest fit for tajweed because rules are **deterministic acoustic
events** at known positions, not open-ended "AI."

```
Browser (MediaRecorder) ──16kHz PCM──▶  /api/recite/score  (Node/Python)
                                              │
                    1. Forced alignment (Montreal Forced Aligner / wav2vec2-CTC
                       fine-tuned on Quranic Arabic) → phoneme timestamps
                    2. DSP feature extraction per phoneme:
                         • duration (madd)        • nasal energy (ghunnah)
                         • burst envelope (qalqalah)
                         • formants F1–F3 (tafkheem/tarqeeq)
                    3. Rule engine compares measured values to tajweed norms
                       (madd ≈ 2/4/6 harakat, ghunnah ≥ N ms, …)
                    4. Category scores + per-ayah feedback
                                              │
                              ◀── JSON: { tajweedScore, categories[], notes[] }
```
- **Pros:** explainable ("your madd in verse 7 was 1.1 harakat, aim for 2"),
  no per-request LLM cost, rules grounded in actual tajweed.
- **Cons:** need a Quranic-Arabic acoustic model; MFA setup; ~1–3 s latency.
- **Models:** `wav2vec2-large-xlsr-53-arabic` fine-tuned, or `tarteel-ai/whisper-base-ar-quran` (open) for alignment.

### Option B — Pronunciation similarity vs. reference reciter
For "voice similarity / letter accuracy" metrics and the waveform compare UI.

```
1. Pull reference ayah audio (EveryAyah — already integrated)
2. Extract MFCC / wav2vec2 embeddings for both user + reference
3. DTW (dynamic time warping) align the two sequences
4. Per-segment cosine distance → letter/word accuracy heatmap
5. Render both waveforms with the DTW path overlaid
```
- **Pros:** directly produces the "comparison waveform" mockup; intuitive.
- **Cons:** reciter voice ≠ user voice, so normalize for pitch/timbre or it
  punishes a deep voice vs. a light one. Similarity ≠ correctness.

### Option C — Hosted ASR + LLM judge (fastest to ship, ongoing cost)
- Send audio to a hosted Quran ASR (Tarteel API if available, or Whisper),
  get word timings, feed timings + transcript to an LLM for narrative feedback.
- **Pros:** least infra. **Cons:** per-request cost, weaker on fine acoustic
  tajweed (LLM can't hear formants), needs an API key.

## Recommended path

1. **Phase B1 — Recording + storage.** Add `MediaRecorder` capture to recite
   mode, store clips in IndexedDB (offline) → powers **Voice Recording History**
   and **Recitation Comparison** (features #9, #10) with *zero* ML. Replay,
   re-listen, compare-by-ear ships immediately and is already valuable.
2. **Phase B2 — Option B similarity.** DTW vs. reference reciter for the
   waveform-compare UI + a rough pronunciation score. Honest if labeled
   "similarity," not "correctness."
3. **Phase B3 — Option A tajweed engine.** The real prize. Forced alignment +
   DSP rule engine for true category scores (ghunnah/madd/qalqalah…). Gate as
   the flagship **Premium** feature.

## What I need to proceed

- [ ] **Decision:** self-host (Option A, needs a Python service + GPU/CPU box —
      Railway already hosts the NoorAcademie API, could co-locate) **or** hosted
      API (Option C, needs an API key + budget).
- [ ] **API key(s)** if going hosted (Tarteel / OpenAI Whisper / etc.).
- [ ] Confirm we can store user audio clips (privacy: keep on-device in
      IndexedDB by default; only upload for scoring, never persist server-side
      without consent).

## Ship-now slice (no backend, no key)

Phase **B1** needs none of the above. I can add audio recording, replay, and
by-ear session comparison to recite mode today — real value toward features
#9 and #10 — while the acoustic-scoring decision is made. Say the word.
