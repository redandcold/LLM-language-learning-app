# 🌐 Cloudflare Tunnel 설정 가이드

## 1. 로그인 및 초기 설정

### Cloudflare 로그인
```bash
cloudflared tunnel login
```
- 브라우저에서 Cloudflare 계정으로 로그인
- 도메인이 있다면 선택, 없다면 무료 도메인 사용

## 2. 터널 생성

### 터널 생성
```bash
cloudflared tunnel create language-learning-app
```

### 터널 목록 확인
```bash
cloudflared tunnel list
```

## 3. 터널 설정 파일 생성

### config.yml 파일 생성 (Windows)
`C:\Users\%USERNAME%\.cloudflared\config.yml`

```yaml
tunnel: language-learning-app
credentials-file: C:\Users\%USERNAME%\.cloudflared\[TUNNEL-ID].json

ingress:
  # 메인 앱
  - hostname: your-app.trycloudflare.com
    service: http://localhost:3000
  # 기본 규칙 (반드시 필요)
  - service: http_status:404
```

## 4. 빠른 테스트 (임시 URL)

### 즉시 공유용 (임시 URL 생성)
```bash
cloudflared tunnel --url http://localhost:3000
```
- 임시 `*.trycloudflare.com` URL 생성
- 세션 종료시 URL 사라짐

## 5. 영구 터널 실행

### 터널 시작
```bash
cloudflared tunnel run language-learning-app
```

### 백그라운드 실행 (Windows 서비스)
```bash
cloudflared service install
cloudflared service start
```

## 6. 보안 설정 (선택사항)

### Access 정책 설정
```bash
# Cloudflare Zero Trust 대시보드에서 설정
# - IP 제한
# - 이메일 기반 접근 제어
# - 국가별 접근 제한
```

## 7. 도메인 연결 (선택사항)

### 커스텀 도메인 연결
```bash
cloudflared tunnel route dns language-learning-app your-domain.com
```

## 🚀 빠른 시작 명령어

### 1분 안에 공유하기
```bash
# 개발 서버가 실행 중인 상태에서
cloudflared tunnel --url http://localhost:3000
```

### 결과 예시
```
2025-08-25T14:30:15Z INF +--------------------------------------------------------------------------------------------+
2025-08-25T14:30:15Z INF |  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable): |
2025-08-25T14:30:15Z INF |  https://abc-def-123.trycloudflare.com                                                     |
2025-08-25T14:30:15Z INF +--------------------------------------------------------------------------------------------+
```

## ⚠️ 주의사항

1. **Ollama 로컬 의존성**: 
   - 외부 사용자는 Ollama 모델을 사용할 수 없음
   - OpenAI API 키 필요하거나 기능 제한

2. **데이터베이스**:
   - SQLite 파일 기반이므로 다중 사용자 시 충돌 가능
   - PostgreSQL 등으로 변경 권장

3. **보안**:
   - 민감한 정보 (API 키, 데이터베이스) 보호
   - 접근 제한 설정 권장

## 📋 체크리스트

- [ ] Cloudflare 계정 로그인
- [ ] 터널 생성
- [ ] 개발 서버 실행 중 (npm run dev)
- [ ] 터널 시작
- [ ] URL 공유 및 테스트
- [ ] 보안 설정 (필요시)