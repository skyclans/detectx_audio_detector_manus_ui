# UI 팀 작업지시서: Admin 페이지 — tRPC → REST API 전환

**작성일:** 2026-01-31
**우선순위:** 높음

---

## 요약

Admin 패널의 모든 tRPC 호출을 RunPod REST API로 전환합니다.
서버에 `/api/admin/*` 엔드포인트가 배포 완료되었습니다.

**기존:** tRPC (`trpc.admin.*`) → Manus 서버
**변경:** REST API (`/api/admin/*`) → RunPod 서버 (JWT 인증)

---

## API Base URL

```typescript
const API_BASE = "https://emjvw2an6oynf9-8000.proxy.runpod.net";
```

모든 요청에 JWT Bearer 토큰을 포함해야 합니다:

```typescript
const headers = {
  "Authorization": `Bearer ${localStorage.getItem("detectx_token")}`,
  "Content-Type": "application/json",
};
```

---

## 엔드포인트 매핑: tRPC → REST

### Admin 상태 확인

| tRPC | REST | 메서드 |
|------|------|--------|
| `trpc.admin.checkAdminStatus` | `GET /api/admin/check-status` | GET |

**응답:**
```json
{ "isAdmin": true, "isSuperAdmin": true }
```

> **참고:** 모든 인증된 유저가 호출 가능. admin이 아닌 유저도 `false`를 받을 수 있음.

---

### Dashboard

| tRPC | REST | 메서드 |
|------|------|--------|
| (직접 fetch 유지) | `GET /api/admin/dashboard` | GET |

**응답:**
```json
{
  "total_verifications": 469,
  "today_verifications": 12,
  "ai_detected": 285,
  "human_detected": 184,
  "ai_detection_rate": 60.8,
  "total_users": 15,
  "active_users_today": 3,
  "active_users_week": 8,
  "verifications_trend": [
    { "date": "2026-01-25", "count": 5 },
    { "date": "2026-01-26", "count": 12 }
  ],
  "plan_distribution": {
    "free": 10,
    "pro": 3,
    "enterprise": 1,
    "master": 1
  }
}
```

> **Dashboard.tsx:** 기존 `GET ${API_BASE}/api/admin/dashboard` fetch는 그대로 유지.
> 인증 헤더만 추가하세요.

---

### 유저 관리

| tRPC | REST | 메서드 |
|------|------|--------|
| `trpc.admin.getUsers` | `GET /api/admin/users?search=&plan=&page=1&limit=20` | GET |
| `trpc.admin.getUser` | `GET /api/admin/users/{uid}` | GET |
| `trpc.admin.getUserStats` (RunPod) | `GET /api/admin/users/{uid}/stats` | GET |
| `trpc.admin.getRunPodUserVerifications` | `GET /api/admin/users/{uid}/verifications?page=1&limit=20&startDate=&endDate=` | GET |
| `trpc.admin.changePlan` | `POST /api/admin/users/change-plan` | POST |
| `trpc.admin.modifyUsage` | `POST /api/admin/users/modify-usage` | POST |
| `trpc.admin.resetUsage` | `POST /api/admin/users/reset-usage` | POST |
| `trpc.admin.bulkChangePlan` | `POST /api/admin/users/bulk/change-plan` | POST |
| `trpc.admin.bulkResetUsage` | `POST /api/admin/users/bulk/reset-usage` | POST |

#### GET /api/admin/users

**쿼리 파라미터:** `search`, `plan`, `page`, `limit`

