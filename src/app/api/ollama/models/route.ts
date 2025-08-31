import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  console.log('🚀 API ROUTE HIT - MODELS ENDPOINT')
  console.log('🚀 Current time:', new Date().toISOString())
  console.log('🚀 Process env OLLAMA_MODELS:', process.env.OLLAMA_MODELS)
  
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
      const projectModelsPath = path.join(ollamaModelsPath, 'manifests', 'registry.ollama.ai', 'library')
      console.log('API: Environment OLLAMA_MODELS:', process.env.OLLAMA_MODELS)
      console.log('API: Resolved ollamaModelsPath:', ollamaModelsPath)
      console.log('API: Scanning Ollama folder:', projectModelsPath)
      console.log('API: Path exists:', fs.existsSync(projectModelsPath))
      
      if (fs.existsSync(projectModelsPath)) {
        const modelFolders = fs.readdirSync(projectModelsPath)
        console.log('API: Found model folders:', modelFolders)
        const projectModels = []
        
        for (const modelFolder of modelFolders) {
          const modelPath = path.join(projectModelsPath, modelFolder)
          console.log('API: Checking model folder:', modelFolder, 'at path:', modelPath)
          if (fs.statSync(modelPath).isDirectory()) {
            const variants = fs.readdirSync(modelPath)
            console.log('API: Found variants for', modelFolder, ':', variants)
            for (const variant of variants) {
              const modelId = `${modelFolder}:${variant}`
              console.log('API: Adding model:', modelId)
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
        
        console.log('API: Final projectModels array:', projectModels)
        console.log('API: Found', projectModels.length, 'models in project folder')
        ollamaModels = projectModels
      } else {
        console.log('API: Project models path does not exist')
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