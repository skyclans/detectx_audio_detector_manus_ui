# DetectX 개발 워크플로우 매뉴얼

**최종 수정:** 2026-01-31
**대상:** 서버팀 (백엔드) + UI팀 (프론트엔드)

---

## 1. 레포지토리 구조

| 레포 | 용도 | 브랜치 | 관리 주체 |
|------|------|--------|----------|
| `detectx_audio_detector` | 백엔드 (FastAPI + CNN) | `master` | 서버팀 |
| `detectx_audio_detector_manus_ui` | 프론트엔드 (React + Vite) | `main` | UI팀 |

**절대 규칙:**
- 서버 코드와 클라이언트 코드를 같은 커밋에 섞지 않는다
- 각 레포에 독립적으로 커밋/push한다
- 서버팀이 UI 코드를 수정할 경우, UI 레포에 별도 커밋한다

### 디렉토리 구조

```
detectx_audio_detector/           ← 백엔드 레포
├── server/
│   └── app/
│       ├── main.py              # FastAPI 앱 + 라우터 등록
│       ├── api.py               # 핵심 API (/verify-audio, /history 등)
│       ├── auth.py              # Google OAuth + JWT
│       ├── admin.py             # Admin REST API
│       ├── database.py          # SQLite DB 관리
│       ├── crg_runner.py        # CNN 모델 추론
│       └── whitelist.py         # IP 화이트리스트
├── docs/
│   ├── WORKFLOW_MANUAL.md       # 이 문서
│   ├── ui-team-*.md             # UI팀 작업지시서 (서버팀 작성)
│   └── devlog/                  # 일일 개발 로그
└── requirements.txt

detectx_audio_detector_manus_ui/  ← UI 레포
├── client/
│   └── src/
│       ├── _core/hooks/         # useAuth 등 커스텀 훅
│       ├── pages/               # Home, Admin 등
│       ├── components/          # ForensicLayout, VerdictPanel 등
│       └── lib/                 # api.ts (fetchWithAuth)
├── docs/
│   └── ui-team-*.md             # UI팀 작업지시서 (서버팀에서 복사)
└── package.json
```

---

## 2. 작업 흐름

### 2-1. 서버팀이 서버 코드를 수정할 때

```
1. 백엔드 레포에서 작업
2. 테스트
3. 커밋 → push (백엔드 레포)
4. RunPod 서버 배포
```

### 2-2. 서버팀이 UI 코드를 수정할 때 (긴급 핫픽스)

```
1. UI 레포에서 git pull (최신 UI팀 변경 반영)
2. UI 코드 수정
3. 커밋 → push (UI 레포)
4. UI팀에 변경 내용 공유 (충돌 방지)
```

### 2-3. UI팀에 작업을 요청할 때

```
1. 작업지시서 작성 (docs/ui-team-*.md)
2. 양쪽 레포에 push:
   - 백엔드 레포: docs/ui-team-xxx.md
   - UI 레포: docs/ui-team-xxx.md (복사)
3. UI팀에 통보
```

### 2-4. UI팀이 작업 후

```
1. 서버팀: UI 레포에서 git pull
2. 서버팀: 변경 내용 확인 (충돌 여부, 기존 수정 유지 여부)
3. 필요 시 추가 수정 → 커밋 → push
```

---

## 3. UI팀 작업지시서 작성 규칙

### 파일 명명

```
docs/ui-team-{주제}-spec.md
```

예시:
- `ui-team-hotfix-spec.md` — 긴급 핫픽스
- `ui-team-admin-api-spec.md` — Admin API 전환
- `ui-team-detailed-spec.md` — 상세 이슈 분석

### 필수 포함 항목

모든 작업지시서에 아래 항목을 포함한다:

#### 1. 문제 설명
- 현재 증상 (사용자 시점)
- 근본 원인 (코드 레벨)

#### 2. 수정 대상 파일과 위치
```markdown
| 파일 | 위치 (line) | 변경 내용 |
|------|------------|----------|
| `client/src/pages/Home.tsx` | line 805-826 | usage_info 처리 |
```

#### 3. 수정 내용 (코드 포함)
- 변경 전/후 코드 스니펫
- 데이터 흐름 다이어그램 (가능하면)

