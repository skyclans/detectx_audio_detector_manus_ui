# Phase 3: 비로그인 사용자 차단 — 프론트엔드 작업 지시서

**작성일:** 2026-01-30

---

## 1. UX 흐름

```
파일 업로드 → Verify 버튼 클릭 → 비로그인이면 즉시 차단 → 로그인 유도
```

---

## 2. 백엔드 변경 사항

### API 요청 — 기존과 동일 (user_id query param 유지)

```
POST /verify-audio?orientation=enhanced&user_id=abc123
```

### 비로그인 (user_id 없음) → HTTP 401

```json
{
  "detail": "Please sign in to use this feature."
}
```

**서버는 `user_id` 없이는 스캔을 실행하지 않습니다 (GPU 자원 절약).**

---

## 3. 프론트엔드 수정 사항

### 3-1. Verify 버튼 클릭 시 로그인 체크 (Home.tsx, HomeTest.tsx)

**스캔 시작 전에 `isAuthenticated` 확인:**

```typescript
// startAnalysis() 함수 맨 앞에 추가
if (!isAuthenticated) {
  setShowLoginPrompt(true);
  return;
}
```

### 3-2. 로그인 안내 UI

```
┌──────────────────────────────────┐
│                                  │
│  🔒 Please sign in to continue  │
│                                  │
│  Sign in to analyze your audio   │
│  files with DetectX.             │
│                                  │
│  [ Sign in with Google ]         │
│                                  │
└──────────────────────────────────┘
```

```tsx
{showLoginPrompt && (
  <div className="flex flex-col items-center justify-center py-12 px-8 border border-border rounded-xl bg-muted/30">
    <Lock className="w-10 h-10 mb-4 text-muted-foreground" />
    <h3 className="text-lg font-semibold mb-2">Please sign in to continue</h3>
    <p className="text-sm text-muted-foreground mb-6 text-center">
      Sign in to analyze your audio files with DetectX.
    </p>
    <Button onClick={() => window.location.href = getLoginUrl()}>
      Sign in with Google
    </Button>
  </div>
)}
```

### 3-3. 401 에러 처리 (fallback)

프론트에서 체크하더라도 서버가 401을 반환할 수 있음 (세션 만료 등):

```typescript
xhr.addEventListener("load", () => {
  if (xhr.status === 401) {
    setShowLoginPrompt(true);
    return;
  }
  // ... 기존 로직
});
```

---

## 4. 필요 state

```typescript
const [showLoginPrompt, setShowLoginPrompt] = useState(false);
```

---

## 5. 수정 대상 파일

| 파일 | 변경 내용 |
|------|----------|
| `client/src/pages/Home.tsx` | 로그인 체크 + 로그인 안내 UI + 401 처리 |
| `client/src/pages/HomeTest.tsx` | 동일 |

**API 호출 방식 변경 없음** — `user_id` query param 기존대로 유지.

---

## 6. 테스트 시나리오

| # | 시나리오 | 기대 결과 |
|---|---------|----------|
| 1 | 비로그인 + Verify 버튼 클릭 | 로그인 안내 표시 (스캔 안 됨) |
| 2 | 로그인 + Verify 버튼 클릭 | 정상 스캔 + 결과 표시 |
| 3 | 로그인 안내에서 CTA 클릭 | `/login` 페이지 이동 |

---

## 7. API 응답 정리

| HTTP Status | 의미 | 프론트 대응 |
|-------------|------|------------|
| 200 | 로그인 → 정상 결과 | 기존 로직 |
| 401 | 비로그인 (user_id 없음) | 로그인 안내 표시 |
| 400 | 파일 형식 오류 등 | 기존 에러 처리 |
| 500 | 서버 에러 | 기존 에러 처리 |
