#!/bin/bash

# AI 언어학습 플랫폼 설치 스크립트 (Linux/macOS)
echo "🌍 AI 언어학습 플랫폼 설치 스크립트"
echo "========================================"
echo

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 함수 정의
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "✅ ${GREEN}$1 설치 확인됨${NC}"
        return 0
    else
        echo -e "❌ ${RED}$1이 설치되지 않았습니다${NC}"
        return 1
    fi
}

install_node() {
    echo -e "📥 ${YELLOW}Node.js 설치를 시도합니다...${NC}"
    
    # macOS - Homebrew
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install node
        else
            echo -e "${RED}Homebrew가 설치되지 않았습니다. https://nodejs.org 에서 수동 설치해주세요.${NC}"
            return 1
        fi
    # Linux - 패키지 매니저별 설치
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v apt &> /dev/null; then
            sudo apt update && sudo apt install -y nodejs npm
        elif command -v yum &> /dev/null; then
            sudo yum install -y nodejs npm
        elif command -v dnf &> /dev/null; then
            sudo dnf install -y nodejs npm
        else
            echo -e "${RED}지원되지 않는 패키지 매니저입니다. https://nodejs.org 에서 수동 설치해주세요.${NC}"
            return 1
        fi
    fi
}

install_ollama() {
    echo -e "🤖 ${YELLOW}Ollama 설치를 시도합니다...${NC}"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install ollama
        else
            curl -fsSL https://ollama.ai/install.sh | sh
        fi
    else
        # Linux
        curl -fsSL https://ollama.ai/install.sh | sh
    fi
}

echo "📋 시스템 요구사항 확인 중..."

# Node.js 확인 및 설치
if ! check_command node; then
    read -p "Node.js를 자동 설치하시겠습니까? (y/n): " install_node_confirm
    if [[ $install_node_confirm == "y" ]]; then
        install_node
        if ! check_command node; then
            echo -e "${RED}Node.js 설치 실패. 수동으로 설치해주세요: https://nodejs.org${NC}"
            exit 1
        fi
    else
        echo -e "${RED}Node.js가 필요합니다. https://nodejs.org 에서 설치해주세요.${NC}"
        exit 1
    fi
fi

# NPM 확인
if ! check_command npm; then
    echo -e "${RED}NPM이 설치되지 않았습니다.${NC}"
    exit 1
fi

echo
echo "📦 프로젝트 의존성 설치 중..."
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}NPM 설치 실패${NC}"
    exit 1
fi
echo -e "✅ ${GREEN}의존성 설치 완료${NC}"

echo
echo "🗄️ 데이터베이스 초기화 중..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo -e "${RED}Prisma 생성 실패${NC}"
    exit 1
fi

npx prisma db push
if [ $? -ne 0 ]; then
    echo -e "${RED}데이터베이스 초기화 실패${NC}"
    exit 1
fi
echo -e "✅ ${GREEN}데이터베이스 초기화 완료${NC}"

echo
echo "🤖 Ollama 설치 확인 중..."
if ! check_command ollama; then
    read -p "Ollama를 자동 설치하시겠습니까? (y/n): " install_ollama_confirm
    if [[ $install_ollama_confirm == "y" ]]; then
        install_ollama
        if ! check_command ollama; then
            echo -e "${YELLOW}Ollama 자동 설치 실패. 수동으로 설치해주세요: https://ollama.ai${NC}"
        else
            echo -e "✅ ${GREEN}Ollama 설치 완료${NC}"
        fi
    else
        echo -e "${YELLOW}Ollama는 나중에 수동으로 설치할 수 있습니다.${NC}"
    fi
fi

echo
echo "📁 모델 저장 디렉토리 생성 중..."
mkdir -p ollama-models
echo -e "✅ ${GREEN}모델 저장 디렉토리 생성 완료${NC}"

echo
echo -e "🎉 ${GREEN}설치 완료!${NC}"
echo
echo "📋 다음 단계:"
echo "1. 'npm run dev' 명령어로 애플리케이션 시작"
echo "2. 브라우저에서 http://localhost:3000 접속"
echo "3. 이메일로 회원가입 진행"
echo "4. 설정에서 언어별 모델 다운로드"
echo
echo "💡 Ollama 서비스가 자동 시작되지 않은 경우:"
echo "   터미널에서 'ollama serve' 명령어를 실행해주세요."
echo

read -p "지금 애플리케이션을 시작하시겠습니까? (y/n): " start_confirm
if [[ $start_confirm == "y" ]]; then
    echo
    echo "🚀 애플리케이션 시작 중..."
    echo "브라우저에서 http://localhost:3000 에 접속해주세요."
    
    # 백그라운드에서 브라우저 열기 (가능한 경우)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open http://localhost:3000 &
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v xdg-open &> /dev/null; then
            xdg-open http://localhost:3000 &
        fi
    fi
    
    npm run dev
else
    echo
    echo "📖 시작할 준비가 되면 'npm run dev' 명령어를 실행해주세요."
fi