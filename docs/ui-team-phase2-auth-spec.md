# Phase 2: Google OAuth 인증 전환 — 프론트엔드 작업 지시서

**작성일:** 2026-01-31

---

## 개요

Manus tRPC 기반 인증을 **RunPod FastAPI 서버 직접 인증(JWT)**으로 전환합니다.

### 변경 전 (현재)
```
[프론트엔드] → /api/auth/google → [Manus 서버 Passport.js] → Google OAuth
             → app_session_id 쿠키 설정
             → tRPC auth.me로 유저 조회
```

### 변경 후
```
[프론트엔드] → RunPod /auth/google → Google OAuth
             → /auth/google/callback → JWT 발급
             → detectx.app/auth/callback?token=xxx 리다이렉트
             → localStorage에 JWT 저장
             → 모든 API 호출에 Authorization: Bearer <JWT> 헤더
```

---

## 1. 백엔드 (이미 완료)

RunPod 서버에 이미 구현된 엔드포인트:

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/auth/google` | GET | Google OAuth 시작 (Google 로그인 페이지로 리다이렉트) |
| `/auth/google/callback` | GET | OAuth 콜백 → JWT 생성 → `detectx.app/auth/callback?token=<JWT>` 리다이렉트 |
| `/auth/me` | GET | Bearer 토큰 → 현재 유저 정보 반환 |
| `/verify-audio` | POST | Bearer 토큰 인증 (기존 `user_id` query param도 호환) |
| `/history` | GET | Bearer 토큰 인증 |
| `/history/stats` | GET | Bearer 토큰 인증 |

### `/auth/me` 응답 형식

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@gmail.com",
  "name": "김유저",
  "role": "user",
  "plan": "free",
  "usage_count": 2,
  "monthly_limit": 5,
  "remaining": 3,
  "usage_reset_date": "2026-03-01",
  "created_at": "2026-01-31T12:00:00",
  "last_signed_in": "2026-01-31T15:30:00"
}
```

**RunPod API Base URL:** `https://emjvw2an6oynf9-8000.proxy.runpod.net`

---

## 2. 프론트엔드 변경 사항

### 2-1. 새 페이지 추가: `/auth/callback`

OAuth 완료 후 RunPod가 `https://detectx.app/auth/callback?token=<JWT>` 로 리다이렉트합니다.
이 토큰을 받아서 localStorage에 저장하는 페이지가 필요합니다.

**파일:** `client/src/pages/AuthCallback.tsx` (신규 생성)

```tsx
import { useEffect } from "react";
import { useLocation } from "wouter";

const RUNPOD_API_URL = import.meta.env.VITE_DETECTX_API_URL
  || "https://emjvw2an6oynf9-8000.proxy.runpod.net";

export default function AuthCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (error) {
      console.error("[Auth] OAuth error:", error);
      setLocation("/login?error=" + error);
      return;
    }

    if (token) {
      // JWT를 localStorage에 저장
      localStorage.setItem("detectx_token", token);

      // 유저 정보를 미리 가져와서 캐시
      fetch(`${RUNPOD_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((user) => {
          localStorage.setItem("detectx_user", JSON.stringify(user));
          // 메인 페이지로 이동
          setLocation("/verify-audio");
        })
        .catch(() => {
          // 토큰은 저장되었으니 메인으로 이동 (useAuth에서 재시도)
          setLocation("/verify-audio");
        });
    } else {
      setLocation("/login?error=no_token");
    }
  }, [setLocation]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Signing in...</p>
      </div>
    </div>
  );
}
```

**라우터 등록:** `client/src/App.tsx` (또는 라우팅 파일)

```tsx
import AuthCallback from "./pages/AuthCallback";

// 라우트 추가
<Route path="/auth/callback" component={AuthCallback} />
```

---

### 2-2. `useAuth` 훅 수정

**파일:** `client/src/_core/hooks/useAuth.ts`

**현재 (Manus tRPC 기반):**
```typescript
const { data: user } = trpc.auth.me.useQuery();
```

**변경 후 (RunPod JWT 기반):**

```typescript
import { useState, useEffect, useCallback } from "react";

const RUNPOD_API_URL = import.meta.env.VITE_DETECTX_API_URL
  || "https://emjvw2an6oynf9-8000.proxy.runpod.net";

