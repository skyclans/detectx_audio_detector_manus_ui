# UI 팀 작업지시서: 사용량 실시간 표시 + 버그 수정 + 성능 개선

**작성일:** 2026-01-31

---

## 요약

3가지 수정 사항:
1. **사용량 실시간 표시** — 스캔 후 "99/100" 형식 표시
2. **이중 차감 버그 수정** — `incrementUsageMutation` 제거
3. **성능 개선** — 애니메이션 블로킹 제거

---

## 1. 사용량 실시간 표시 (서버 변경 완료)

### 백엔드 변경 (이미 배포됨)

`POST /verify-audio` 응답에 `usage_info` 필드가 추가되었습니다.

**응답 예시:**
```json
{
  "verdict": "AI signal evidence was observed.",
  "orientation": "enhanced",
  "exceeded_axes": ["spectral_flux"],
  "cnn_score": 0.87,
  "metadata": { ... },
  "detailed_analysis": { ... },
  "usage_info": {
    "usage_count": 1,
    "monthly_limit": 5,
    "remaining": 4
  }
}
```

- `usage_count`: 이번 달 사용 횟수 (증가된 후의 값)
- `monthly_limit`: 월 한도 (`-1` = 무제한)
- `remaining`: 남은 횟수 (`-1` = 무제한)

**오류 시:** `usage_info`가 없음 (서버가 사용량을 차감하지 않음)

### 프론트엔드 수정

**파일:** `client/src/pages/Home.tsx` (및 `HomeTest.tsx`)

스캔 성공 후 서버 응답의 `usage_info`를 사용하여 UI를 업데이트합니다.

**현재 (Home.tsx:797-815):**
```typescript
// Increment usage count (skip for master users)
if (!isMasterUser) {
  if (isAuthenticated && user?.id) {
    // Increment in Manus DB (lightweight — no file re-upload)
    setUsageCount((prev: number) => prev + 1);
    try {
      await incrementUsageMutation.mutateAsync();
    } catch (e) {
      console.error("[Usage] Failed to increment in DB:", e);
    }
  } else {
    // For non-authenticated users, use localStorage
    setUsageCount((prev: number) => {
      const newCount = prev + 1;
      localStorage.setItem("detectx_usage_count", newCount.toString());
      return newCount;
    });
  }
}
```

**변경:**
```typescript
// Update usage from server response (server already incremented)
if (result.usage_info) {
  const { usage_count, monthly_limit, remaining } = result.usage_info;
  setUsageCount(usage_count);
  // Update localStorage cache for consistency
  localStorage.setItem("detectx_usage_count", String(usage_count));
  localStorage.setItem("detectx_mode_limit", String(monthly_limit));

  // Also update the cached user data
  const cachedUser = localStorage.getItem("detectx_user");
  if (cachedUser) {
    try {
      const userData = JSON.parse(cachedUser);
      userData.usage_count = usage_count;
      userData.usageCount = usage_count;
      userData.remaining = remaining;
      localStorage.setItem("detectx_user", JSON.stringify(userData));
    } catch {}
  }
}
```

> **핵심:** `incrementUsageMutation.mutateAsync()` 호출을 **완전히 제거**하세요.
> RunPod 서버가 `/verify-audio` 처리 중 자동으로 사용량을 증가시킵니다.
> 프론트에서도 증가시키면 **이중 차감**이 됩니다.

### 사용량 표시 UI (선택사항)

스캔 완료 후 remaining/total을 표시하는 예시:

```tsx
{scanComplete && result?.usage_info && result.usage_info.monthly_limit > 0 && (
  <div className="text-sm text-muted-foreground">
    Remaining: {result.usage_info.remaining}/{result.usage_info.monthly_limit}
  </div>
)}
```

---

## 2. 이중 차감 버그 수정 (긴급)

### 문제

`Home.tsx:803`에서 `incrementUsageMutation.mutateAsync()`를 호출합니다.
이것은 Manus tRPC를 통해 별도로 usage를 증가시킵니다.

하지만 RunPod 서버는 `/verify-audio` 엔드포인트에서 **이미 자동으로 usage를 증가**시킵니다.
(`server/app/api.py` 라인 203-206)

결과: **1번 스캔 시 사용량이 2번 차감됩니다.**