#### 4. 건드리지 말아야 할 코드
```markdown
| 파일 | 위치 | 이유 |
|------|------|------|
| `useAuth.ts` | CustomEvent listener | 사이드바 실시간 갱신 핵심 |
```

#### 5. 안전하게 수정 가능한 영역
```markdown
| 파일 | 영역 | 설명 |
|------|------|------|
| `VerdictPanel.tsx` | UI 디자인 | 데이터 흐름 변경 없이 OK |
```

#### 6. API 변경 사항 (해당 시)
- 엔드포인트 매핑표 (tRPC → REST)
- 요청/응답 JSON 스키마
- 인증 방식

#### 7. 테스트 시나리오
```markdown
| # | 시나리오 | 기대 결과 |
|---|---------|----------|
| 1 | 로그인 → 스캔 → 사이드바 확인 | Remaining 즉시 -1 감소 |
```

### 작성 템플릿

```markdown
# UI 팀 작업지시서: {제목}

**작성일:** YYYY-MM-DD
**우선순위:** 긴급 / 높음 / 보통

---

## 1. 문제

### 현상
{사용자가 경험하는 증상}

### 근본 원인
{코드 레벨 원인 분석}

---

## 2. 수정 대상

| 파일 | 위치 | 변경 내용 | 우선순위 |
|------|------|----------|---------|

---

## 3. 수정 내용

### {파일명}

**변경 전:**
\```typescript
// 기존 코드
\```

**변경 후:**
\```typescript
// 수정 코드
\```

**데이터 흐름:**
\```
A → B → C
\```

---

## 4. 주의사항

### 건드리지 말아야 할 코드

| 파일 | 위치 | 이유 |
|------|------|------|

### 안전하게 수정 가능한 영역

| 파일 | 영역 | 설명 |
|------|------|------|

---

## 5. API 스키마 (해당 시)

### {엔드포인트}

**메서드:** GET/POST
**인증:** JWT Bearer

**요청:**
\```json
{}
\```

**응답:**
\```json
{}
\```

---

## 6. 테스트 시나리오

| # | 시나리오 | 기대 결과 |
|---|---------|----------|
```

---

## 4. 커밋 메시지 규칙

### 형식

```
{동사} {대상}: {변경 내용 요약}

{선택: 상세 설명}

Co-Authored-By: {작성자}
```

### 동사 사전

| 동사 | 용도 |
|------|------|
| `Add` | 신규 기능/파일 추가 |
| `Fix` | 버그 수정 |
| `Update` | 기존 기능 개선/변경 |
| `Remove` | 코드/파일 삭제 |
| `Refactor` | 기능 변경 없이 코드 구조 개선 |

### 예시

```
Fix sidebar usage: add CustomEvent cross-instance sync to useAuth

useAuth() is a custom hook (not React Context), so each component
gets independent state. Fix: dispatch CustomEvent after fetchUser()
so all instances receive the update.
```

```
Add admin panel REST API with user/plan/log management

20 endpoints under /api/admin/* replacing tRPC adminRouter.
JWT auth + admin email check. Super admin for admin management.
```

---

## 5. 배포 체크리스트

### 서버 배포 (RunPod)

```
□ 코드 변경 → 백엔드 레포 커밋/push
□ RunPod 서버 SSH 접속
□ git pull
□ pip install -r requirements.txt (의존성 변경 시)
□ 서버 재시작
□ /health 엔드포인트 확인
□ 핵심 API 테스트 (/auth/me, /verify-audio)
```

### UI 배포

```
□ 코드 변경 → UI 레포 커밋/push
□ UI팀 빌드 & 배포
□ 브라우저 캐시 클리어 후 테스트
```

### 양쪽 변경 시

```
□ 서버 먼저 배포 (API 호환성)
□ UI 배포
□ 통합 테스트
```

---

## 6. docs/ 폴더 관리

### 백엔드 레포 docs/

