import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  // 인증 확인 (선택사항 - 디버깅을 위해 주석처리)
  // const session = await getServerSession()
  // if (!session) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // }
  try {
    console.log('API: Fetching models...')
    
    // 먼저 Ollama API 시도
    let ollamaModels = []
    try {
      const response = await fetch('http://localhost:11434/api/tags', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })
      if (response.ok) {
        const data = await response.json()
        ollamaModels = data.models || []
        console.log('API: Ollama API returned:', ollamaModels.length, 'models')
      }
    } catch (error) {
      console.log('API: Ollama API not available, checking project folder...')
    }
    
    // Ollama API에서 모델이 없으면 환경 변수 경로 직접 스캔
    if (ollamaModels.length === 0) {
      const ollamaModelsPath = process.env.OLLAMA_MODELS || path.join(process.cwd(), 'ollama-models')
      const projectModelsPath = path.join(ollamaModelsPath, 'models', 'manifests', 'registry.ollama.ai', 'library')
      console.log('API: Scanning Ollama folder:', projectModelsPath)
      
      if (fs.existsSync(projectModelsPath)) {
        const modelFolders = fs.readdirSync(projectModelsPath)
        const projectModels = []
        
        for (const modelFolder of modelFolders) {
          const modelPath = path.join(projectModelsPath, modelFolder)
          if (fs.statSync(modelPath).isDirectory()) {
            const variants = fs.readdirSync(modelPath)
            for (const variant of variants) {
              const modelId = `${modelFolder}:${variant}`
              projectModels.push({
                name: modelId,
                model: modelId,
                modified_at: new Date().toISOString(),
                size: 0,
                digest: "local",
                details: {
                  format: "gguf",
                  family: modelFolder,
                  parameter_size: variant.toUpperCase(),
                  quantization_level: "Q4_K_M"
                }
              })
            }
          }
        }
        
        console.log('API: Found', projectModels.length, 'models in project folder')
        ollamaModels = projectModels
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      models: ollamaModels 
    })
  } catch (error) {
    console.error('Failed to fetch Ollama models:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to connect to Ollama server',
      models: [] 
    })
  }
}