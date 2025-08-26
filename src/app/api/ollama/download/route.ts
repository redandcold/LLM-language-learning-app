import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { modelId } = await request.json()

    if (!modelId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Model ID is required' 
      })
    }

    // 프로젝트 폴더의 ollama-models 경로 설정
    const projectModelsPath = path.join(process.cwd(), 'ollama-models')
    
    // 환경 변수를 설정하고 ollama pull 명령어 실행
    const pullProcess = spawn('ollama', ['pull', modelId], {
      env: {
        ...process.env,
        OLLAMA_MODELS: projectModelsPath
      },
      shell: true
    })

    let output = ''
    let errorOutput = ''

    const pullPromise = new Promise<void>((resolve, reject) => {
      pullProcess.stdout?.on('data', (data) => {
        output += data.toString()
        console.log('Ollama pull output:', data.toString())
      })

      pullProcess.stderr?.on('data', (data) => {
        errorOutput += data.toString()
        console.error('Ollama pull error:', data.toString())
      })

      pullProcess.on('close', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Ollama pull failed with code ${code}: ${errorOutput}`))
        }
      })

      pullProcess.on('error', (error) => {
        reject(new Error(`Failed to start ollama pull: ${error.message}`))
      })
    })

    // 10분 타임아웃 설정
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Download timeout')), 600000)
    })

    await Promise.race([pullPromise, timeoutPromise])
    
    return NextResponse.json({ 
      success: true,
      message: `Model ${modelId} downloaded successfully`,
      progress: 100,
      status: 'success'
    })

  } catch (error) {
    console.error('Model download error:', error)
    
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json({ 
        success: false, 
        error: 'Download timeout. The model might still be downloading in the background.' 
      })
    }
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    })
  }
}