### 수정

**파일:** `client/src/pages/Home.tsx` (및 `HomeTest.tsx`)

`incrementUsageMutation` 관련 코드를 모두 제거합니다:

```typescript
// 삭제할 코드:
// 1. incrementUsageMutation 선언부
// 2. await incrementUsageMutation.mutateAsync(); 호출부
// 3. tRPC usage.increment 관련 import
```

---

## 3. 성능 개선: 애니메이션 블로킹 제거

### 문제

`Home.tsx:753`에서 `await animationPromise`가 서버 응답 후에도 애니메이션이 끝날 때까지 결과 표시를 차단합니다.

**애니메이션 총 시간:** ~5초 (delays 합산: 100+150+150+150+200+200+300+300+400+400+500+500+200+200+200+200+200+300+500 = 5,050ms)

서버가 2초 만에 응답해도 UI는 최소 5초를 기다린 후 결과를 보여줍니다.

### 수정

**파일:** `client/src/pages/Home.tsx` (및 `HomeTest.tsx`)

**방법 A (권장): 서버 응답 즉시 결과 표시**

```typescript
// 현재 (블로킹):
const animationPromise = runScanAnimation();

// ... API 호출 ...

// 서버 응답 받은 후에도 애니메이션 완료까지 대기
await animationPromise;  // ← 이 줄이 문제

// 결과 표시
setVerificationResult({...});
setScanComplete(true);
```

```typescript
// 변경 (논블로킹):
const animationPromise = runScanAnimation();

// ... API 호출 ...

// 서버 응답을 받으면 애니메이션을 즉시 중단하고 결과 표시
// animationPromise를 await하지 않음

// 결과 표시 (즉시)
setVerificationResult({...});
setScanComplete(true);
```

**방법 B (대안): 애니메이션을 짧게 단축**

```typescript
// 총 2초 이내로 단축
const delays = [50, 50, 50, 50, 100, 100, 100, 100, 150, 150, 150, 150, 50, 50, 50, 50, 50, 100, 100];
// 합계: ~1,750ms
```

---

## 4. 수정 대상 파일 요약

| 파일 | 변경 내용 | 우선순위 |
|------|----------|---------|
| `client/src/pages/Home.tsx` | 사용량 실시간 + 이중차감 수정 + 애니메이션 | 긴급 |
| `client/src/pages/HomeTest.tsx` | 동일 | 긴급 |

---

## 5. verify-audio 응답 필드 정리

| 필드 | 타입 | 설명 |
|------|------|------|
| `verdict` | string | "AI signal evidence was observed." 또는 "...not observed." |
| `orientation` | string | "enhanced" |
| `exceeded_axes` | string[] | 초과 축 목록 |
| `cnn_score` | float? | CNN 점수 |
| `metadata` | object? | 오디오 메타데이터 |
| `detailed_analysis` | object? | 상세 분석 데이터 |
| `recon_metrics` | object? | RECON 메트릭 |
| **`usage_info`** | **object?** | **신규 — 사용량 정보** |
| `usage_info.usage_count` | int | 이번 달 사용 횟수 |
| `usage_info.monthly_limit` | int | 월 한도 (-1=무제한) |
| `usage_info.remaining` | int | 남은 횟수 (-1=무제한) |

---

## 6. 테스트 시나리오

| # | 시나리오 | 기대 결과 |
|---|---------|----------|
| 1 | Free 유저 스캔 성공 | 응답에 `usage_info: {usage_count: 1, monthly_limit: 5, remaining: 4}` |
| 2 | Pro 유저 스캔 성공 | `usage_info: {usage_count: N, monthly_limit: 30, remaining: 30-N}` |
| 3 | Master 유저 스캔 성공 | `usage_info: {remaining: -1}` (무제한) |
| 4 | 스캔 오류 (500) | `usage_info` 없음 — 사용량 차감 없음 |
| 5 | UI 사용량 표시 | 스캔 후 즉시 "4/5 remaining" 식으로 업데이트 |
| 6 | 이중 차감 확인 | 스캔 1회 → 서버 usage_count 정확히 1 증가 (2가 아님) |
| 7 | 성능 | 서버 응답 후 결과가 5초 이내에 표시됨 |
