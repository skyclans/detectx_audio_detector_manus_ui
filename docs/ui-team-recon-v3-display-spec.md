# UI 팀 작업지시서: RECON V3 엔진 결과 표시 업데이트

**작성일:** 2026-02-04
**우선순위:** 높음 (엔진 업그레이드 반영)

---

## 1. 배경

서버 엔진이 RECON V1 (7-metric 바이너리 투표) → **RECON V3 (42-feature XGBoost 분류기)** 로 업그레이드되었습니다.

현재 UI의 `RECON_DIFF` 섹션은 V1 메트릭 7개만 표시하고 있어, V3의 핵심 정보가 누락되어 있습니다.

### 현재 UI 표시 (V1 호환만)
```
Reconstruction Engine
  AI Signals          7/7
  Bass Diff           0.1054 (< 0.3991)
  Low-Mid Diff        0.0700 (< 0.2967)
  L1 Diff             0.000984 (< 0.0029)
  SNR                 36.4dB (>= 30.84)
  Energy Ratio        0.9977 (>= 0.9690)
  Phase Coherence     0.8460 (>= 0.7231)
  High Ratio          0.9957 (>= 0.9471)
```

### 변경 후 UI 표시 (V3 포함)
```
Reconstruction Engine (V3)
  RECON Confidence    95.2%           ← 신규 (V3 핵심)
  Engine Version      v2              ← 신규
  AI Signals          7/7             ← 기존 유지 (V1 호환)
  ─── V1 Metrics ───
  Bass Diff           0.1054 (< 0.3991)
  Low-Mid Diff        0.0700 (< 0.2967)
  L1 Diff             0.000984 (< 0.0029)
  SNR                 36.4dB (>= 30.84)
  Energy Ratio        0.9977 (>= 0.9690)
  Phase Coherence     0.8460 (>= 0.7231)
  High Ratio          0.9957 (>= 0.9471)
  ─── V3 Extended ───
  Mid Diff            0.0823          ← 신규
  High-Mid Diff       0.0412          ← 신규
  Spectral Flatness   0.3215          ← 신규
  Stereo Recon Loss   0.0567          ← 신규 (V3 1위 피처)
```

---

## 2. API 응답 구조

`/verify-audio` 응답의 `recon_metrics` 객체:

```json
{
  "recon_metrics": {
    // === V1 기존 필드 (변경 없음) ===
    "band_bass_diff": 0.1054,
    "band_low_mid_diff": 0.0700,
    "l1_diff": 0.000984,
    "snr": 36.4,
    "energy_ratio": 0.9977,
    "phase_coherence": 0.8460,
    "band_high_ratio": 0.9957,
    "ai_signals": 7,

    // === V3 신규 필드 (모두 Optional, null 가능) ===
    "recon_version": "v2",           // "v1" 또는 "v2", null이면 v1
    "v2_confidence": 0.952,          // 0.0~1.0, XGBoost 확률 (핵심!)
    "band_mid_diff": 0.0823,         // 500-2000Hz 대역
    "band_high_mid_diff": 0.0412,    // 2000-4000Hz 대역
    "spectral_flatness_mean": 0.3215,
    "stereo_recon_loss": 0.0567,
    "v2_features": { ... }           // 42개 전체 피처 (상세 분석용)
  }
}
```

---

## 3. UI 변경사항

### 3-1. RECON_DIFF 헤더 변경

```
// 변경 전:
"Reconstruction Engine"

// 변경 후 (recon_version에 따라):
recon_version === "v2" ? "Reconstruction Engine (V3)" : "Reconstruction Engine"
```

### 3-2. RECON Confidence 표시 (최상위, 가장 중요)

`v2_confidence` 필드가 존재하고 null이 아닌 경우 **AI Signals 위에** 표시:

```
> RECON Confidence    95.2%
```

- 값: `v2_confidence * 100` → `XX.X%` 형식
- 색상: 50% 이상이면 빨간색 (AI), 50% 미만이면 초록색 (Human)
- **이 값이 V3의 실제 판정 기준** (AI Signals 7/7은 참고용)

### 3-3. Engine Version 표시

`recon_version` 필드가 존재하면 표시:

```
> Engine Version      v2
```

