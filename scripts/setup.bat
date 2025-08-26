@echo off
echo 🌍 AI 언어학습 플랫폼 설치 스크립트 (Windows)
echo ================================================

echo.
echo 📋 시스템 요구사항 확인 중...

:: Node.js 설치 확인
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js가 설치되지 않았습니다.
    echo 📥 https://nodejs.org 에서 Node.js 18+ 를 설치해주세요.
    pause
    exit /b 1
) else (
    echo ✅ Node.js 설치 확인됨
)

:: NPM 설치 확인
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ NPM이 설치되지 않았습니다.
    pause
    exit /b 1
) else (
    echo ✅ NPM 설치 확인됨
)

echo.
echo 📦 프로젝트 의존성 설치 중...
npm install
if %errorlevel% neq 0 (
    echo ❌ NPM 설치 실패
    pause
    exit /b 1
)
echo ✅ 의존성 설치 완료

echo.
echo 🗄️ 데이터베이스 초기화 중...
npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Prisma 생성 실패
    pause
    exit /b 1
)

npx prisma db push
if %errorlevel% neq 0 (
    echo ❌ 데이터베이스 초기화 실패
    pause
    exit /b 1
)
echo ✅ 데이터베이스 초기화 완료

echo.
echo 🤖 Ollama 설치 확인 중...
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Ollama가 설치되지 않았습니다.
    echo 📥 자동 설치를 시작합니다...
    
    :: Winget을 통한 Ollama 설치 시도
    winget install Ollama.Ollama --accept-source-agreements --accept-package-agreements
    if %errorlevel% neq 0 (
        echo ❌ 자동 설치 실패
        echo 📖 수동으로 https://ollama.ai 에서 설치해주세요.
        pause
    ) else (
        echo ✅ Ollama 설치 완료
    )
) else (
    echo ✅ Ollama 설치 확인됨
)

echo.
echo 📁 모델 저장 디렉토리 생성 중...
if not exist "ollama-models" mkdir ollama-models
echo ✅ 모델 저장 디렉토리 생성 완료

echo.
echo 🎉 설치 완료!
echo.
echo 📋 다음 단계:
echo 1. 'npm run dev' 명령어로 애플리케이션 시작
echo 2. 브라우저에서 http://localhost:3000 접속
echo 3. 이메일로 회원가입 진행
echo 4. 설정에서 언어별 모델 다운로드
echo.
echo 💡 Ollama 서비스가 자동 시작되지 않은 경우:
echo    터미널에서 'ollama serve' 명령어를 실행해주세요.
echo.

set /p start="지금 애플리케이션을 시작하시겠습니까? (y/n): "
if /i "%start%"=="y" (
    echo.
    echo 🚀 애플리케이션 시작 중...
    echo 브라우저에서 http://localhost:3000 이 자동으로 열립니다.
    start http://localhost:3000
    npm run dev
) else (
    echo.
    echo 📖 시작할 준비가 되면 'npm run dev' 명령어를 실행해주세요.
    pause
)