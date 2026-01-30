# UI 팀 상세 작업지시서: 사이드바 실시간 갱신 + 잔여 이슈 정리

**작성일:** 2026-01-31
**우선순위:** 긴급 (런칭 전)

---

## 1. 사이드바 usage 실시간 갱신 (완료 — 서버팀 직접 수정)

### 문제

스캔 완료 후 좌측 사이드바의 "Remaining: X / Y" 표시가 갱신되지 않음. F5 새로고침 필요.

### 근본 원인

`useAuth()`는 React Context가 아닌 **커스텀 hook**입니다. `Home.tsx`와 `PlanUsageDisplay`(ForensicLayout.tsx)가 각각 `useAuth()`를 호출하면 **완전히 별개의 `user` state**가 생깁니다.

```
Home.tsx           → useAuth() → { user: stateA, refreshUser: fnA }
PlanUsageDisplay   → useAuth() → { user: stateB }  ← stateA와 독립!

Home에서 refreshUser() 호출
  → fnA가 /auth/me fetch
  → stateA 갱신 ✅
  → stateB 갱신 안 됨 ✗  ← 사이드바 변화 없음
```

### 수정 내용 (서버팀 직접 수정 완료)

**파일:** `client/src/_core/hooks/useAuth.ts`

**변경:** `CustomEvent` 기반 크로스 인스턴스 동기화 추가

```typescript
// 신규: 이벤트 상수 (line 35)
const USER_UPDATED_EVENT = "detectx-user-updated";

// fetchUser() 내부 — /auth/me 응답 성공 시 (line 113-116):
// 기존 setUser(mappedUser) 아래에 추가
window.dispatchEvent(
  new CustomEvent(USER_UPDATED_EVENT, { detail: mappedUser })
);

// 신규 useEffect (line 136-149):
// 다른 useAuth() 인스턴스의 업데이트를 수신
useEffect(() => {
  const handleUserUpdated = (e: Event) => {
    const detail = (e as CustomEvent<User | null>).detail;
    if (detail) {
      setUser(detail);
    }
  };
  window.addEventListener(USER_UPDATED_EVENT, handleUserUpdated);
  return () => {
    window.removeEventListener(USER_UPDATED_EVENT, handleUserUpdated);
  };
}, []);
```

**동작 흐름 (수정 후):**
```
Home.tsx: refreshUser() → fetchUser() → /auth/me
  → setUser(mappedUser)                        ← Home 자체 갱신
  → dispatchEvent("detectx-user-updated")      ← 브로드캐스트
  → PlanUsageDisplay의 listener가 수신
  → PlanUsageDisplay의 setUser(detail)         ← 사이드바 즉시 갱신 ✅
```

**예상 결과:** 스캔 완료 후 사이드바 "Remaining" 숫자가 즉시 갱신됨 (F5 불필요)

### UI팀 추가 작업 불필요

이 수정은 `useAuth.ts` 한 파일에만 적용되며, `Home.tsx`, `HomeTest.tsx`, `ForensicLayout.tsx`의 기존 코드는 변경 없이 동작합니다.

---

## 2. Verdict 결과 표시 속도

### 현재 상태

| 항목 | 상태 |
|------|------|
| `await animationPromise` | 이미 주석 처리됨 (line 765 Home.tsx, line 652 HomeTest.tsx) |
| `incrementUsageMutation.mutateAsync()` | 이미 삭제됨 |
| UI 측 블로킹 코드 | 없음 |

### 결과 표시 타이밍

```
사용자 Verify 클릭
  → setIsVerifying(true)             ← 버튼 비활성화 + VerdictPanel "Inspecting..."
  → XHR /verify-audio 전송
  → [서버 처리 시간]                  ← GPU 큐 대기 + CNN 추론 (5~30초)
  → XHR 응답 수신
  → setVerificationResult(...)       ← verdict 데이터 설정
  → setScanComplete(true)
  → refreshUser()                    ← fire-and-forget (블로킹 없음)
  → setIsVerifying(false) [finally]  ← VerdictPanel이 결과 표시
```

**결론:** UI 측 지연은 완전히 제거됨. 현재 결과 표시 시간 = 서버 처리 시간 (CNN 추론).

### 서버 처리 시간 참고

