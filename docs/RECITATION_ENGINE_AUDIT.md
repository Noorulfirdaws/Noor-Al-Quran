# Recitation Engine Audit — Trust-Critical Findings

The product promise is **reliable AI mistake detection**. This audit maps the
pipeline and ranks every weakness by trust impact.

## Pipeline

```
Mic → Web Speech API (ar-SA, continuous, interim+final, 5 alts)
    → onresult → final transcript + alternatives
    → alignRecitation() (greedy, lookahead=3)  ← MISTAKE DETECTION
    → advanceCursor() → statuses[] + cursor
    → completion = (cursor >= totalWords)
    → RecitationSummary (stats, XP, tajweed)
```

## Findings (ranked by trust impact)

### 🔴 P0 — Premature stop / lost audio on restart
`createRecognition`: on `onend` it rebuilds + restarts after a **200 ms gap**.
Chrome ends recognition after a short silence (a breath, a pause for tajweed),
and **any speech during that 200 ms gap is lost** — words vanish and get marked
skipped/incorrect. On mobile, Web Speech often returns one result then ends,
so the gap hits constantly. *Symptom #1, #7, #9.*

### 🔴 P0 — Greedy aligner breaks on repeated / similar verses
`alignRecitation` is greedy with a 3-word lookahead. On repeated phrases
(e.g. فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ in Ar-Rahman, or الۤمۤ openings) a
spoken phrase can match a *later* occurrence, making the cursor jump and
marking a whole run as wrongly skipped. Greedy ≠ optimal. *Symptom #4, #5, #6.*

### 🔴 P0 — Completion is just `cursor >= total`
No completion engine. Two failure modes:
- **False completion**: if the aligner over-advances (above), cursor hits the
  end early → analysis finalizes mid-ayah. *Symptom #2.*
- **Never completes**: if ASR drops the final words, cursor never reaches the
  end → the session hangs, last words stuck "current". *Symptom #2, #9.*
No "ayah completion score", no incomplete-recitation detection. *Symptom #10.*

### 🟠 P1 — No confidence scoring
`compareWord` returns a boolean. Every error is asserted as fact — no
"possible mistake" vs "mistake". Fuzzy 1–2 edit matches are treated identically
to exact matches. Drives **false positives**, the #1 trust killer. *Symptom #8.*

### 🟠 P1 — Trailing words never scored on stop
When the user stops mid-ayah, remaining `idle`/`current` words are never
resolved — they're neither skipped nor flagged incomplete. Accuracy math
ignores them, so a half-recited ayah can show 100%. *Symptom #3, #5.*

### 🟡 P2 — Normalization gaps
`normalizeArabic` is decent but doesn't collapse common ASR variants (e.g.
أل-prefix spacing, Arabic-Indic digits, elongation repeats). Minor.

## Fix plan (this PR)

1. **Robust alignment** — replace greedy with **Needleman-Wunsch** global
   alignment over a bounded window. Optimal handling of skip/insert/substitute/
   repeat; stable on similar verses. (Phase 3)
2. **Per-word confidence** — similarity score 0–1; correct only above a
   threshold; low-confidence flagged "possible". (Phase 5)
3. **Completion engine** — `recitationComplete()` with a 0–100 completion score;
   finalize only when the tail is actually matched, or on explicit stop. (Phase 6)
4. **Finalize-on-stop** — resolve trailing words as skipped/incomplete so
   accuracy reflects reality. (Phase 4)
5. **Pause/breath tolerance** — keep the session alive across pauses without
   losing audio; treat `onend` as restart, not stop; longer grace. (Phase 2)
6. **Test suite** — perfect / minor / major / skip / repeat / similar-verse /
   pause / partial. (Phase 7)
```
```