interface User {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
  plan: string;
  usage_count: number;
  monthly_limit: number;
  remaining: number;
  usage_reset_date: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    // localStorage에서 캐시된 유저 정보 복원
    const cached = localStorage.getItem("detectx_user");
    return cached ? JSON.parse(cached) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("detectx_token");
  const isAuthenticated = !!user && !!token;

  // 유저 정보 조회
  const fetchUser = useCallback(async () => {
    const currentToken = localStorage.getItem("detectx_token");
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${RUNPOD_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      if (res.status === 401) {
        // 토큰 만료/무효 → 로그아웃 처리
        localStorage.removeItem("detectx_token");
        localStorage.removeItem("detectx_user");
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        localStorage.setItem("detectx_user", JSON.stringify(userData));
      }
    } catch (err) {
      console.error("[Auth] Failed to fetch user:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // 로그아웃
  const logout = useCallback(() => {
    localStorage.removeItem("detectx_token");
    localStorage.removeItem("detectx_user");
    setUser(null);
    window.location.href = "/login";
  }, []);

  // 유저 정보 새로고침 (스캔 후 usage_count 업데이트 등)
  const refreshUser = useCallback(() => {
    return fetchUser();
  }, [fetchUser]);

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    refreshUser,
  };
}
```

---

### 2-3. 로그인 페이지 수정

**파일:** `client/src/pages/Login.tsx`

**현재:**
```typescript
window.location.href = "/api/auth/google";
```

**변경:**
```typescript
const RUNPOD_API_URL = import.meta.env.VITE_DETECTX_API_URL
  || "https://emjvw2an6oynf9-8000.proxy.runpod.net";

// "Sign in with Google" 버튼 onClick
window.location.href = `${RUNPOD_API_URL}/auth/google`;
```

> RunPod 서버의 `/auth/google` 엔드포인트가 Google OAuth 페이지로 리다이렉트합니다.
> OAuth 완료 후 RunPod이 `detectx.app/auth/callback?token=<JWT>` 로 리다이렉트합니다.

---

### 2-4. API 호출에 Bearer 토큰 추가

모든 RunPod API 호출에 `Authorization: Bearer <token>` 헤더를 추가합니다.
기존 `?user_id=xxx` query param은 **제거**합니다.

#### 공통 헬퍼 함수 (권장)

**파일:** `client/src/lib/api.ts` (신규 또는 기존 유틸에 추가)

```typescript
const RUNPOD_API_URL = import.meta.env.VITE_DETECTX_API_URL
  || "https://emjvw2an6oynf9-8000.proxy.runpod.net";

export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("detectx_token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export function getApiUrl(path: string): string {
  return `${RUNPOD_API_URL}${path}`;
}
```

#### verify-audio 호출 변경

**파일:** `client/src/pages/Home.tsx` (및 `HomeTest.tsx`)

**현재:**
```typescript
const apiUrl = `${DETECTX_API_URL}/verify-audio?orientation=${orientation}`;
if (user?.id) {
  apiUrl += `&user_id=${user.id}`;
}

const xhr = new XMLHttpRequest();
xhr.open("POST", apiUrl, true);
```

**변경:**
```typescript
const apiUrl = `${DETECTX_API_URL}/verify-audio?orientation=${orientation}`;
// user_id query param 제거 — 서버가 JWT에서 유저를 식별

const xhr = new XMLHttpRequest();
xhr.open("POST", apiUrl, true);

// Bearer 토큰 추가
const token = localStorage.getItem("detectx_token");
if (token) {
  xhr.setRequestHeader("Authorization", `Bearer ${token}`);
}
```

#### history 호출 변경

**파일:** `client/src/pages/History.tsx` (및 `HistoryTest.tsx`)

**현재:**
```typescript
if (user?.id) {
  params.append("user_id", user.id);
}
const response = await fetch(`${API_BASE}/history?${params}`);
```

**변경:**
```typescript
// user_id 제거
const response = await fetch(`${API_BASE}/history?${params}`, {
  headers: { ...getAuthHeaders() },
});
```

#### history/stats 호출 변경

**현재:**
```typescript
const response = await fetch(`${API_BASE}/history/stats?user_id=${user?.id}`);
```

**변경:**
```typescript
const response = await fetch(`${API_BASE}/history/stats`, {
  headers: { ...getAuthHeaders() },
});
```

---

### 2-5. 로그아웃 처리

**현재:**
```typescript
// tRPC mutation
trpc.auth.logout.mutate();
```

**변경:**
```typescript
// useAuth 훅의 logout() 사용
const { logout } = useAuth();

// 로그아웃 버튼 onClick
logout();
```

`logout()` 함수가 localStorage에서 토큰과 유저 정보를 삭제하고 `/login`으로 이동합니다.
서버 측 세션은 없으므로 서버 호출은 불필요합니다.

---

### 2-6. 스캔 후 usage 업데이트

**현재 (tRPC):**
```typescript
// 스캔 완료 후 usage increment
await trpc.usage.increment.mutate();
```

**변경:**
```typescript
// RunPod 서버가 /verify-audio 호출 시 자동으로 usage를 증가시킴
// 별도의 increment 호출 불필요!
// 대신, 스캔 완료 후 유저 정보를 새로고침하여 UI에 반영
const { refreshUser } = useAuth();

// 스캔 완료 콜백에서:
await refreshUser(); // /auth/me 재호출 → remaining 업데이트
```

---

### 2-7. 환경변수

**파일:** `.env` (또는 `.env.local`)

```bash
# RunPod API URL (프론트엔드에서 사용)
VITE_DETECTX_API_URL=https://emjvw2an6oynf9-8000.proxy.runpod.net
```

> 기존 `DETECTX_API_URL` 환경변수를 `VITE_DETECTX_API_URL`로 변경하거나,
> 기존 변수명을 유지하되 Vite에서 접근 가능하도록 `VITE_` 접두사를 추가하세요.

---

## 3. tRPC 의존성 정리

JWT 전환 완료 후 아래 tRPC 코드를 제거할 수 있습니다.

| 파일 | 제거 대상 | 비고 |
|------|----------|------|
| `server/routers.ts` | `auth.me`, `auth.logout`, `usage.increment` | contact/system만 유지 |
| `server/_core/googleOAuth.ts` | 전체 | RunPod이 OAuth 처리 |
| `server/_core/sdk.ts` | JWT 관련 함수 | RunPod이 JWT 처리 |
| `server/_core/context.ts` | 인증 컨텍스트 | 간소화 |
| `client/src/lib/trpc.ts` | `credentials: "include"` | 쿠키 인증 불필요 |

> **중요:** tRPC 정리는 JWT 전환이 완전히 동작 확인된 후 진행하세요.
> 1단계: JWT 인증 추가 + 동작 확인
> 2단계: tRPC 의존성 제거

---

## 4. 401 에러 글로벌 처리

모든 API 호출에서 401 응답 시 자동 로그아웃 처리를 추가하면 편리합니다.

```typescript
// fetch wrapper 또는 interceptor
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("detectx_token");
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    // 토큰 만료 → 자동 로그아웃
    localStorage.removeItem("detectx_token");
    localStorage.removeItem("detectx_user");
    window.location.href = "/login?error=session_expired";
    throw new Error("Session expired");
  }

  return res;
}
```

---

## 5. 수정 대상 파일 요약

| 파일 | 변경 내용 | 우선순위 |
|------|----------|---------|
| `client/src/pages/AuthCallback.tsx` | **신규** — OAuth 콜백 페이지 | 1 |
| `client/src/App.tsx` (라우팅 파일) | `/auth/callback` 라우트 추가 | 1 |
| `client/src/_core/hooks/useAuth.ts` | tRPC → RunPod fetch 전환 | 1 |
| `client/src/pages/Login.tsx` | OAuth URL 변경 (RunPod) | 1 |
| `client/src/pages/Home.tsx` | Bearer 헤더 추가, user_id 제거 | 1 |
| `client/src/pages/HomeTest.tsx` | 동일 | 1 |
| `client/src/pages/History.tsx` | Bearer 헤더 추가, user_id 제거 | 1 |
| `client/src/pages/HistoryTest.tsx` | 동일 | 1 |
| `client/src/lib/api.ts` | **신규** — 공통 API 헬퍼 (선택) | 2 |
| `.env` | `VITE_DETECTX_API_URL` 추가 | 1 |

---

## 6. localStorage 키 정리

| 키 | 용도 | 설정 시점 |
|----|------|----------|
| `detectx_token` | JWT 토큰 | `/auth/callback` 페이지에서 |
| `detectx_user` | 유저 정보 캐시 (JSON) | `/auth/callback` 및 `useAuth` 에서 |

---

## 7. 테스트 시나리오

| # | 시나리오 | 기대 결과 |
|---|---------|----------|
| 1 | "Sign in with Google" 클릭 | RunPod `/auth/google` → Google 로그인 페이지 이동 |
| 2 | Google 로그인 완료 | `detectx.app/auth/callback?token=xxx` 리다이렉트 |
| 3 | AuthCallback 페이지 | 토큰 저장 → `/verify-audio`로 이동 |
| 4 | 로그인 후 네비게이션바 | 유저 이름/이메일 표시 |
| 5 | Verify 클릭 (로그인 상태) | 정상 스캔, Bearer 토큰 전송 |
| 6 | Verify 클릭 (비로그인) | 로그인 안내 표시 |
| 7 | History 페이지 (로그인) | 내 히스토리 정상 로드 |
| 8 | 로그아웃 클릭 | 토큰 삭제 → `/login` 이동 |
| 9 | 만료된 토큰으로 API 호출 | 401 → 자동 로그아웃 |
| 10 | 새 탭에서 열기 (토큰 있음) | localStorage에서 복원 → 로그인 유지 |
| 11 | 스캔 완료 후 사용량 표시 | `refreshUser()` → remaining 업데이트 |

---

## 8. 인증 흐름 다이어그램

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  detectx.app │     │ RunPod 서버   │     │   Google    │
│  (프론트엔드)  │     │ (FastAPI)    │     │   OAuth     │
└──────┬──────┘     └──────┬───────┘     └──────┬──────┘
       │                    │                     │
       │ 1. Sign in 클릭    │                     │
       │ ──────────────────>│                     │
       │ GET /auth/google   │                     │
       │                    │ 2. 307 Redirect     │
       │                    │ ───────────────────>│
       │                    │                     │
       │                    │  3. 유저 로그인       │
       │                    │  Google 동의 화면     │
       │                    │                     │
       │                    │ 4. code 콜백         │
       │                    │ <───────────────────│
       │                    │ GET /auth/google/    │
       │                    │     callback?code=   │
       │                    │                     │
       │                    │ 5. code → token 교환  │
       │                    │ ───────────────────>│
       │                    │ <───────────────────│
       │                    │ access_token        │
       │                    │                     │
       │                    │ 6. userinfo 조회     │
       │                    │ ───────────────────>│
       │                    │ <───────────────────│
       │                    │ email, name, id     │
       │                    │                     │
       │ 7. 리다이렉트       │                     │
       │ <──────────────────│                     │
       │ detectx.app/auth/  │                     │
       │ callback?token=JWT │                     │
       │                    │                     │
       │ 8. JWT 저장        │                     │
       │ (localStorage)     │                     │
       │                    │                     │
       │ 9. GET /auth/me    │                     │
       │ ──────────────────>│                     │
       │ Authorization:     │                     │
       │ Bearer <JWT>       │                     │
       │                    │                     │
       │ <──────────────────│                     │
       │ { user info }      │                     │
       │                    │                     │
       │ 10. 메인 페이지 이동 │                     │
       │ /verify-audio      │                     │
       └────────────────────┴─────────────────────┘
```

---

## 9. API 응답 정리

| HTTP Status | 의미 | 프론트 대응 |
|-------------|------|------------|
| 200 | 정상 | 기존 로직 |
| 307 | OAuth 리다이렉트 | 브라우저가 자동 처리 |
| 401 | 토큰 없음/만료/무효 | 로그아웃 + 로그인 페이지 이동 |
| 403 | 사용량 초과 | "이번 달 사용량을 초과했습니다" 표시 |
| 500 | 서버 에러 | 기존 에러 처리 |

---

## 10. 주의사항

1. **동시 지원 기간**: JWT 전환 중에도 기존 `?user_id=` 방식이 동작합니다. RunPod 서버가 두 방식 모두 지원하므로 점진적 전환이 가능합니다.

2. **CORS**: RunPod 서버는 `allow_origins=["*"]`로 설정되어 있으므로 CORS 문제는 없습니다.

3. **토큰 만료**: JWT는 30일 후 만료됩니다. 만료 시 401 응답이 오면 자동 로그아웃 처리하세요.

4. **보안**: JWT를 localStorage에 저장합니다. XSS 방어를 위해 사용자 입력을 항상 sanitize하세요.

5. **환경변수**: 프론트엔드에서 RunPod URL에 접근하려면 `VITE_` 접두사가 필요합니다 (Vite 빌드).
