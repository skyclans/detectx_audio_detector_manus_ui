# DetectX Admin API Specification

## Overview

관리자 페이지를 위한 API 명세서입니다.
모든 Admin API는 `/api/admin` prefix를 사용합니다.

**인증:** Admin API는 관리자 인증이 필요합니다 (추후 구현).

---

## 1. Dashboard API

### GET /api/admin/dashboard

전체 통계 데이터를 반환합니다.

**Response:**
```json
{
  "total_verifications": 659,
  "today_verifications": 45,
  "ai_detected": 312,
  "human_detected": 347,
  "ai_detection_rate": 47.3,
  "total_users": 128,
  "active_users_today": 23,
  "active_users_week": 89,
  "verifications_trend": [
    {"date": "2026-01-13", "count": 42},
    {"date": "2026-01-14", "count": 56},
    {"date": "2026-01-15", "count": 38},
    {"date": "2026-01-16", "count": 71},
    {"date": "2026-01-17", "count": 63},
    {"date": "2026-01-18", "count": 52},
    {"date": "2026-01-19", "count": 45}
  ],
  "plan_distribution": {
    "free": 98,
    "pro": 25,
    "enterprise": 5
  }
}
```

---

## 2. Users API

### GET /api/admin/users

사용자 목록을 반환합니다.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | int | 50 | 최대 반환 수 (max 100) |
| offset | int | 0 | 페이지네이션 오프셋 |
| search | string | null | 이메일/이름 검색 |
| plan | string | null | Plan 필터 (free, pro, enterprise) |
| sort_by | string | created_at | 정렬 기준 (created_at, usage, email) |
| sort_order | string | desc | 정렬 방향 (asc, desc) |

**Response:**
```json
{
  "users": [
    {
      "user_id": "user_abc123",
      "email": "user@example.com",
      "name": "John Doe",
      "plan_type": "free",
      "monthly_limit": 10,
      "used_this_month": 7,
      "remaining": 3,
      "total_verifications": 45,
      "last_verification_at": "2026-01-18T14:33:27",
      "created_at": "2026-01-05T10:00:00",
      "reset_date": "2026-02-01T00:00:00"
    }
  ],
  "count": 1,
  "total": 128
}
```

### GET /api/admin/users/{user_id}

특정 사용자 상세 정보를 반환합니다.

**Response:**
```json
{
  "user_id": "user_abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "plan_type": "pro",
  "monthly_limit": 20,
  "used_this_month": 15,
  "remaining": 5,
  "total_verifications": 156,
  "created_at": "2026-01-05T10:00:00",
  "reset_date": "2026-02-01T00:00:00",
  "settings": {
    "default_orientation": "enhanced",
    "notifications_enabled": true,
    "language": "ko"
  },
  "recent_verifications": [
    {
      "id": "6ffab5cf-934",
      "filename": "741Hz Vibes.mp3",
      "verdict": "AI signal evidence was observed.",
      "created_at": "2026-01-18T14:33:27"
    }
  ]
}
```

### PUT /api/admin/users/{user_id}/plan

사용자 Plan을 변경합니다.

**Request Body:**
```json
{
  "plan_type": "pro",
  "monthly_limit": 20
}
```

**Response:**
```json
{
  "success": true,
  "user_id": "user_abc123",
  "previous_plan": "free",
  "new_plan": "pro",
  "monthly_limit": 20
}
```

### POST /api/admin/users/{user_id}/reset-usage

사용자 월간 사용량을 리셋합니다.

**Response:**
```json
{
  "success": true,
  "user_id": "user_abc123",
  "previous_usage": 15,
  "new_usage": 0
}
```

### DELETE /api/admin/users/{user_id}

사용자를 삭제합니다 (soft delete).

**Response:**
```json
{
  "success": true,
  "user_id": "user_abc123",
  "deleted_at": "2026-01-19T12:00:00"
}
```

---

## 3. Verifications API

### GET /api/admin/verifications

전체 검증 기록을 반환합니다.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | int | 50 | 최대 반환 수 (max 100) |
| offset | int | 0 | 페이지네이션 오프셋 |
| user_id | string | null | 사용자 필터 |
| verdict | string | null | 결과 필터 (ai, human) |
| start_date | string | null | 시작 날짜 (YYYY-MM-DD) |
| end_date | string | null | 종료 날짜 (YYYY-MM-DD) |
| search | string | null | 파일명 검색 |

**Response:**
```json
{
  "verifications": [
    {
      "id": "6ffab5cf-934",
      "user_id": "user_abc123",
      "user_email": "user@example.com",
      "filename": "741Hz Vibes.mp3",
      "verdict": "AI signal evidence was observed.",
      "cnn_score": 0.9987,
      "exceeded_axes": ["CNN", "RECON_DIFF"],
      "orientation": "enhanced",
      "duration_sec": 234.24,
      "file_size": 5614157,
      "created_at": "2026-01-18T14:33:27"
    }
  ],
  "count": 1,
  "total": 659
}
```

### GET /api/admin/verifications/export

검증 기록을 CSV/Excel로 내보냅니다.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| format | string | csv | 내보내기 형식 (csv, xlsx) |
| start_date | string | null | 시작 날짜 |
| end_date | string | null | 종료 날짜 |
| user_id | string | null | 사용자 필터 |

**Response:** File download

---

## 4. System API (Optional)

### GET /api/admin/system/status

서버 상태를 반환합니다.

**Response:**
```json
{
  "status": "healthy",
  "gpu_available": true,
  "gpu_memory_used": "4.2 GB",
  "gpu_memory_total": "8 GB",
  "queue_length": 2,
  "uptime_hours": 72.5,
  "last_error": null
}
```

---

## Error Responses

모든 API는 에러 시 다음 형식을 반환합니다:

```json
{
  "detail": "Error message here",
  "error_code": "USER_NOT_FOUND"
}
```

**HTTP Status Codes:**
| Code | Description |
|------|-------------|
| 200 | 성공 |
| 400 | 잘못된 요청 |
| 401 | 인증 필요 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 500 | 서버 에러 |

---

## Authentication (추후 구현)

Admin API 접근을 위해 다음 중 하나가 필요합니다:

1. **Admin Token** - Header: `Authorization: Bearer <admin_token>`
2. **Master Email** - 등록된 관리자 이메일로 로그인

**Master Emails:**
- skyclans2@gmail.com
- ceo@detectx.app
- support@detectx.app
- coolkimy@gmail.com

---

## UI 팀 참고사항

### 페이지 구조 제안

```
/admin
├── /admin/dashboard      - 대시보드 (통계, 차트)
├── /admin/users          - 사용자 목록
├── /admin/users/:id      - 사용자 상세
└── /admin/verifications  - 검증 기록
```

### 필수 컴포넌트

1. **Dashboard**
   - 통계 카드 (총 검증, AI/Human, 사용자 수)
   - 일별 트렌드 차트 (Line Chart)
   - Plan 분포 차트 (Pie Chart)

2. **Users Table**
   - 검색/필터 기능
   - Plan 뱃지 (Free: gray, Pro: blue, Enterprise: gold)
   - 사용량 프로그레스 바
   - Plan 변경 드롭다운
   - 사용량 리셋 버튼

3. **Verifications Table**
   - 날짜 범위 필터 (Calendar)
   - Verdict 필터 (AI/Human)
   - 사용자 필터
   - CSV/Excel 내보내기 버튼

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-19 | Initial spec (일반 유저만) |
