# DetectX Audio
## Structural AI Signal Verification for Music Integrity

**Deterministic · Human-Safe · Forensic-Grade**

---

## 1. The Current Industry Reality

AI-generated music has reached a level where:

- It is commercially usable
- It is structurally convincing
- It is indistinguishable at distribution scale

Human review is no longer sufficient.

The core problem is no longer generation.
**The core problem is verification.**

---

## 2. How Most AI Detection Sites Work Today

Most existing AI detection platforms (e.g. aiorNot, and similar services) rely on:

- Probability-based classification
- Similarity scoring
- Model-trained pattern recognition

They typically output:

- Likelihood percentages
- Confidence scores
- "AI-likeness" estimates

---

## 3. Structural Limitations of Probability-Based Detection

Probability-based systems have unavoidable limitations:

- Results are non-deterministic
- Outputs are not reproducible
- Small data changes alter outcomes
- High risk of false positives
- Responsibility is shifted to the user

**These systems do not assume responsibility
for protecting human creators.**

---

## 4. DetectX Starts From a Different Question

DetectX does not ask:

- Who created this audio?
- Which model was used?
- How likely is this AI-generated?

**DetectX asks only:**

> After normalization,
> does this audio exhibit structural geometry
> that exceeds human-normalized bounds?

---

## 5. DetectX System Overview

### Dual-Engine Architecture

```
                    ┌─────────────────┐
                    │   Audio Input   │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
     ┌────────▼────────┐          ┌────────▼────────┐
     │   CNN Engine    │          │  DIFF Engine    │
     │ (Spectral       │          │ (Reconstruction │
     │  Structure)     │          │  Deviation)     │
     └────────┬────────┘          └────────┬────────┘
              │                             │
              └──────────────┬──────────────┘
                             │
                    ┌────────▼────────┐
                    │  Verdict Logic  │
                    └─────────────────┘
```

### CNN Engine
- Analyzes mel-spectrogram for structural patterns
- Detects AI-specific spectral signatures
- **98.89% Human accuracy** (FP = 1.11%)

### DIFF Engine (Demucs-based Reconstruction Analysis)
- Separates audio into 4 stems (vocals, drums, bass, other)
- Compares reconstruction with original
- **Key Finding:** AI music reconstructs almost perfectly; Human music shows natural deviation

#### 7-Metric Evaluation System (Day 45)
```
band_bass_diff    < 0.3991  → AI signal
band_low_mid_diff < 0.2967  → AI signal
l1_diff           < 0.0029  → AI signal
snr               >= 30.84  → AI signal
energy_ratio      >= 0.9690 → AI signal
phase_coherence   >= 0.7231 → AI signal
band_high_ratio   >= 0.9471 → AI signal
```

**4/7 threshold:** 91.2% overall accuracy, **93.8% Human protection**

### Why Low-Frequency Analysis Works
| Band | Human Deviation | AI Deviation | Ratio |
|------|-----------------|--------------|-------|
| Sub-bass (20-60Hz) | 1.50 | 0.21 | **AI = 14% of Human** |
| Bass (60-250Hz) | 1.04 | 0.28 | **AI = 27% of Human** |

AI generates clean low frequencies → Demucs reconstructs perfectly.
Human has complex instrument interactions → reconstruction deviation is natural.

---

## 6. Deterministic, Not Probabilistic

| Conventional Detection | DetectX |
|------------------------|---------|
| Probability scores | Deterministic evaluation |
| Similarity-based | Geometry-based |
| Model-dependent | Human-baseline anchored |
| Opinionated | Evidence-only |

**DetectX does not guess.
DetectX verifies structure.**

---

## 7. Verdict Output (Strictly Limited)

DetectX outputs only one of two statements:

- **"AI signal evidence was observed."**
- **"AI signal evidence was not observed."**

There are:

- No percentages
- No confidence scores
- No ranking or likelihood language

**This limitation is intentional.**

---

## 8. Responsibility-Centered Design

Most detection tools prioritize:

- Detection rate
- Coverage
- Market speed

**DetectX prioritizes:**

- Human protection
- False accusation prevention
- Legal and ethical safety

**If a system cannot safely protect humans,
it must not issue a verdict.**

