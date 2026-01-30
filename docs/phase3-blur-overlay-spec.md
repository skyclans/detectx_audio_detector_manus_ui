# Phase 3: 비로그인 사용자 차단 — 프론트엔드 작업 지시서

**작성일:** 2026-01-30

---

## 1. UX 흐름

```
파일 업로드 → Verify 버튼 클릭 → 비로그인이면 즉시 차단 → 로그인 유도
```

---

## 2. 백엔드 변경 사항

모든 인증 필요 엔드포인트에서 `user_id` 없으면 **HTTP 401** 반환:

| 엔드포인트 | 용도 | user_id 없으면 |
|-----------|------|----------------|
| `POST /verify-audio` | 오디오 스캔 | 401 (스캔 실행 안 함) |
| `GET /history` | 히스토리 조회 | 401 |
| `GET /history/stats` | 통계 조회 | 401 |

```json
{ "detail": "Please sign in to use this feature." }
```

---

## 3. 긴급 수정: user_id query param 복원

### 현재 문제

`Home.tsx:628`에서 `user_id` query param이 제거되어 있음.
이로 인해 **로그인 사용자도 스캔/히스토리가 안 됨.**

### 3-1. verify-audio 호출 — user_id 복원 (Home.tsx, HomeTest.tsx)

현재 (잘못됨):
```typescript
const apiUrl = `${DETECTX_API_URL}/verify-audio?orientation=${orientation}`;
```

수정:
```typescript
let apiUrl = `${DETECTX_API_URL}/verify-audio?orientation=${orientation}`;
if (user?.id) {
  apiUrl += `&user_id=${user.id}`;
}
```

### 3-2. history 호출 — user_id 추가 (History.tsx)

현재 (잘못됨):
```typescript
const response = await fetch(`${API_BASE}/history?${params}`);
```

수정:
```typescript
if (user?.id) {
  params.append("user_id", user.id);
}
const response = await fetch(`${API_BASE}/history?${params}`);
```

### 3-3. history/stats 호출 — user_id 추가 (History.tsx)

현재 (잘못됨):
```typescript
const response = await fetch(`${API_BASE}/history/stats`);
```

수정:
```typescript
const response = await fetch(`${API_BASE}/history/stats?user_id=${user?.id}`);
```

---

## 4. 비로그인 차단 UI

### 4-1. Verify 버튼 클릭 시 로그인 체크

```typescript
// startAnalysis() 함수 맨 앞에 추가
if (!isAuthenticated) {
  setShowLoginPrompt(true);
  return;
}
```

### 4-2. History 페이지 접근 시 로그인 체크

```typescript
// History.tsx useEffect에 추가
if (!isAuthenticated) {
  setLocation("/login");
  return;
}
```

### 4-3. 로그인 안내 UI (Verify 페이지)

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

### 4-4. 401 에러 처리 (fallback)

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

## 5. 필요 state

```typescript
const [showLoginPrompt, setShowLoginPrompt] = useState(false);
```

---

## 6. 수정 대상 파일

| 파일 | 변경 내용 | 우선순위 |
|------|----------|---------|
| `client/src/pages/Home.tsx` | `user_id` query param 복원 + 로그인 체크 + 401 처리 | 긴급 |
| `client/src/pages/HomeTest.tsx` | 동일 | 긴급 |
| `client/src/pages/History.tsx` | `user_id` 추가 + 비로그인 리다이렉트 | 긴급 |
| `client/src/pages/HistoryTest.tsx` | 동일 | 긴급 |

---

## 7. 테스트 시나리오

| # | 시나리오 | 기대 결과 |
|---|---------|----------|
| 1 | 비로그인 + Verify 클릭 | 로그인 안내 표시 (스캔 안 됨) |
| 2 | 로그인 + Verify 클릭 | 정상 스캔 + 결과 표시 |
| 3 | 로그인 + History 페이지 | 내 히스토리만 표시 |
| 4 | 비로그인 + History 페이지 | `/login`으로 리다이렉트 |

---

## 8. API 응답 정리

| HTTP Status | 의미 | 프론트 대응 |
|-------------|------|------------|
| 200 | 로그인 → 정상 결과 | 기존 로직 |
| 401 | 비로그인 (user_id 없음) | 로그인 안내 표시 |
| 400 | 파일 형식 오류 등 | 기존 에러 처리 |
| 500 | 서버 에러 | 기존 에러 처리 |