**응답:**
```json
{
  "users": [
    {
      "id": "uuid-string",
      "name": "홍길동",
      "email": "hong@example.com",
      "plan": "free",
      "role": "user",
      "usageCount": 3,
      "monthlyLimit": 5,
      "usageResetDate": "2026-02-01T00:00:00",
      "createdAt": "2026-01-15T10:00:00",
      "lastSignedIn": "2026-01-31T14:00:00"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

> **주의:** user ID가 숫자가 아닌 **UUID 문자열**입니다.
> tRPC에서 `z.number()`로 받던 userId를 `string`으로 변경해야 합니다.

#### GET /api/admin/users/{uid}

**응답:** 위 users 배열 항목과 동일한 구조

#### GET /api/admin/users/{uid}/stats

**응답:**
```json
{
  "totalVerifications": 25,
  "observedCount": 15,
  "notObservedCount": 10
}
```

#### GET /api/admin/users/{uid}/verifications

**쿼리 파라미터:** `page`, `limit`, `startDate`, `endDate`

**응답:**
```json
{
  "verifications": [
    {
      "id": "abc123",
      "fileName": "song.mp3",
      "fileSize": 5242880,
      "duration": 180.5,
      "verdict": "observed",
      "status": "completed",
      "createdAt": "2026-01-31T10:00:00"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20,
  "totalPages": 2
}
```

#### POST /api/admin/users/change-plan

**요청:**
```json
{ "userId": "uuid-string", "plan": "pro" }
```

**응답:**
```json
{ "success": true, "message": "Plan changed to pro" }
```

#### POST /api/admin/users/modify-usage

**요청:**
```json
{
  "userId": "uuid-string",
  "usageCount": 0,
  "monthlyLimit": 50,
  "extensionDays": 30
}
```

> 모든 필드 optional (null/미포함 = 변경 안 함)

#### POST /api/admin/users/reset-usage

**요청:**
```json
{ "userId": "uuid-string" }
```

#### POST /api/admin/users/bulk/change-plan

**요청:**
```json
{ "userIds": ["uuid1", "uuid2"], "plan": "pro" }
```

#### POST /api/admin/users/bulk/reset-usage

**요청:**
```json
{ "userIds": ["uuid1", "uuid2"] }
```

---

### Admin 관리

| tRPC | REST | 메서드 |
|------|------|--------|
| `trpc.admin.getAdmins` | `GET /api/admin/admins` | GET |
| `trpc.admin.addAdmin` | `POST /api/admin/admins` | POST |
| `trpc.admin.removeAdmin` | `DELETE /api/admin/admins/{email}` | DELETE |

#### GET /api/admin/admins

**응답:**
```json
[
  {
    "id": 1,
    "email": "ceo@detectx.app",
    "isSuperAdmin": true,
    "addedBy": "system",
    "createdAt": "2026-01-31T00:00:00"
  }
]
```

#### POST /api/admin/admins (super admin 전용)

**요청:**
```json
{ "email": "newadmin@example.com", "isSuperAdmin": false }
```

#### DELETE /api/admin/admins/{email} (super admin 전용)

---

### Activity Logs

| tRPC | REST | 메서드 |
|------|------|--------|
| `trpc.admin.getLogs` | `GET /api/admin/logs?adminEmail=&action=&startDate=&endDate=&page=1&limit=50` | GET |

**응답:**
```json
{
  "logs": [
    {
      "id": 1,
      "adminEmail": "ceo@detectx.app",
      "action": "plan_change",
      "targetType": "user",
      "targetId": "uuid",
      "targetEmail": "user@example.com",
      "previousValue": "free",
      "newValue": "pro",
      "details": "Changed plan from free to pro",
      "createdAt": "2026-01-31T14:00:00"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 50,
  "totalPages": 1
}
```

---

### Verifications (전체)

| tRPC | REST | 메서드 |
|------|------|--------|
| `trpc.admin.getRunPodVerifications` | `GET /api/admin/verifications?search=&verdict=&status=&startDate=&endDate=&page=1&limit=20` | GET |
| `trpc.admin.getRunPodStats` | `GET /api/admin/stats` | GET |
| `trpc.admin.checkRunPodHealth` | `GET /api/admin/health` | GET |

#### GET /api/admin/stats

**응답:**
```json
{
  "totalVerifications": 469,
  "observedCount": 285,
  "notObservedCount": 184,
  "pendingCount": 0
}
```

#### GET /api/admin/health

**응답:**
```json
{ "connected": true, "status": "healthy" }
```

---

## 수정 대상 파일

| 파일 | 변경 | 우선순위 |
|------|------|---------|
| `client/src/pages/admin/Dashboard.tsx` | 인증 헤더 추가 | 높음 |
| `client/src/pages/admin/Users.tsx` | tRPC → REST fetch 전환 + userId number→string | 높음 |
| `client/src/pages/admin/UserDetail.tsx` | tRPC → REST fetch 전환 | 높음 |
| `client/src/pages/admin/Verifications.tsx` | tRPC → REST fetch 전환 | 높음 |
| `client/src/pages/admin/Logs.tsx` | tRPC → REST fetch 전환 | 높음 |
| `client/src/components/AdminLayout.tsx` | `ADMIN_EMAILS` 하드코딩 제거 → `/api/admin/check-status` 사용 | 중간 |
| `server/adminRouter.ts` | 제거 또는 deprecated 처리 | 낮음 |

---

## 핵심 변경 사항

### 1. User ID 타입 변경

```typescript
// 기존 (Manus)
userId: number

// 변경 (RunPod)
userId: string  // UUID (예: "a1b2c3d4-5678-90ab-cdef-1234567890ab")
```

모든 admin 페이지에서 userId 타입을 `number` → `string`으로 변경.

### 2. AdminLayout 접근 제어

```typescript
// 기존: 하드코딩된 ADMIN_EMAILS 배열
const ADMIN_EMAILS = ["ceo@detectx.app", ...];

// 변경: 서버에서 확인
const { data } = useFetch("/api/admin/check-status");
if (!data?.isAdmin) return <AccessDenied />;
```

> 서버의 `admin_users` 테이블이 관리자 목록의 single source of truth.
> 초기 super admin: skyclans2@gmail.com, ceo@detectx.app, support@detectx.app, coolkimy@naver.com, skyclans@naver.com

### 3. fetch 래퍼 사용

`client/src/lib/api.ts`의 `fetchWithAuth`를 사용하면 자동으로 JWT 헤더가 추가됩니다:

```typescript
import { fetchWithAuth } from "@/lib/api";

// 사용 예
const response = await fetchWithAuth("/api/admin/users?page=1&limit=20");
const data = await response.json();
```

---

## 테스트 시나리오

| # | 시나리오 | 기대 결과 |
|---|---------|----------|
| 1 | Admin 이메일로 로그인 → /admin 접근 | Dashboard 정상 표시 |
| 2 | 비 Admin 이메일로 /admin 접근 | "Access Denied" 또는 리다이렉트 |
| 3 | Users 페이지에서 유저 검색 | 검색 결과 표시 |
| 4 | 유저 플랜 변경 (free → pro) | 성공 메시지 + Activity Log 기록 |
| 5 | 유저 사용량 리셋 | 성공 + usage_count = 0 |
| 6 | Bulk 플랜 변경 (여러 유저 선택) | 모든 선택 유저 플랜 변경 |
| 7 | Admin 추가 (super admin) | 새 admin 추가 성공 |
| 8 | Verifications 페이지 | 전체 스캔 기록 표시 |
| 9 | Activity Logs 페이지 | admin 활동 기록 표시 |
| 10 | User Detail → verification history | 해당 유저 스캔 기록 표시 |