### FP Recovery Pipeline (Day 47)

When AI signal is detected, users receive:

```
⚠️ AI-like characteristics detected

Heavy reverb, strong mastering, or EDM production
may occasionally trigger this result.

💡 Re-upload with dry mix or stems
   for more accurate verification.

🔒 Files are deleted immediately after verification.
   We do not retain your audio.

[ Upload Dry Mix ]  [ Request Deep Analysis ]
```

**Key Insight:** AI music generators (Suno, Udio) cannot provide dry mixes or stems.
This creates a natural filter — only human creators can complete the verification.

---

## 9. Built by an Artist, Not a Generic Team

DetectX was created by:

- A working composer and producer
- An active music artist with decades of experience
- Someone who understands music as structure, not statistics

**This origin defines the system.**

---

## 10. Why Artist-Origin Matters

Music contains:

- Intentional imbalance
- Expressive irregularity
- Timing drift
- Asymmetry and imperfection

Systems built without deep musical understanding tend to:

- Overfit patterns
- Misread expression as anomaly
- Eventually accuse humans

**DetectX treats human imperfection as the baseline, not the exception.**

### Temporal Discontinuity Detection (Day 43)

AI music exhibits defects that are **physically impossible** in human production:

| Defect Type | Human | AI | Meaning |
|-------------|-------|-----|---------|
| Other Stem Flickering | 0.003 | 0.100 | **AI = 30x higher** |
| Active Drop Rate | ~0 | Occurs | Energy suddenly vanishes mid-phrase |
| drums_other_conflict | 0.300 | 0.723 | **AI = 2.4x higher** |

Human music is rendered track-by-track → continuous digital signal.
AI music is generated as single stream → unstable frequency allocation.

---

## 11. Human Protection as a Hard Constraint

DetectX explicitly forbids:

- Probability-based verdicts
- Style similarity inference
- "AI-likeness" scoring
- Ambiguous outputs

**Only structural evidence, or none.**

This is not a tuning choice.
**It is a design constraint.**

---

## 12. Deployment Philosophy

- No training on partner-owned assets
- No raw audio retention by default
- Deterministic and repeatable execution
- Suitable for internal, distributor, or audit workflows

---

## 13. Current Maturity

### Production Performance (Day 40)

| Metric | Value | Note |
|--------|-------|------|
| Human Accuracy | **98.89%** | 3,600 tracks, 40 FP |
| AI Detection | **50.43%** | Conservative threshold |
| FP Rate | **1.11%** | Industry-leading |

### Research Breakthroughs (Day 39-47)

| Day | Achievement |
|-----|-------------|
| 42 | RTO analysis — 2x separation between Human/AI |
| 43 | Stem Defect Analyzer — 30x flickering difference |
| 44 | DIFF threshold flaw discovered — 89% Human misclassification |
| 45 | 7-metric DIFF — Human protection 58.5% → **93.8%** |
| 47 | FP UX pipeline — AI creators self-filtered |

**This is not a concept system.**

---

## 14. World-First Position (Carefully Framed)

To the best of our knowledge:

**DetectX is the first audio verification system that:**

1. Uses deterministic structural geometry
2. Anchors verdicts to a human-only baseline
3. Explicitly rejects probabilistic output
4. Is designed by an active music artist
5. Treats human protection as a primary constraint
6. **Analyzes low-frequency reconstruction deviation as AI signature**
7. **Detects temporal discontinuities impossible in human production**

This is a design declaration, not a marketing claim.

---

## 15. Roadmap

### Phase 1: Immediate (Day 48-50)
- Deploy DIFF 4/7 to production
- Implement FP guidance UI

### Phase 2: Enhancement (Day 51-60)
- CNN model retraining with hard negatives
- RTO integration as secondary filter
- Multi-generator testing (Udio, MusicGen, AudioCraft)

### Phase 3: Expansion (Day 61-75)
- Genre-specific optimization (Classical, Jazz, Acoustic)
- Streaming verification mode
- Batch processing API

### Phase 4: B2B (Day 76+)
- Enterprise API with SLA
- SDK (Python, JavaScript)
- Partner integrations

---

*© 2026 DetectX Audio Team*
