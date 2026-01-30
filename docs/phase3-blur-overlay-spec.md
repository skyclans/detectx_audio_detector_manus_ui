# Phase 3: 비로그인 사용자 차단 — 프론트엔드 작업 지시서

**작성일:** 2026-01-30
**업데이트:** UX 변경 — 블러 방식에서 **스캔 전 차단** 방식으로 변경

---

## 1. 변경된 UX 흐름

### Before (폐기)
```
파일 업로드 → 스캔 실행 → 블러된 결과 표시 → 로그인 유도
```

### After (현재)
```
파일 업로드 → Verify 버튼 클릭 → 비로그인이면 즉시 차단 → 로그인 유도
```

**변경 이유:** GPU 자원 절약 + 명확한 UX

---

## 2. 백엔드 변경 사항

### API 요청 — `user_id` query param 제거됨

**Before (제거됨):**
```
POST /verify-audio?orientation=enhanced&user_id=abc123
```

**After (현재):**
```
POST /verify-audio?orientation=enhanced
Authorization: Bearer <JWT_TOKEN>
```

- `user_id` query parameter 제거됨
- `Authorization` 헤더에 JWT 토큰 전송
- 서버가 JWT에서 `user_id`를 자동 추출

### 비로그인 요청 → HTTP 401 즉시 반환 (스캔 실행 안 함)

```json
{
  "detail": "Please sign in to use this feature."
}
```

**서버는 인증 없이는 스캔을 실행하지 않습니다.**

---

## 3. 프론트엔드 수정 사항

### 3-1. Verify 버튼 클릭 시 로그인 체크 (Home.tsx, HomeTest.tsx)

**스캔 시작 전에 `isAuthenticated` 확인:**

```typescript
// startAnalysis() 함수 맨 앞에 추가
if (!isAuthenticated) {
  // 로그인 안내 표시 (API 호출하지 않음)
  setShowLoginPrompt(true);
  return;
}
```

### 3-2. 로그인 안내 UI

Verify 버튼 클릭 시 비로그인 상태면 표시:

```
┌──────────────────────────────────┐
│                                  │
│  🔒 Please sign in to continue  │
│                                  │
│  Sign in to analyze your audio   │
│  files with DetectX.             │
│                                  │
│  [ Sign in with Google ]         │  ← CTA 버튼
│                                  │
└──────────────────────────────────┘
```

**Tailwind 예시:**
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

### 3-3. API 호출 수정

**user_id query param 제거 (Home.tsx:514~516):**

현재:
```typescript
let apiUrl = `${DETECTX_API_URL}/verify-audio?orientation=${orientation}`;
if (user?.id) {
  apiUrl += `&user_id=${user.id}`;
}
```

변경:
```typescript
let apiUrl = `${DETECTX_API_URL}/verify-audio?orientation=${orientation}`;
// user_id query param 제거
```

**Authorization 헤더 추가 (Home.tsx:579~580):**

현재:
```typescript
xhr.open("POST", apiUrl);
xhr.send(formData);
```

변경:
```typescript
xhr.open("POST", apiUrl);
if (isAuthenticated && user) {
  const token = /* 세션 JWT access_token */;
  xhr.setRequestHeader("Authorization", `Bearer ${token}`);
}
xhr.send(formData);
```

### 3-4. 401 에러 처리

서버가 401을 반환할 경우 (토큰 만료, 잘못된 토큰 등):

```typescript
xhr.addEventListener("load", () => {
  if (xhr.status === 401) {
    // 로그인 안내 표시
    setShowLoginPrompt(true);
    return;
  }
  // ... 기존 로직
});
```

---

## 4. 필요 state 추가

```typescript
const [showLoginPrompt, setShowLoginPrompt] = useState(false);
```

`Home.tsx`, `HomeTest.tsx` 양쪽에 적용.

---

## 5. 수정 대상 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `client/src/pages/Home.tsx` | 로그인 체크, user_id 제거, Authorization 헤더, 401 처리, 로그인 안내 UI |
| `client/src/pages/HomeTest.tsx` | 동일 |
| `client/src/_core/hooks/useAuth.ts` | JWT access_token 노출 (필요 시) |

---

## 6. 인증 토큰 확인 사항

현재 `useAuth()` 훅은 `trpc.auth.me`로 사용자 정보만 조회하고, **JWT access_token을 반환하지 않음**.

서버가 기대하는 형태:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**확인 필요:**
- Google OAuth 세션에서 JWT token을 가져올 수 있는 방법
- 또는 `/api/oauth/callback`에서 토큰을 쿠키/localStorage에 저장하고 있는지
- 가장 간단한 방법: `useAuth()`에 `token` 필드 추가

---

## 7. 테스트 시나리오

| # | 시나리오 | 기대 결과 |
|---|---------|----------|
| 1 | 비로그인 + Verify 버튼 클릭 | 로그인 안내 표시 (스캔 실행 안 됨) |
| 2 | 로그인 + Verify 버튼 클릭 | 정상 스캔 + 결과 표시 |
| 3 | 로그인 → 스캔 → 로그아웃 → 재스캔 | 로그인 안내 표시 |
| 4 | 로그인 안내에서 CTA 클릭 | `/login` 페이지 이동 |
| 5 | 토큰 만료 상태에서 스캔 | 서버 401 → 로그인 안내 표시 |

---

## 8. API 응답 정리

| HTTP Status | 의미 | 프론트 대응 |
|-------------|------|------------|
| 200 | 로그인 → 정상 결과 | 기존 로직 |
| 401 | 비로그인 또는 토큰 만료 | 로그인 안내 표시 |
| 400 | 파일 형식 오류 등 | 기존 에러 처리 |
| 500 | 서버 에러 | 기존 에러 처리 |
