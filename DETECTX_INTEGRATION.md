# DetectX Audio + Manus UI Integration Guide

## Architecture Overview

```
User Browser
    ↓ (Upload Audio)
Manus UI (Frontend Only - No GPU Processing)
    ↓ (API Request via tRPC)
Manus Backend (Simple Proxy Server)
    ↓ (Forward File via HTTP POST)
DetectX Audio Server (RunPod GPU Server)
    ↓ (Process: Demucs + CR-G Geometry)
Return Results
```

**Key Design Principle**: Manus handles only UI and routing. All heavy computation (Demucs, CR-G analysis) happens on DetectX Audio Server.

---

## 🔌 Integration Status

### ✅ Completed:
1. **Manus Backend** updated to forward requests to DetectX Audio Server
2. **API Contract** aligned between Manus UI and DetectX Audio Server
3. **Environment variable** configuration added

### 📝 Modified Files:
- [server/routers.ts](server/routers.ts:94-152) - Replaced `simulateForensicAnalysis()` with actual DetectX Audio API call

---

## 🚀 Setup Instructions

### 1. Configure DetectX Server URL

Create `.env` file in Manus project root:

```bash
cd /Users/yoonkim/detectx_audio_detector_manus_ui
cp .env.example .env
```

Edit `.env`:
```bash
DETECTX_SERVER_URL=http://your-runpod-server:8000
```

### 2. Install dependencies (if needed)

```bash
cd /Users/yoonkim/detectx_audio_detector_manus_ui
pnpm install
```

### 3. Test the integration

**Start Manus UI:**
```bash
cd /Users/yoonkim/detectx_audio_detector_manus_ui
pnpm dev
```

**Start DetectX Audio Server** (on RunPod or locally):
```bash
cd /workspace/detectx_audio_detector/server
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

## ✅ 완료된 작업:

1. ✅ **Manus UI 구조 분석 완료**
2. ✅ **DetectX Audio 서버 연동 코드 작성**
   - [server/routers.ts:94-152](server/routers.ts:94-152) 수정 완료
   - `simulateForensicAnalysis()` → 실제 DetectX Audio API 호출로 변경
   - Form-data로 파일 전송
   - 5분 타임아웃 설정

3. ✅ **환경 변수 파일 생성**: [.env.example](.env.example)

---

## 📝 연동 가이드 문서

### 설정 방법:

1. **Manus UI 프로젝트에 `.env` 파일 생성**:
```bash
cd /Users/yoonkim/detectx_audio_detector_manus_ui
cp .env.example .env
```

2. **DetectX Audio Server URL 설정**:
```bash
# .env 파일 편집
DETECTX_SERVER_URL=http://your-runpod-server:8000
```

3. **패키지 설치 및 실행**:
```bash
pnpm install
pnpm dev
```

### API 흐름:

```
사용자 → Manus UI (localhost:5173)
  ↓
Manus Backend (localhost:3000)
  ↓ POST /verify-audio
DetectX Audio Server (RunPod GPU)
  ↓ CR-G 분석 (Demucs + G1-B + G3-B)
결과 반환
```

### 비용 구조:
- **Manus**: 무료 (UI 호스팅만)
- **DetectX Server**: RunPod GPU 사용 시간당 비용만 발생

---

작업을 완료했습니다! 다음은 어떤 작업을 진행하시겠습니까?

1. **RunPod human_full 다운로드 및 HDB-G 빌드**
2. **DetectX Audio Server RunPod 배포**
3. **Manus UI 로컬 테스트**