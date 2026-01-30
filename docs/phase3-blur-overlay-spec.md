# Phase 3: UI 블러 오버레이 — 프론트엔드 작업 지시서

**작성일:** 2026-01-30
**백엔드 상태:** Phase 1 (JWT 인증) + Phase 2 (응답 분기) 배포 완료

---

## 1. 백엔드 변경 사항 요약

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

- `user_id` query parameter는 더 이상 사용하지 않음
- 대신 `Authorization` 헤더에 JWT 토큰을 전송
- 서버가 JWT에서 `user_id`를 자동 추출 (`sub` claim)

### API 응답 — 두 가지 타입

#### (A) 로그인 사용자 — 기존과 동일
```json
{
  "verdict": "AI signal evidence was observed.",
  "orientation": "enhanced",
  "exceeded_axes": ["FS-X"],
  "cnn_score": 0.95,
  "geometry_exceeded": true,
  "notice": "Enhanced Mode: ...",
  "metadata": { "duration": 180.5, "sample_rate": 44100, ... },
  "detailed_analysis": { ... },
  "recon_metrics": { ... }
}
```

#### (B) 비로그인 사용자 — 신규 preview 응답
```json
{
  "verdict": null,
  "orientation": "enhanced",
  "exceeded_axes": [],
  "cnn_score": null,
  "geometry_exceeded": null,
  "notice": "Enhanced Mode: ...",
  "metadata": { "duration": 180.5, "sample_rate": 44100, ... },
  "detailed_analysis": null,
  "recon_metrics": null,
  "preview": true,
  "message": "Sign in to view full analysis results"
}
```

**구분 방법:** `response.preview === true` 이면 비로그인 블러 응답

---

## 2. 프론트엔드 수정 사항

### 2-1. API 호출 수정 (`Home.tsx`, `HomeTest.tsx`)

**현재 코드 (Home.tsx:514~516):**
```typescript
let apiUrl = `${DETECTX_API_URL}/verify-audio?orientation=${orientation}`;
if (user?.id) {
  apiUrl += `&user_id=${user.id}`;
}
```

**변경:**
```typescript
let apiUrl = `${DETECTX_API_URL}/verify-audio?orientation=${orientation}`;
// user_id query param 제거 — JWT 헤더로 대체
```

**XHR 헤더 추가 (Home.tsx:579~580):**

현재:
```typescript
xhr.open("POST", apiUrl);
xhr.send(formData);
```

변경:
```typescript
xhr.open("POST", apiUrl);
// 로그인 사용자: JWT 토큰을 Authorization 헤더로 전송
if (isAuthenticated && user) {
  const token = /* 현재 세션의 JWT access_token 획득 */;
  xhr.setRequestHeader("Authorization", `Bearer ${token}`);
}
xhr.send(formData);
```

> **참고:** JWT 토큰 획득 방법은 현재 인증 시스템(Manus OAuth)에 따라 결정 필요.
> `useAuth()` 훅에서 access_token을 노출하거나, 별도 방법으로 토큰을 가져와야 함.

### 2-2. 응답 처리 — preview 분기 추가 (`Home.tsx:588~`)

현재 `result` 수신 후 바로 verdict 파싱하는 코드에 preview 체크 추가:

```typescript
// 기존 결과 처리 전에 preview 체크
if (result.preview) {
  // 블러 모드 상태 설정
  setPreviewMode(true);
  setPreviewMessage(result.message);
  setScanComplete(true);
  return;
}

// 기존 로직 (verdict 파싱 등) 그대로 유지
const verdictText: DetectXVerdictText | null = ...
```

### 2-3. 블러 오버레이 UI 구현

`preview === true` 상태일 때 결과 영역에 블러 오버레이 렌더링:

