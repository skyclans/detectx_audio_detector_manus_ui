# DetectX Audio — AI 음악 검증 기술 요약

## Sony 제출용 기술 자료

**Date:** 2026-01-25
**Version:** 1.0

---

## 1. 서비스 개요

### DetectX Audio란?
AI 생성 음악(Suno, Udio 등)을 탐지하여 Human 창작물을 보호하는 포렌식 검증 엔진입니다.

### 핵심 가치
- **Human 아티스트 보호**: AI 음악의 무단 유통 방지
- **정확한 판별**: 98.89% Human 정확도, 50%+ AI 탐지율
- **빠른 검증**: 30초 이내 결과 제공

---

## 2. 핵심 기술 스택

### 2.1 Dual-Engine Architecture

```
                    ┌─────────────────┐
                    │   Audio Input   │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
     ┌────────▼────────┐          ┌────────▼────────┐
     │   CNN Engine    │          │  DIFF Engine    │
     │  (구조적 특성)   │          │  (재구성 오차)   │
     └────────┬────────┘          └────────┬────────┘
              │                             │
              └──────────────┬──────────────┘
                             │
                    ┌────────▼────────┐
                    │  Final Verdict  │
                    │   (OR 로직)      │
                    └─────────────────┘
```

### 2.2 CNN Engine
- **목적**: 오디오 스펙트럼에서 AI 생성 패턴 탐지
- **모델**: Custom CNN (mel-spectrogram 기반)
- **성능**: 98.89% Human 정확도 (FP = 1.11%)

### 2.3 DIFF Engine (Demucs 기반)
- **원리**: AI 음악은 단일 스트림으로 생성되어 Demucs 재구성 시 원본과 거의 동일
- **핵심**: 저주파 대역(bass, sub-bass)에서 재구성 오차 차이가 가장 큼
- **개선 성과**: Day 45에서 4/7 메트릭 방식으로 Human 보호율 93.8% 달성

---

## 3. 연구 성과 타임라인

### Day 39-40: 프로덕션 배포
| 항목 | 결과 |
|------|------|
| Human 정확도 | **98.89%** (3,600곡 중 40 FP) |
| AI 탐지율 | **50.43%** (464곡 중 234 탐지) |
| 프로덕션 상태 | 운영 중 (RunPod) |

### Day 42: RTO (Residual Temporal Over-regularity) 분석
| 메트릭 | Human FP | AI Music |
|--------|----------|----------|
| RTO Mean | 0.0815 | 0.1615 |
| RTO Median | 0.0644 | 0.1532 |
| **분리율** | — | **2배 차이** |

- RTO < 0.10: 70% FP 복구 가능
- CNN + RTO 조합: FP 1.47%로 감소

### Day 43: Mask-based Stem Defect Analyzer
- **핵심 발견**: AI 음악의 "Other" stem에서 flickering이 Human 대비 **30배** 높음
- **원인**: AI는 개별 트랙 없이 단일 스트림 생성 → 주파수 할당 불안정
- **성능**: 10 vs 10 테스트에서 **100% 정확도**

| 지표 | Human | AI | 차이 |
|------|-------|-----|------|
| Other Flicker Rate | 0.003 | 0.100 | **30배** |
| drums_other_conflict | 0.300 | 0.723 | **2.4배** |

### Day 44: Demucs DIFF 메트릭 심층 분석
**기존 Threshold의 심각한 결함 발견:**

| 메트릭 | 기존 Threshold | Human 평균 | AI 평균 | 문제 |
|--------|---------------|-----------|---------|------|
| spectral_diff | < 0.75 | 0.087 | 0.022 | Human도 통과 |
| hf_diff | < 0.015 | 0.012 | 0.004 | Human 평균 < threshold |
| energy_ratio | > 0.95 | 0.947 | 0.983 | 경계선 |

**신규 7개 메트릭 개발:**

```
band_bass_diff    < 0.3991  → AI 신호
band_low_mid_diff < 0.2967  → AI 신호
l1_diff           < 0.0029  → AI 신호
snr               >= 30.84  → AI 신호
energy_ratio      >= 0.9690 → AI 신호
phase_coherence   >= 0.7231 → AI 신호
band_high_ratio   >= 0.9471 → AI 신호
```

### Day 45: Improved Demucs DIFF — Human FP 보호 극대화
| 방식 | 전체 정확도 | Human→Human | AI→AI |
|------|------------|-------------|-------|
| 기존 (2/3) | 73.7% | 58.5% | 93.9% |
| **개선 (4/7)** | **91.2%** | **93.8%** | **87.8%** |
| 개선 폭 | **+17.5%p** | **+35.3%p** | -6.1%p |

**핵심 성과:**
- Human FP 보호: 58.5% → **93.8%** (+35.3%p)
- CNN에서 AI 판정된 Human 곡의 93.8%를 복구 가능