```
docs/
├── WORKFLOW_MANUAL.md              # 이 문서
├── DETECTX_OVERVIEW.md             # 프로젝트 개요
├── ROADMAP.md                      # 로드맵
├── ui-team-hotfix-spec.md          # UI팀 긴급 핫픽스
├── ui-team-admin-api-spec.md       # UI팀 Admin API 전환
├── ui-team-detailed-spec.md        # UI팀 상세 이슈 분석
├── ui-team-phase2-auth-spec.md     # UI팀 인증 전환
├── ui-team-phase3-spec.md          # UI팀 Phase 3
├── ui-team-usage-and-perf-spec.md  # UI팀 사용량+성능
└── devlog/
    ├── day42.md ~ day51.md         # 일일 개발 로그
    └── ...
```

### 규칙

- `ui-team-*.md` 파일은 **양쪽 레포 모두에** push한다
- devlog는 백엔드 레포에만 관리한다
- 새 작업지시서 작성 시 기존 파일 목록을 확인하고, 중복되는 주제면 기존 파일을 업데이트한다

---

## 7. 충돌 방지 프로토콜

### 서버팀이 UI 파일을 수정한 경우

1. UI 레포에 커밋/push 후, 작업지시서에 다음을 명시:
   ```markdown
   ### 충돌 방지

   서버팀이 직접 수정한 파일:
   - `client/src/_core/hooks/useAuth.ts` — CustomEvent 동기화 추가

   위 파일을 수정할 경우 `git pull` 후 진행해주세요.
   ```

2. **건드리지 말아야 할 코드** 섹션에 서버팀 수정 위치를 정확히 기록

### UI팀이 작업 후

1. 서버팀은 UI 레포 `git pull`로 변경사항 확인
2. 서버팀 수정이 유지되는지 검증
3. 문제 발견 시 즉시 수정 후 push

---

## 8. 현재 주요 파일별 관리 책임

| 파일 | 주 관리 | 수정 시 주의 |
|------|---------|-------------|
| `server/app/api.py` | 서버팀 | 엔드포인트 변경 시 UI 작업지시서 업데이트 |
| `server/app/auth.py` | 서버팀 | JWT/OAuth 변경 시 UI팀 통보 |
| `server/app/admin.py` | 서버팀 | Admin API 변경 시 UI 작업지시서 업데이트 |
| `server/app/database.py` | 서버팀 | 스키마 변경 시 API 응답 형태도 확인 |
| `client/src/_core/hooks/useAuth.ts` | 서버팀 | CustomEvent 동기화 — UI팀 수정 주의 |
| `client/src/pages/Home.tsx` | UI팀 | usage_info + refreshUser 부분 유지 |
| `client/src/pages/HomeTest.tsx` | UI팀 | Home.tsx와 동일 패턴 유지 |
| `client/src/pages/admin/*.tsx` | UI팀 | tRPC → REST 전환 진행 중 |
| `client/src/components/ForensicLayout.tsx` | UI팀 | PlanUsageDisplay — useAuth() 의존 |
| `client/src/components/VerdictPanel.tsx` | UI팀 | 자유 수정 가능 |

---

## 9. 일일 개발 로그 (devlog) 규칙

### 파일명
```
docs/devlog/day{번호}.md
```

### 필수 포함 항목

```markdown
# Day {번호}: {제목}

## Date: YYYY-MM-DD

## 개요
{1~3줄 요약}

## 작업 내용
{상세 내용: 수정한 파일, 코드 변경, 원인 분석 등}

## 커밋 이력
| 커밋 | 내용 |
|------|------|

## 수정된 파일
| 파일 | 변경 |
|------|------|

## 현재 상태
| 항목 | 상태 |
|------|------|
```

---

## 10. 긴급 상황 대응

### UI 측 긴급 버그 (서버팀이 직접 수정)

```
1. UI 레포 git pull
2. 원인 분석 → 최소 범위 수정
3. UI 레포에 커밋/push
4. 작업지시서에 수정 내용 기록 (건드리지 말아야 할 코드 포함)
5. UI팀 통보
```

### 서버 API 변경이 UI에 영향을 줄 때

```
1. 서버 변경 먼저 배포 (하위 호환 유지)
2. 작업지시서 작성 → 양쪽 레포 push
3. UI팀 대응 완료 후 deprecated 코드 제거
```