```
┌──────────────────────────────────┐
│  ┌────────────────────────────┐  │
│  │ ░░░░░ Verdict ░░░░░░░░░░  │  │  ← 블러
│  │ ░░░░░ CNN Score ░░░░░░░░  │  │  ← 블러
│  │ ░░░░░ RECON Metrics ░░░░  │  │  ← 블러
│  │ ░░░░░ Detailed Analysis ░ │  │  ← 블러
│  └────────────────────────────┘  │
│                                  │
│  🔒 분석이 완료되었습니다         │
│  로그인하여 결과를 확인하세요      │
│  [ Google로 로그인 ]             │  ← CTA 버튼
│                                  │
└──────────────────────────────────┘
```

**구현 방식 (권장):**
- 결과 영역에 더미 placeholder 데이터를 렌더링 (회색 바 또는 skeleton)
- `backdrop-filter: blur(8px)` 또는 불투명 오버레이로 덮기
- 가운데에 로그인 CTA 버튼 배치
- `metadata` (파일 정보: 길이, 샘플레이트 등)는 블러하지 않아도 됨 (서버가 그대로 반환)

**Tailwind 예시:**
```tsx
{previewMode && (
  <div className="relative">
    {/* 블러 배경 — skeleton placeholder */}
    <div className="filter blur-md pointer-events-none opacity-50">
      {/* 더미 verdict, score 영역 */}
    </div>

    {/* 오버레이 CTA */}
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl">
      <Lock className="w-8 h-8 mb-3 text-muted-foreground" />
      <p className="text-lg font-medium mb-1">분석이 완료되었습니다</p>
      <p className="text-sm text-muted-foreground mb-4">로그인하여 결과를 확인하세요</p>
      <Button onClick={() => window.location.href = getLoginUrl()}>
        Google로 로그인
      </Button>
    </div>
  </div>
)}
```

---

## 3. 필요 state 추가

```typescript
const [previewMode, setPreviewMode] = useState(false);
const [previewMessage, setPreviewMessage] = useState<string | null>(null);
```

`Home.tsx`, `HomeTest.tsx` 양쪽에 동일하게 적용.

---

## 4. 수정 대상 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `client/src/pages/Home.tsx` | API 호출 (헤더 추가, user_id 제거), preview 응답 처리, 블러 UI |
| `client/src/pages/HomeTest.tsx` | 동일 |
| `client/src/_core/hooks/useAuth.ts` | JWT access_token 노출 (필요 시) |

---

## 5. 인증 토큰 관련 확인 사항

현재 `useAuth()` 훅은 `trpc.auth.me`로 사용자 정보만 조회하고, **JWT access_token을 반환하지 않음**.

서버가 기대하는 형태:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**확인 필요:**
- Manus OAuth 세션에서 JWT token을 가져올 수 있는 방법
- 또는 서버 `/api/oauth/callback` 응답에서 토큰을 쿠키/localStorage에 저장하고 있는지
- 가장 간단한 방법: `useAuth()`에 `token` 필드를 추가하여 access_token 노출

---

## 6. 테스트 시나리오

| # | 시나리오 | 기대 결과 |
|---|---------|----------|
| 1 | 비로그인 상태에서 파일 스캔 | 블러 오버레이 + 로그인 CTA 표시 |
| 2 | 로그인 상태에서 파일 스캔 | 기존과 동일한 전체 결과 표시 |
| 3 | 로그인 → 스캔 → 로그아웃 → 재스캔 | 블러 오버레이 전환 |
| 4 | 블러 상태에서 CTA 클릭 | 로그인 페이지 이동 |
| 5 | 잘못된 토큰 (만료 등) | 서버 401 → 에러 처리 또는 재인증 유도 |

---

## 7. 백엔드 API 에러 응답

| HTTP Status | 의미 | 프론트 대응 |
|-------------|------|------------|
| 200 + `preview: true` | 비로그인 → 블러 | 블러 오버레이 표시 |
| 200 (preview 없음) | 로그인 → 정상 결과 | 기존 로직 |
| 401 | 토큰 만료/잘못됨 | 재로그인 유도 |
| 500 | 서버 에러 | 기존 에러 처리 |