| 파일 크기 | 예상 시간 | 원인 |
|----------|----------|------|
| < 5MB (MP3 3분) | 5~10초 | CNN 추론 |
| 5~30MB (WAV 5분) | 10~20초 | 파일 전송 + 추론 |
| 30~100MB (WAV 10분) | 20~40초 | 대용량 전송 + 추론 |
| GPU 큐 대기 시 | +5~15초 추가 | 동시 요청 |

서버 측에서 추론 속도 최적화를 별도로 진행합니다.

---

## 3. 현재 코드 상태 정리

### Home.tsx (lines 805-826) — 스캔 후 usage 갱신
```typescript
// 현재 코드 (정상 동작 중)
setScanComplete(true);

if (result.usage_info) {
  const { usage_count, monthly_limit, remaining } = result.usage_info;
  setUsageCount(usage_count);
  localStorage.setItem("detectx_usage_count", String(usage_count));
  if (monthly_limit !== undefined) {
    localStorage.setItem("detectx_mode_limit", String(monthly_limit));
  }
  refreshUser(); // → useAuth.fetchUser() → /auth/me → CustomEvent → 사이드바 갱신
} else if (!isMasterUser) {
  setUsageCount((prev: number) => {
    const newCount = prev + 1;
    localStorage.setItem("detectx_usage_count", newCount.toString());
    return newCount;
  });
  refreshUser();
}
```

### useAuth.ts — 크로스 인스턴스 동기화
```
fetchUser() 호출 시:
  1. /auth/me fetch → 최신 usage 데이터
  2. setUser(mappedUser) → 호출한 컴포넌트 갱신
  3. localStorage 갱신
  4. CustomEvent dispatch → 모든 다른 useAuth() 인스턴스 갱신
```

### ForensicLayout.tsx — PlanUsageDisplay (lines 60-108)
```typescript
// 기존 코드 변경 없음 — useAuth()의 user가 갱신되면 자동 리렌더
useEffect(() => {
  if (isAuthenticated && user) {
    const dbUsageCount = (user as any).usageCount as number | undefined;
    setUsageCount(dbUsageCount ?? 0);
    // ...
  }
}, [isAuthenticated, user]); // ← user 변경 시 자동 실행
```

---

## 4. 주의사항 — UI팀 코드 수정 시

### 충돌 방지

서버팀이 직접 수정한 파일:
- `client/src/_core/hooks/useAuth.ts` — CustomEvent 동기화 추가
- `client/src/pages/Home.tsx` — usage_info + refreshUser (이전 커밋)
- `client/src/pages/HomeTest.tsx` — 동일

위 파일을 수정할 경우 `git pull` 후 진행해주세요.

### 건드리지 말아야 할 코드

| 파일 | 위치 | 이유 |
|------|------|------|
| `useAuth.ts` | `USER_UPDATED_EVENT` + listener | 사이드바 실시간 갱신 핵심 |
| `Home.tsx` | lines 805-826 (usage_info 처리) | 서버 usage_info 사용 + refreshUser |
| `Home.tsx` | line 765 (`// await animationPromise`) | 주석 유지 — 성능 |

### 안전하게 수정 가능한 영역

| 파일 | 영역 | 설명 |
|------|------|------|
| `ForensicLayout.tsx` | `PlanUsageDisplay` UI | 디자인 변경 OK (데이터 흐름 변경 X) |
| `VerdictPanel.tsx` | verdict 표시 UI | 디자인 변경 OK |
| Admin 페이지 전체 | tRPC → REST 전환 | 독립적 — 충돌 없음 |

---

## 5. 테스트 시나리오

| # | 시나리오 | 기대 결과 |
|---|---------|----------|
| 1 | 로그인 → 첫 스캔 → 사이드바 확인 | "Remaining" 즉시 -1 감소 |
| 2 | 두 번째 스캔 → 사이드바 확인 | "Remaining" 즉시 -1 감소 (F5 불필요) |
| 3 | Free 유저 5회 초과 시 | HTTP 429 → Plan 페이지로 이동 |
| 4 | Master 유저 스캔 | "Unlimited" 표시 유지, 차감 없음 |
| 5 | Verify 클릭 → 결과 표시 | 서버 응답 즉시 표시 (5초 대기 없음) |
| 6 | 대용량 파일 (50MB+) | 업로드 프로그레스 바 표시 → 서버 처리 → 결과 |
