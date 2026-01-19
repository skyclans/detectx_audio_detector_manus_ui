# DetectX Landing Page - Copy Update

## For UI Team Implementation

현재 Landing.tsx 문구를 실제 기술에 맞게 수정합니다.

---

## 1. Hero Section (Line 151-170)

### 현재:
```
A forensic verification engine for structural AI signal analysis.

DetectX Audio analyzes residual signal geometry after normalization.
It does not determine authorship or probability.

Analyze audio using a deterministic, human-safe verification baseline.
```

### 수정:
```
A forensic verification engine for AI-generated music detection.

DetectX Audio uses dual-engine analysis to detect AI-generated music
with 80%+ AI detection rate while protecting human artists at 98.89% accuracy.

Verify your audio with our Classifier Engine trained on 30,000,000+ human music samples.
```

---

## 2. Core Section — DetectX Audio (Line 199-227)

### 현재:
```
DetectX Audio is a geometry-based forensic verification system
designed to analyze structural signal behavior in audio.

The system operates on mix-level audio only and applies a fixed,
deterministic normalization process to establish a shared measurement space.

By comparing residual signal geometry against human-normalized baselines,
DetectX Audio reports whether structural signal evidence exceeds
what can be explained by human creation alone.

Key Principles:
• Deterministic and reproducible by design
• Human-safe baseline construction
• Geometry-first analysis, not model attribution
• No probability scores or similarity judgments
```

### 수정:
```
DetectX Audio is a dual-engine forensic verification system
designed to detect AI-generated music while protecting human artists.

The system uses Enhanced Mode by default: Classifier Engine (primary)
trained on 30,000,000+ verified human music samples, combined with
Reconstruction Engine (secondary) for additional AI signal analysis.

By analyzing structural patterns unique to AI-generated audio,
DetectX Audio reports whether AI signal evidence is present
while maintaining near-zero false positives on human music.

Key Principles:
• Dual-engine verification (Classifier + Reconstruction)
• Human-safe by design (98.89% accuracy on human music)
• 80%+ AI detection rate
• Clear binary verdict, no probability scores
```

---

## 3. How It Works Section (Line 239-263)

### 현재:
```
1. Audio is normalized into a fixed measurement space.
2. Residual signal geometry is extracted and analyzed.
3. Structural behavior is evaluated against human baselines.
4. Structural exceedance is reported as signal evidence.

This process is fully deterministic and does not rely on
probabilistic classification or model attribution.
```

### 수정:
```
1. Audio is processed through the Classifier Engine (CNN).
2. If classifier score exceeds 90%, Reconstruction Engine activates.
3. Audio is separated into stems and reconstructed for comparison.
4. Dual-engine consensus determines the final verdict.

Enhanced Mode prioritizes human protection: if the Classifier Engine
says "Human," it is trusted. Additional analysis only runs when
AI signals are initially detected.
```

---

## 4. Clear Verdict Semantics (Line 291-305)

### 현재 (유지):
```
DetectX Audio reports only two possible outcomes:

• AI signal evidence was observed.
• AI signal evidence was not observed.

These statements describe structural signal behavior only.
They do not imply authorship, probability, creative intent,
or legal attribution.
```

✅ **변경 없음** - 이 부분은 정확합니다.

---

## 5. Protecting Human Creativity (Line 335-352)

### 현재:
```
DetectX Audio was developed to help protect human creativity
by providing a neutral, explainable verification reference.

As AI-generated content becomes more prevalent,
human-created works are increasingly at risk of being
misinterpreted or unfairly challenged.

DetectX does not determine authorship.
It helps ensure that human creative work is not unfairly flagged
by opaque or probabilistic detection systems.
```

### 수정:
```
DetectX Audio was developed to protect human artists
from being falsely flagged as AI-generated.

With 98.89% accuracy on human music, our Classifier Engine
is trained on over 30 million verified human music samples
to understand the full spectrum of human musical expression.

DetectX does not determine authorship.
It provides a reliable verification reference that prioritizes
human artist protection while maintaining strong AI detection.
```

---

## 6. Mid-Page Action (Line 314-325)

### 현재:
```
Verify an audio signal

Analyze an audio signal against human-normalized baselines
to determine whether structural signal evidence is present.
```

### 수정:
```
Verify your music

Upload your audio file and get instant AI detection results.
Enhanced Mode provides dual-engine verification with 80%+ AI detection
and 98.89% human accuracy.
```

---

## 7. Who Uses DetectX Audio (Line 381-398)

### 현재 (유지 + 추가):
```
DetectX Audio is designed for use across a wide range of
professional and institutional contexts.

• Composers and creators
• Music producers and studios
• Record labels and distributors
• Music associations and institutions

The system provides a shared, deterministic reference
for evaluating structural signal behavior in audio,
without asserting authorship or creative intent.
```

### 수정:
```
DetectX Audio is designed for creators and institutions
who need reliable AI music detection.

• Composers protecting their original work
• Music producers verifying submissions
• Record labels screening releases
• Music associations and copyright organizations
• Streaming platforms and distributors

Trusted by professionals who need accurate verification
without false positives on human-created music.
```

---

## 8. Performance Stats (추가 권장)

Hero 또는 Core 섹션에 성능 수치 추가:

```html
<div className="grid grid-cols-3 gap-6 mt-10">
  <div className="text-center">
    <div className="text-3xl font-bold text-foreground">80%+</div>
    <div className="text-sm text-muted-foreground">AI Detection Rate</div>
  </div>
  <div className="text-center">
    <div className="text-3xl font-bold text-foreground">98.89%</div>
    <div className="text-sm text-muted-foreground">Human Accuracy</div>
  </div>
  <div className="text-center">
    <div className="text-3xl font-bold text-foreground">30M+</div>
    <div className="text-sm text-muted-foreground">Training Samples</div>
  </div>
</div>
```

---

## 9. Footer Principle (Line 461-463)

### 현재 (유지):
```
DetectX does not determine authorship.
It reports structural signal evidence only.
```

✅ **변경 없음**

---

## Summary of Changes

| 섹션 | 변경 내용 |
|------|----------|
| Hero | "geometry" → "dual-engine", 성능 수치 추가 |
| Core | "geometry-based" → "dual-engine", Enhanced Mode 설명 |
| How It Works | 4단계 프로세스를 실제 기술에 맞게 수정 |
| Verdict | 유지 |
| Protecting Human | 98.89% 정확도 강조 |
| Mid-Page CTA | 성능 수치 추가 |
| Who Uses | 타겟 사용자 명확화 |
| Footer | 유지 |

---

## Key Messages

1. **Dual-engine verification** (Classifier + Reconstruction)
2. **80%+ AI detection rate**
3. **98.89% human accuracy** (near-zero false positives)
4. **30M+ training samples** (human music)
5. **Human protection priority**

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-19 | Initial copy update for launch |
