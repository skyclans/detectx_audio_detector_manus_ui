# UI 긴급 수정: 사용량 한도 + 실시간 표시 + 성능

**작성일:** 2026-01-31
**우선순위:** 긴급
**업데이트:** 2026-01-31 — 근본 원인 분석 추가

---

## 근본 원인 분석: "첫 스캔 빠름 → 두 번째부터 느림 → F5 누르면 다시 빠름"

### 증상

1. 사이트 처음 들어갔을 때 첫 번째 곡: verdict 결과 **빠르게** 나옴
2. 두 번째 곡부터: 결과가 보여지는 데 **한참** 걸림 (30~60초)
3. 좌측 사이드바에 **실시간 차감 안 됨** (F5 필요)
4. F5 누르고 다시 시작하면 **다시 빠르게** 나옴

### 원인: `incrementUsageMutation.mutateAsync()`가 `isVerifying` 상태를 블로킹

`handleVerify` 함수의 실행 흐름:

```
Home.tsx 실행 순서:

Line 639: setIsVerifying(true)          ← 버튼 비활성화 시작
   │
   ▼
Line 753: await animationPromise        ← ~5초 애니메이션 대기 (수정 3에서 해결)
   │
   ▼
          XHR로 /verify-audio 호출 → 서버 응답 수신
   │
   ▼
Line 793: setScanComplete(true)         ← 결과 화면 표시 ✅ (여기까지는 빠름)
   │
   ▼
Line 803: await incrementUsageMutation  ← ⚠️ Manus tRPC 호출 (30~60초 타임아웃!)
          .mutateAsync()                   이 호출이 완료될 때까지 finally 블록 미실행
   │
   ▼ (30~60초 후 타임아웃)
   │
Line 824: setIsVerifying(false)         ← finally 블록 — 여기서 버튼 다시 활성화
```

**핵심:**
- `setIsVerifying(false)`는 `finally` 블록(Line 824)에 있음
- `finally`는 `await incrementUsageMutation.mutateAsync()` 완료 후에만 실행됨
- 이 mutation은 **Manus tRPC**를 호출하는데, 현재 Manus 서버가 응답 안 함 → **30~60초 타임아웃**
- 타임아웃 동안 `isVerifying = true` 유지 → **Verify 버튼 비활성화**
- 사용자에게는 "두 번째 스캔이 느리다"로 보임 (실제로는 버튼이 잠겨 있음)
- F5 누르면 React state 초기화 → `isVerifying = false` → 다시 빠르게 동작

### 해결: `incrementUsageMutation` 완전 삭제

**삭제 대상:**
1. **Line 239**: `const incrementUsageMutation = trpc.usage.increment.useMutation();` ← 선언 삭제
2. **Line 803**: `await incrementUsageMutation.mutateAsync();` ← 호출 삭제
3. **관련 import**: tRPC usage 관련 import 삭제

서버(`/verify-audio`)가 이미 사용량을 자동 증가시키므로, 프론트에서 별도로 증가시킬 필요 없음.
이 코드를 삭제하면:
- 이중 차감 버그 해결 (1스캔 = 2차감 → 1차감)
- Verify 버튼 블로킹 해결 (30~60초 → 즉시)
- tRPC/Manus 의존성 제거

---

## 서버 변경 사항 (이미 배포 완료)

### 1. 사용량 한도 체크 추가 (신규)

스캔 실행 **전에** 사용량 한도를 체크합니다. 한도 초과 시 **HTTP 429** 반환:

```json
{ "detail": "Monthly limit reached (5 verifications). Please upgrade your plan." }
```

| 플랜 | 월 한도 | 초과 시 |
|------|---------|---------|
| free | 5 | HTTP 429 |
| pro | 30 | HTTP 429 |
| enterprise | 1,000 | HTTP 429 |
| master | 무제한 | 차단 없음 |

### 2. verify-audio 응답에 usage_info 포함 (기존)

```json
{
  "verdict": "...",
  "usage_info": {
    "usage_count": 1,
    "monthly_limit": 5,
    "remaining": 4
  }
}
```

---

## UI 수정 사항 (3건)

### 수정 1: HTTP 429 처리 (긴급)

**파일:** `client/src/pages/Home.tsx`, `HomeTest.tsx`

현재 XHR load 핸들러에서 429를 처리하지 않습니다.

**위치:** `xhr.addEventListener("load", ...)` 내부 (현재 401만 처리)

```typescript
xhr.addEventListener("load", () => {
  setUploadProgress(null);
  if (xhr.status >= 200 && xhr.status < 300) {
    // ... 기존 성공 처리
  } else if (xhr.status === 401) {
    // ... 기존 401 처리
  } else if (xhr.status === 429) {
    // 사용량 한도 초과
    setIsVerifying(false);
    setScanComplete(false);
    try {
      const errorResponse = JSON.parse(xhr.responseText);
      alert(errorResponse.detail || "Monthly limit reached. Please upgrade your plan.");
    } catch {
      alert("Monthly limit reached. Please upgrade your plan.");
    }
    setLocation("/plan");
    reject(new Error("Monthly limit reached"));
  } else {
    // ... 기존 에러 처리
  }
});
```

