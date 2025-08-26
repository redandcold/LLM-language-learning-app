import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// 파일/디렉토리를 재귀적으로 복사하는 함수
async function copyRecursive(src: string, dest: string): Promise<void> {
  const stat = await fs.promises.stat(src)
  
  if (stat.isDirectory()) {
    // 디렉토리인 경우
    await fs.promises.mkdir(dest, { recursive: true })
    const items = await fs.promises.readdir(src)
    
    for (const item of items) {
      const srcPath = path.join(src, item)
      const destPath = path.join(dest, item)
      await copyRecursive(srcPath, destPath)
    }
  } else {
    // 파일인 경우
    await fs.promises.mkdir(path.dirname(dest), { recursive: true })
    await fs.promises.copyFile(src, dest)
  }
}

// 디렉토리를 재귀적으로 삭제하는 함수
async function removeRecursive(dirPath: string): Promise<void> {
  if (fs.existsSync(dirPath)) {
    await fs.promises.rm(dirPath, { recursive: true, force: true })
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

    const { newPath } = await request.json()

    if (!newPath) {
      return NextResponse.json(
        { error: '새 경로가 필요합니다' },
        { status: 400 }
      )
    }

    // 현재 모델 경로들 찾기
    const possibleOldPaths = [
      process.env.OLLAMA_MODELS,
      path.join(process.env.USERPROFILE || process.env.HOME || '', '.ollama', 'models'),
      path.join(process.env.HOME || '', '.ollama', 'models'),
      '/usr/share/ollama/.ollama/models',
      '/var/lib/ollama/.ollama/models'
    ].filter(Boolean) as string[]

    let currentModelsPath = ''
    let existingModels: string[] = []

    // 실제로 모델이 있는 경로 찾기
    for (const possiblePath of possibleOldPaths) {
      if (fs.existsSync(possiblePath)) {
        try {
          const files = await fs.promises.readdir(possiblePath)
          if (files.length > 0) {
            currentModelsPath = possiblePath
            existingModels = files
            break
          }
        } catch (error) {
          continue
        }
      }
    }

    if (!currentModelsPath || existingModels.length === 0) {
      return NextResponse.json(
        { error: '기존 모델을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 새 경로 준비
    const resolvedNewPath = path.resolve(newPath)
    await fs.promises.mkdir(resolvedNewPath, { recursive: true })

    // Ollama 서비스 중지 (Windows의 경우)
    try {
      if (process.platform === 'win32') {
        await execAsync('taskkill /f /im ollama.exe', { timeout: 10000 })
        await new Promise(resolve => setTimeout(resolve, 2000)) // 2초 대기
      } else {
        await execAsync('pkill -f ollama', { timeout: 10000 })
        await new Promise(resolve => setTimeout(resolve, 2000)) // 2초 대기
      }
    } catch (error) {
      console.log('Ollama 프로세스 종료 시도 (이미 종료되었을 수 있음)')
    }

    let movedModels: string[] = []
    let failedModels: string[] = []

    // 모델들을 하나씩 이동
    for (const model of existingModels) {
      const srcPath = path.join(currentModelsPath, model)
      const destPath = path.join(resolvedNewPath, model)

      try {
        console.log(`모델 이동 중: ${model}`)
        
        // 파일/디렉토리 복사
        await copyRecursive(srcPath, destPath)
        
        // 원본 삭제
        await removeRecursive(srcPath)
        
        movedModels.push(model)
        console.log(`모델 이동 완료: ${model}`)
      } catch (error) {
        console.error(`모델 이동 실패: ${model}`, error)
        failedModels.push(model)
      }
    }

    // .env.local 파일 업데이트
    const envPath = path.join(process.cwd(), '.env.local')
    let envContent = ''
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8')
    }

    const ollamaModelsRegex = /^OLLAMA_MODELS=.*$/m
    const newEnvLine = `OLLAMA_MODELS=${resolvedNewPath}`

    if (ollamaModelsRegex.test(envContent)) {
      envContent = envContent.replace(ollamaModelsRegex, newEnvLine)
    } else {
      envContent += envContent ? `\n${newEnvLine}\n` : `${newEnvLine}\n`
    }

    fs.writeFileSync(envPath, envContent)
    process.env.OLLAMA_MODELS = resolvedNewPath

    // Ollama 서비스 재시작 시도
    try {
      if (process.platform === 'win32') {
        // Windows에서 Ollama 재시작
        execAsync('start ollama serve').catch(() => {
          console.log('Ollama 자동 시작 실패 - 수동으로 시작해주세요')
        })
      } else {
        // Linux/Mac에서 Ollama 재시작
        execAsync('nohup ollama serve > /dev/null 2>&1 &').catch(() => {
          console.log('Ollama 자동 시작 실패 - 수동으로 시작해주세요')
        })
      }
    } catch (error) {
      console.log('Ollama 재시작 시도 실패')
    }

    return NextResponse.json({
      success: true,
      oldPath: currentModelsPath,
      newPath: resolvedNewPath,
      movedModels,
      failedModels,
      message: `${movedModels.length}개 모델이 성공적으로 이동되었습니다.${failedModels.length > 0 ? ` ${failedModels.length}개 모델 이동 실패.` : ''}`
    })

  } catch (error) {
    console.error('모델 마이그레이션 오류:', error)
    return NextResponse.json(
      { error: `모델 이동 중 오류가 발생했습니다: ${error}` },
      { status: 500 }
    )
  }
}