# Ollama 설정 가이드

이 프로젝트는 Ollama 모델을 프로젝트 폴더 내에 저장하여 사용합니다.

## 자동 설정

1. **Ollama 서버 시작**
   ```bash
   # 프로젝트 루트 디렉토리에서
   start_ollama.bat
   ```
   
2. **웹 애플리케이션 실행**
   ```bash
   npm run dev
   ```

## 수동 모델 다운로드

환경 변수를 설정한 후 모델을 다운로드하세요:

```bash
# Windows CMD
set OLLAMA_MODELS=F:\language_learning_app\ollama-models
ollama pull qwen2.5:0.5b

# Windows PowerShell
$env:OLLAMA_MODELS="F:\language_learning_app\ollama-models"
ollama pull qwen2.5:0.5b
```

## 현재 설치된 모델

- **qwen2.5:0.5b** - 397MB, 빠른 응답 속도의 소형 모델

## 모델 디렉토리 구조

```
F:\language_learning_app\ollama-models\
├── blobs\          # 모델 파일들
├── manifests\      # 모델 메타데이터
└── ...
```

## 주의사항

- 모델 다운로드 시 항상 `OLLAMA_MODELS` 환경 변수가 설정되어 있는지 확인하세요
- 웹 애플리케이션에서 모델 다운로드 시 자동으로 프로젝트 폴더에 저장됩니다
- C 드라이브 용량 절약을 위해 모든 모델은 프로젝트 폴더에만 저장됩니다