---

### 수정 2: 이중 차감 제거 + 실시간 usage 표시 (긴급)

**파일:** `client/src/pages/Home.tsx`, `HomeTest.tsx`

**현재 코드 (Home.tsx ~797-815):**
```typescript
// Increment usage count (skip for master users)
if (!isMasterUser) {
  if (isAuthenticated && user?.id) {
    setUsageCount((prev: number) => prev + 1);
    try {
      await incrementUsageMutation.mutateAsync();  // ← 이중 차감!
    } catch (e) {
      console.error("[Usage] Failed to increment in DB:", e);
    }
  } else {
    setUsageCount((prev: number) => {
      const newCount = prev + 1;
      localStorage.setItem("detectx_usage_count", newCount.toString());
      return newCount;
    });
  }
}
```

**전체 교체:**
```typescript
// Update usage from server response (server already incremented - DO NOT increment again)
if (result.usage_info) {
  const { usage_count, monthly_limit, remaining } = result.usage_info;
  setUsageCount(usage_count);
  setModeLimit(monthly_limit > 0 ? monthly_limit : null);
  localStorage.setItem("detectx_usage_count", String(usage_count));
  localStorage.setItem("detectx_mode_limit", String(monthly_limit));

  // Update cached user data for navbar display
  const cachedUser = localStorage.getItem("detectx_user");
  if (cachedUser) {
    try {
      const userData = JSON.parse(cachedUser);
      userData.usage_count = usage_count;
      userData.usageCount = usage_count;
      userData.monthly_limit = monthly_limit;
      userData.monthlyLimit = monthly_limit;
      userData.remaining = remaining;
      localStorage.setItem("detectx_user", JSON.stringify(userData));
    } catch {}
  }
}
```

> **핵심:** `incrementUsageMutation.mutateAsync()` 호출과 관련 선언을 **완전히 삭제**하세요.
> 서버가 `/verify-audio` 처리 시 자동으로 사용량을 증가시킵니다.
> 프론트에서 또 증가시키면 **1회 스캔 = 2회 차감**됩니다.

---

### 수정 3: 애니메이션 블로킹 제거 (성능)

**파일:** `client/src/pages/Home.tsx`, `HomeTest.tsx`

**문제:** `await animationPromise` (라인 ~753)가 서버 응답 후에도 애니메이션 완료까지 ~5초 대기.

**현재:**
```typescript
const animationPromise = runScanAnimation();

// ... API 호출로 result 받음 ...

await animationPromise;  // ← 서버 응답 후에도 5초 대기

setVerificationResult({...});
setScanComplete(true);
```

**변경:**
```typescript
// 애니메이션은 백그라운드로 시작 (await 하지 않음)
runScanAnimation();

// ... API 호출로 result 받음 ...

// await animationPromise 제거 — 서버 응답 즉시 결과 표시

setVerificationResult({...});
setScanComplete(true);
```

---

## 수정 대상 파일

| 파일 | 수정 | 우선순위 |
|------|------|---------|
| `client/src/pages/Home.tsx` | 429 처리 + 이중차감 제거 + 애니메이션 | 긴급 |
| `client/src/pages/HomeTest.tsx` | 동일 | 긴급 |

---

## 테스트 시나리오

| # | 시나리오 | 기대 결과 |
|---|---------|----------|
| 1 | Free 유저 6번째 스캔 | HTTP 429 → "Monthly limit reached" + /plan 이동 |
| 2 | 스캔 성공 후 usage 표시 | F5 없이 즉시 "4/5" 업데이트 |
| 3 | 스캔 1회 후 /auth/me 확인 | usage_count가 정확히 1 증가 (2가 아님) |
| 4 | 서버 응답 후 결과 표시 | 5초 대기 없이 즉시 표시 |
| 5 | Master 유저 스캔 | 한도 없이 무제한 사용 |
| 6 | **연속 스캔 (핵심)** | 첫 스캔 → 결과 즉시 표시 → **두 번째 스캔도 즉시 가능** (30~60초 대기 없음) |
| 7 | F5 없이 2~3곡 연속 스캔 | 모두 빠르게 결과 표시 + 사이드바 사용량 즉시 업데이트 |

---

## 수정 우선순위 요약

| 순위 | 수정 | 해결되는 문제 |
|------|------|-------------|
| **1** | `incrementUsageMutation` 완전 삭제 | 두 번째 스캔 30~60초 블로킹 + 이중 차감 |
| **2** | HTTP 429 처리 | Free 유저 무제한 사용 |
| **3** | `result.usage_info`로 실시간 업데이트 | 사이드바 F5 없이 갱신 |
| **4** | `await animationPromise` 제거 | 첫 스캔도 ~5초 → 즉시 |
