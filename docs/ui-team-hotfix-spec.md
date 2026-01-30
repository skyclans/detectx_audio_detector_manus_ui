# UI 긴급 수정: 사용량 한도 + 실시간 표시 + 성능

**작성일:** 2026-01-31
**우선순위:** 긴급

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
