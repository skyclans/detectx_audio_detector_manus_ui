# File Limits Update - 2026-01-19

## 변경 사항

### 서버 제한 (적용 완료)

| 항목 | 제한 | 이유 |
|------|------|------|
| **파일 크기** | 100MB | WAV/FLAC 10분 정도 지원 |
| **오디오 길이** | 15분 | RunPod 프록시 타임아웃 방지 |

### 예상 파일 크기

| 포맷 | 3분 곡 | 5분 곡 | 10분 곡 | 15분 곡 |
|------|--------|--------|---------|---------|
| MP3 (320kbps) | ~7MB | ~12MB | ~24MB | ~36MB |
| FLAC | ~25MB | ~40MB | ~80MB | ~120MB |
| WAV (16bit/44.1kHz) | ~30MB | ~50MB | ~100MB | ~150MB |

**참고:** 15분 WAV/FLAC은 100MB를 초과할 수 있어 길이 제한(15분)이 먼저 적용됩니다.

---

## UI 변경사항 (커밋 완료)

### Home.tsx 수정

1. **에러 상태 추가**
   ```typescript
   const [verificationError, setVerificationError] = useState<string | null>(null);
   ```

2. **서버 에러 메시지 파싱**
   - 413 (파일 너무 큼) 에러의 detail 메시지 추출
   - 사용자에게 친화적인 에러 메시지 표시

3. **에러 UI 표시**
   - VerdictPanel 아래에 빨간색 에러 박스 표시
   - 새 검증 시작 시 에러 초기화

---

## 에러 메시지 예시

### 파일 크기 초과 (100MB 이상)
```
Verification Error
File too large. Maximum size is 100MB. Please use a shorter audio file (under 15 minutes).
```

### 오디오 길이 초과 (15분 이상)
```
Verification Error
Audio too long (42.5 minutes). Maximum duration is 15 minutes.
```

### 네트워크 에러 (프록시 타임아웃)
```
Verification Error
Network error during upload
```

---

## 커밋 내역

### 개발 Git (detectx_audio_detector)
- `5b47532` - Add file size (30MB) and duration (15min) limits
- `44ea288` - Increase file size limit to 100MB for WAV/FLAC support

### UI Git (manus_ui)
- `b8ad115` - Add error message display for verification failures

---

## 테스트 확인

- [x] 짧은 파일 (3-5분 MP3) - 정상 동작
- [x] 일반 FLAC/WAV (5-10분) - 정상 동작
- [x] 긴 파일 (15분+ 또는 100MB+) - 에러 메시지 표시

---

## 배포 후 확인 사항

UI 팀에서 배포 후:
1. 큰 파일 업로드 시 에러 메시지가 빨간 박스로 표시되는지 확인
2. 정상 파일은 기존처럼 동작하는지 확인