### 3-4. V3 확장 메트릭 표시

`recon_version === "v2"` 일 때, 기존 7개 메트릭 아래에 구분선 후 추가:

| 필드명 | API 키 | 표시 이름 | 설명 |
|--------|--------|----------|------|
| `band_mid_diff` | `band_mid_diff` | Mid Diff | 500-2000Hz 대역 차이 |
| `band_high_mid_diff` | `band_high_mid_diff` | High-Mid Diff | 2000-4000Hz 대역 차이 |
| `spectral_flatness_mean` | `spectral_flatness_mean` | Spectral Flatness | 스펙트럴 평탄도 |
| `stereo_recon_loss` | `stereo_recon_loss` | Stereo Recon Loss | 스테레오 복원 손실 |

- 모두 Optional → null이면 해당 행 숨김
- 소수점 4자리까지 표시 (예: `0.0567`)
- V3 확장 메트릭에는 threshold 비교 없음 (단순 값 표시)

### 3-5. 하위 호환성

| `recon_version` | `v2_confidence` | UI 동작 |
|-----------------|-----------------|---------|
| `null` 또는 `"v1"` | `null` | 기존 그대로 (V1 메트릭 7개만 표시) |
| `"v2"` | 숫자 | V3 표시 (Confidence + 확장 메트릭) |
| `"v2"` | `null` 또는 `-1` | V3 헤더 표시, Confidence 행 숨김 (폴백) |

---

## 4. 구현 가이드

### 4-1. TypeScript 타입 업데이트

```typescript
// 기존 ReconMetrics 타입에 추가:
interface ReconMetrics {
  // V1 기존
  band_bass_diff?: number | null;
  band_low_mid_diff?: number | null;
  l1_diff?: number | null;
  snr?: number | null;
  energy_ratio?: number | null;
  phase_coherence?: number | null;
  band_high_ratio?: number | null;
  ai_signals?: number | null;

  // V3 신규
  recon_version?: string | null;          // "v1" | "v2"
  v2_confidence?: number | null;          // 0.0 ~ 1.0
  band_mid_diff?: number | null;
  band_high_mid_diff?: number | null;
  spectral_flatness_mean?: number | null;
  stereo_recon_loss?: number | null;
  v2_features?: Record<string, number> | null;  // 42개 전체 피처
}
```

### 4-2. 표시 우선순위

RECON_DIFF 섹션 내 항목 순서:
1. **RECON Confidence** (v2_confidence) — V3 핵심, 가장 위
2. **Engine Version** (recon_version)
3. **AI Signals** (ai_signals) — 기존, "7/7" 형식
4. 구분선 "V1 Metrics"
5. 기존 7개 메트릭 (Bass Diff ~ High Ratio)
6. 구분선 "V3 Extended" (recon_version === "v2" 일 때만)
7. 4개 확장 메트릭 (Mid Diff, High-Mid Diff, Spectral Flatness, Stereo Recon Loss)

---

## 5. notice 텍스트 변경

서버 API 응답의 `notice` 필드에도 V3 정보가 포함됩니다:

```
// V3 엔진일 때:
"Enhanced mode: CNN + Recon Diff both exceeded. CNN score: 0.96, RECON v2 confidence: 0.95 (signals: 7/7)"

// V1 엔진일 때 (기존):
"Enhanced mode: CNN + Recon Diff both exceeded. CNN score: 0.96, Reconstruction Diff signals: 7/7"
```

UI에서 notice 텍스트를 파싱하여 표시하는 부분이 있다면, "RECON v2 confidence" 키워드가 포함될 수 있음을 참고해주세요.

---

## 6. 요약

| 항목 | 변경 |
|------|------|
| RECON_DIFF 헤더 | "Reconstruction Engine" → "Reconstruction Engine (V3)" |
| **RECON Confidence** | **신규 추가 (최상단, V3 핵심 판정값)** |
| Engine Version | 신규 추가 |
| V1 메트릭 7개 | 변경 없음 (유지) |
| V3 확장 메트릭 4개 | 신규 추가 (하단) |
| TypeScript 타입 | ReconMetrics에 6개 Optional 필드 추가 |
| 하위 호환 | V1 응답 시 기존과 동일하게 표시 |