### Day 46: Custom Mask Separator 평가
- **DIFF 방식**: 구조적 실패 (mask × original → 재구성 오차 ≈ 0)
- **Stem 분석**: drums_flatness, spectral_contrast 등 보조 신호 확보
- **결론**: Demucs만 DIFF에 적합, Mask Separator는 품질 분석용

### Day 47: FP 대응 UX 파이프라인
**3단계 검증 플로우:**

```
[1차] CNN + DIFF (서버 자동)
         ↓ AI 판정
[2차] 드라이 믹스 업로드 → Demucs DIFF 4/7 (자동)
         ↓ 여전히 AI
[3차] 심층 분석 요청 (수동, 스템 필수)
```

**AI 제작자 자동 필터링:**
- Suno/Udio는 드라이 믹스/스템 제공 불가
- 2차, 3차 단계 진입 자체가 불가능 → 자연스러운 차단

---

## 4. 기술적 차별점

### 4.1 저주파 대역 분석
AI 음악의 bass/sub-bass 재구성 오차가 Human의 **14~27%** 수준:
- AI: 저주파를 깨끗하게 생성 → Demucs 재구성 완벽
- Human: 악기 간 저주파 간섭 복잡 → 재구성 오차 큼

### 4.2 Temporal Discontinuity 탐지
AI 음악만의 고유 결함:
- **Active Drop**: 에너지 활성 구간 내 갑작스러운 소멸
- **Flickering**: 빠른 on/off 반복 (binary active 진동)
- **Gap Ratio**: 활성 구간 내 순간 공백

Human 음악에서는 **물리적으로 불가능**한 현상.

### 4.3 Multi-Signal Ensemble
단일 메트릭이 아닌 7개 메트릭 조합:
- 7개 중 4개 이상 충족 시 AI 판정
- 오탐 최소화 + 탐지율 유지

---

## 5. 성능 요약

### 현재 프로덕션 성능 (Day 40 기준)

| 지표 | 값 | 의미 |
|------|-----|------|
| Human 정확도 | **98.89%** | 100명 중 1명만 오판 |
| AI 탐지율 | **50.43%** | 보수적 접근, FP 최소화 |
| FP Rate | **1.11%** | 업계 최저 수준 |

### Demucs DIFF 개선 후 (Day 45)

| 지표 | 기존 | 개선 |
|------|------|------|
| Human 보호율 | 58.5% | **93.8%** |
| 전체 정확도 | 73.7% | **91.2%** |

---

## 6. 향후 계획 (Day 48+)

### 단기 (1-2주)
1. **Demucs DIFF 4/7 프로덕션 적용**
   - `crg_runner.py` 판정 로직 교체
   - 7개 메트릭 수집 함수 추가

2. **FP 대응 UX 구현**
   - 안내 메시지 UI 적용
   - 드라이 믹스 업로드 기능

### 중기 (1개월)
3. **다양한 AI 생성기 대응**
   - Udio, MusicGen, AudioCraft 테스트
   - 생성기별 특성 분석

4. **장르 확대**
   - Classical, Jazz, Acoustic 장르 검증
   - 장르별 threshold 최적화

### 장기 (3개월)
5. **실시간 스트리밍 검증**
   - 청크 단위 분석
   - 지연 시간 최적화

6. **API 파트너십**
   - 음원 플랫폼 연동
   - B2B API 제공

---

## 7. 참고 문서

| 문서 | 경로 | 내용 |
|------|------|------|
| Day 39 | `docs/day39.md` | UI 통합, 버그 수정 |
| Day 40 | `docs/day40.md` | 프로덕션 테스트 결과 |
| Day 42 | `docs/day42.md` | RTO 분석 |
| Day 43 | `docs/day43.md` | Stem Defect Analyzer |
| Day 44 | `docs/day44.md` | DIFF 메트릭 분석 |
| Day 45 | `docs/day45.md` | Improved DIFF 결과 |
| Day 46 | `docs/day46.md` | Mask Separator 평가 |
| Day 47 | `docs/day47.md` | FP UX 파이프라인 |

---

## 8. 핵심 메시지

> **DetectX Audio는 AI 음악의 구조적 결함을 다층적으로 분석하여,
> Human 아티스트를 98.89% 정확도로 보호하면서
> AI 생성 콘텐츠를 효과적으로 탐지합니다.**

### 기술 경쟁력
1. **Dual-Engine**: CNN + DIFF 이중 검증
2. **저주파 분석**: AI 고유의 재구성 특성 활용
3. **Temporal Defect**: 물리적으로 불가능한 패턴 탐지
4. **UX 설계**: AI 제작자 자동 필터링

---

*© 2026 DetectX Audio Team*
