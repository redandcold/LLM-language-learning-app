# 🌍 AI 언어학습 플랫폼

완전 로컬에서 동작하는 AI 기반 언어학습 애플리케이션입니다. Ollama와 로컬 LLM을 활용하여 인터넷 연결 없이도 언어를 학습할 수 있습니다.

## ✨ 주요 기능

- 🤖 **로컬 LLM 채팅**: Ollama 기반 완전 오프라인 언어학습
- 🌍 **언어별 모델 추천**: 언어 조합별 최적 모델 자동 추천
- 📥 **원클릭 모델 다운로드**: 20개 이상 모델 중 선택 설치
- 📁 **유연한 모델 관리**: 프로젝트 폴더 내 모델 저장 옵션
- 💬 **실시간 채팅**: 자연스러운 언어학습 대화
- 🔐 **사용자 계정**: 이메일 기반 안전한 인증
- ⏰ **세션 관리**: 자동 만료 및 연장 기능

## 🎯 지원 언어 조합

- 한국어 ↔ 영어, 일본어, 중국어
- 영어 ↔ 스페인어, 프랑스어, 독일어
- 기타 다국어 조합 지원

## 📋 시스템 요구사항

### 필수 요구사항
- **OS**: Windows 10/11, macOS 10.15+, Ubuntu 18.04+
- **RAM**: 8GB 이상 (16GB 권장)
- **저장공간**: 20GB 이상 여유공간
- **네트워크**: 초기 설치 시에만 필요

### 소프트웨어 의존성
- Node.js 18.0+ 
- Git
- Ollama (자동 설치 가능)

## 🚀 빠른 시작

### 1단계: 저장소 복제
```bash
git clone https://github.com/[your-username]/language-learning-app.git
cd language-learning-app
```

### 2단계: 의존성 설치
```bash
npm install
```

### 3단계: 환경 설정
```bash
# .env.local 파일이 이미 준비되어 있습니다
# 필요시 이메일 설정 등 수정 가능
```

### 4단계: 데이터베이스 초기화
```bash
npx prisma generate
npx prisma db push
```

### 5단계: 애플리케이션 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속!

## 🤖 Ollama 설정

### 자동 설치 (권장)
1. 앱 실행 후 `http://localhost:3000/settings` 접속
2. "Ollama 설치하기" 버튼 클릭
3. 자동 설치 완료 대기

### 수동 설치
```bash
# Windows (PowerShell)
winget install Ollama.Ollama

# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh
```

### Ollama 시작
```bash
# 서비스 시작
ollama serve

# 백그라운드 실행 확인
ollama list
```

## 📥 모델 다운로드

### 웹 인터페이스에서 (권장)
1. 설정 페이지 → "언어별 모델 추천" 
2. 언어 조합 선택 (예: 한국어 → 영어)
3. 추천 모델에서 "다운로드" 클릭

### 명령줄에서
```bash
# 가벼운 모델 (1-3GB)
ollama pull llama3.2:1b
ollama pull gemma2:2b

# 중간 성능 모델 (4-8GB) 
ollama pull llama3.2:3b
ollama pull qwen2.5:7b

# 고성능 모델 (15GB+)
ollama pull llama3.1:8b
ollama pull qwen2.5:14b
```

## ⚙️ 상세 설정

### 이메일 인증 설정 (선택사항)
`.env.local` 파일에서 Gmail SMTP 설정:
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

### 모델 저장 경로 변경
```bash
# 프로젝트 폴더 내 저장 (기본값)
OLLAMA_MODELS=./ollama-models

# 커스텀 경로
OLLAMA_MODELS=C:\MyModels\ollama
```

### OpenAI 백업 설정 (선택사항)
```bash
OPENAI_API_KEY=sk-your-openai-api-key
```

## 🖥️ 사용법

### 1. 회원가입/로그인
- 이메일 주소로 간편 가입
- 마법 링크 방식 인증

### 2. 모델 선택
- 설정 → "현재 사용 중인 모델"에서 선택
- 로컬 모델 또는 OpenAI 선택 가능

### 3. 언어학습 시작
- 채팅에서 자연스럽게 대화
- "안녕하세요, 영어를 배우고 싶어요" 등으로 시작

### 4. 고급 기능
- 언어별 모델 추천 활용
- 모델 성능 비교
- 대화 기록 자동 저장

## 📊 지원 모델 목록

### 추천 모델 (언어학습 최적화)
- **Llama 3.2 1B/3B**: 가벼우면서 우수한 성능
- **Gemma 2 2B**: Google의 효율적인 모델  
- **Qwen 2.5 시리즈**: 동아시아 언어 특화

### 전체 지원 모델 (20개+)
- Llama 3.1/3.2 시리즈 (1B-70B)
- Gemma 2 시리즈 (2B-27B)
- Qwen 2.5 시리즈 (1.5B-72B)
- Mixtral, Mistral, Code Llama
- Vicuna, Orca Mini 등

## 🔧 문제해결

### Ollama 연결 오류
```bash
# Ollama 서비스 상태 확인
ollama list

# 서비스 재시작
ollama serve
```

### 모델 다운로드 실패
```bash
# 디스크 공간 확인
ollama list

# 수동 다운로드 시도
ollama pull llama3.2:3b
```

### 데이터베이스 오류
```bash
# 데이터베이스 초기화
rm prisma/dev.db
npx prisma db push
```

## 🤝 기여하기

1. Fork 프로젝트
2. Feature 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 Push (`git push origin feature/amazing-feature`)
5. Pull Request 열기

## 📝 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

**🚀 로컬에서 완전히 동작하는 AI 언어학습의 새로운 경험을 시작하세요!**