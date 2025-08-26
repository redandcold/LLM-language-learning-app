import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    // 현재 OLLAMA_MODELS 환경변수 확인
    const currentPath = process.env.OLLAMA_MODELS || ''
    
    // 기본 경로들
    const defaultPaths = {
      windows: path.join(process.env.USERPROFILE || '', '.ollama', 'models'),
      linux: path.join(process.env.HOME || '', '.ollama', 'models'),
      mac: path.join(process.env.HOME || '', '.ollama', 'models'),
    }

    // 프로젝트 내 추천 경로
    const projectPath = path.join(process.cwd(), 'ollama-models')

    return NextResponse.json({
      currentPath: currentPath || 'default',
      defaultPaths,
      projectPath,
      platform: process.platform
    })

  } catch (error) {
    console.error('모델 경로 조회 오류:', error)
    return NextResponse.json(
      { error: '경로 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    const { modelPath } = await request.json()

    if (!modelPath) {
      return NextResponse.json(
        { error: '모델 경로가 필요합니다' },
        { status: 400 }
      )
    }

    // 경로 검증 및 생성
    const resolvedPath = path.resolve(modelPath)
    
    // 디렉토리가 존재하지 않으면 생성
    if (!fs.existsSync(resolvedPath)) {
      try {
        fs.mkdirSync(resolvedPath, { recursive: true })
      } catch (err) {
        return NextResponse.json(
          { error: `디렉토리 생성 실패: ${err}` },
          { status: 400 }
        )
      }
    }

    // .env.local 파일 업데이트
    const envPath = path.join(process.cwd(), '.env.local')
    let envContent = ''
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8')
    }

    // OLLAMA_MODELS 환경변수 업데이트 또는 추가
    const ollamaModelsRegex = /^OLLAMA_MODELS=.*$/m
    const newEnvLine = `OLLAMA_MODELS=${resolvedPath}`

    if (ollamaModelsRegex.test(envContent)) {
      envContent = envContent.replace(ollamaModelsRegex, newEnvLine)
    } else {
      envContent += envContent ? `\n${newEnvLine}\n` : `${newEnvLine}\n`
    }

    fs.writeFileSync(envPath, envContent)

    // 환경변수 업데이트 (현재 프로세스용)
    process.env.OLLAMA_MODELS = resolvedPath

    return NextResponse.json({
      success: true,
      newPath: resolvedPath,
      message: 'Ollama 모델 경로가 변경되었습니다. 서버를 재시작해주세요.'
    })

  } catch (error) {
    console.error('모델 경로 설정 오류:', error)
    return NextResponse.json(
      { error: '경로 설정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}