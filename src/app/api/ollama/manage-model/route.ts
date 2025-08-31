import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export const dynamic = 'force-dynamic'

interface ModelInfo {
  name: string
  size: string
  keepAliveTime: string
  priority: 'small' | 'medium' | 'large'
}

// 모델 크기별 우선순위 및 keep_alive 설정 함수
function getModelInfo(modelName: string, size: number = 0): ModelInfo {
  // 모델명에서 크기 추정 또는 실제 크기 사용
  let priority: 'small' | 'medium' | 'large' = 'medium'
  let keepAliveTime = '15m'
  
  if (modelName.includes(':0.5b') || modelName.includes(':1b') || size < 1000000000) {
    priority = 'small'
    keepAliveTime = '60m' // 작은 모델은 더 오래 유지
  } else if (modelName.includes(':7b') || modelName.includes(':8b') || size > 4000000000) {
    priority = 'large'
    keepAliveTime = '30m' // 큰 모델도 더 오래 유지하여 재로딩 방지
  } else if (modelName.includes(':3b') || modelName.includes(':1.5b')) {
    priority = 'medium'
    keepAliveTime = '45m'
  }
  
  return {
    name: modelName,
    size: size > 0 ? `${Math.round(size / (1024 * 1024 * 1024) * 10) / 10}GB` : '알 수 없음',
    keepAliveTime,
    priority
  }
}

// 활성 모델 관리를 위한 메모리 저장소
let activeModel: string | null = null
let modelLoadTime: Date | null = null

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 manage-model: 세션 확인 중...')
    const session = await getServerSession(authOptions)
    console.log('🔐 manage-model: 세션 결과:', session ? '있음' : '없음', session?.user?.id)
    
    if (!session?.user?.id) {
      console.log('🔐 manage-model: 인증 실패 - 세션 또는 유저 ID 없음')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('🔐 manage-model: 인증 성공, 계속 진행...')

    const { action, modelId } = await request.json()

    switch (action) {
      case 'load':
        return await loadModel(modelId)
      case 'unload':
        return await unloadModel(modelId)
      case 'switch':
        return await switchModel(modelId)
      case 'status':
        return await getModelStatus()
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Model management error:', error)
    return NextResponse.json({ error: 'Failed to manage model' }, { status: 500 })
  }
}

async function loadModel(modelId: string) {
  try {
    console.log(`🔄 모델 로딩 시작: ${modelId}`)
    
    // 실제 모델 정보 가져오기
    let modelInfo: ModelInfo
    try {
      // Ollama API에서 모델 목록 확인
      const ollamaResponse = await fetch('http://localhost:11434/api/tags', {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      })
      
      if (ollamaResponse.ok) {
        const data = await ollamaResponse.json()
        const foundModel = data.models?.find((m: any) => m.name === modelId)
        if (foundModel) {
          modelInfo = getModelInfo(modelId, foundModel.size || 0)
        } else {
          modelInfo = getModelInfo(modelId)
        }
      } else {
        modelInfo = getModelInfo(modelId)
      }
    } catch (error) {
      console.log(`⚠️ Ollama API 연결 실패, 기본값 사용: ${modelId}`)
      modelInfo = getModelInfo(modelId)
    }

    // 모델 사전 로딩 (빈 대화로 모델을 메모리에 로드)
    const timeoutDuration = modelInfo.priority === 'large' ? 180000 : 60000 // 큰 모델은 3분 타임아웃
    const loadResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelId,
        prompt: 'Hi',
        stream: false,
        keep_alive: modelInfo.keepAliveTime
      }),
      signal: AbortSignal.timeout(timeoutDuration)
    })

    if (loadResponse.ok) {
      activeModel = modelId
      modelLoadTime = new Date()
      console.log(`✅ 모델 로딩 완료: ${modelId} (유지시간: ${modelInfo.keepAliveTime})`)
      
      return NextResponse.json({
        success: true,
        model: modelId,
        size: modelInfo.size,
        keepAlive: modelInfo.keepAliveTime,
        priority: modelInfo.priority,
        loadedAt: modelLoadTime.toISOString()
      })
    } else {
      throw new Error(`Failed to load model: ${loadResponse.status}`)
    }
  } catch (error) {
    console.error(`❌ 모델 로딩 실패: ${modelId}`, error)
    return NextResponse.json({ 
      error: `Failed to load model ${modelId}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function unloadModel(modelId: string) {
  try {
    console.log(`🗑️ 모델 언로딩 시작: ${modelId}`)

    // keep_alive를 0으로 설정해서 즉시 언로드
    const unloadResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelId,
        prompt: '',
        stream: false,
        keep_alive: 0 // 즉시 언로드
      }),
      signal: AbortSignal.timeout(30000)
    })

    if (activeModel === modelId) {
      activeModel = null
      modelLoadTime = null
    }

    console.log(`✅ 모델 언로딩 완료: ${modelId}`)
    
    return NextResponse.json({
      success: true,
      message: `Model ${modelId} unloaded`,
      unloadedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error(`❌ 모델 언로딩 실패: ${modelId}`, error)
    return NextResponse.json({ 
      error: `Failed to unload model ${modelId}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function switchModel(newModelId: string) {
  try {
    console.log(`🔄 모델 전환 시작: ${activeModel} → ${newModelId}`)

    const results = {
      unloaded: null as any,
      loaded: null as any
    }

    // 1. 모든 기존 모델 강제 언로드 (메모리 부족 방지)
    console.log(`🧹 모든 모델 언로딩 시작 (메모리 확보)`)
    
    try {
      // 현재 로드된 모든 모델 확인
      const psResponse = await fetch('http://localhost:11434/api/ps', {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      })
      
      if (psResponse.ok) {
        const psData = await psResponse.json()
        const loadedModels = psData.models || []
        
        // 모든 로드된 모델 언로드
        for (const model of loadedModels) {
          console.log(`📤 강제 언로딩: ${model.name}`)
          try {
            await fetch('http://localhost:11434/api/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: model.name,
                prompt: '',
                stream: false,
                keep_alive: 0
              }),
              signal: AbortSignal.timeout(15000)
            })
          } catch (e) {
            console.warn(`⚠️ ${model.name} 언로딩 실패:`, e)
          }
        }
        
        results.unloaded = {
          models: loadedModels.map(m => m.name),
          success: true,
          unloadedAt: new Date().toISOString()
        }
        console.log(`✅ 모든 모델 언로딩 완료`)
      }
    } catch (error) {
      console.warn(`⚠️ 모델 언로딩 과정에서 오류, 계속 진행:`, error)
      results.unloaded = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
    
    // 메모리 정리를 위한 약간의 대기
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 2. 새 모델 로드
    const loadResult = await loadModel(newModelId)
    const loadData = await loadResult.json()
    
    results.loaded = loadData

    return NextResponse.json({
      success: loadData.success,
      switch: {
        from: activeModel,
        to: newModelId,
        completedAt: new Date().toISOString()
      },
      results
    })

  } catch (error) {
    console.error(`❌ 모델 전환 실패: ${activeModel} → ${newModelId}`, error)
    return NextResponse.json({ 
      error: `Failed to switch from ${activeModel} to ${newModelId}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function getModelStatus() {
  try {
    // Ollama에서 현재 로드된 모델 정보 확인
    const psResponse = await fetch('http://localhost:11434/api/ps', {
      method: 'GET',
      signal: AbortSignal.timeout(10000)
    })

    let loadedModels = []
    if (psResponse.ok) {
      const psData = await psResponse.json()
      loadedModels = psData.models || []
    }

    // 사용 가능한 모델 목록 가져오기
    let availableModels = []
    let modelCategories: Record<string, ModelInfo> = {}
    
    try {
      const tagsResponse = await fetch('http://localhost:11434/api/tags', {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      })
      
      if (tagsResponse.ok) {
        const tagsData = await tagsResponse.json()
        availableModels = tagsData.models?.map((m: any) => m.name) || []
        
        // 각 모델의 카테고리 정보 생성
        tagsData.models?.forEach((model: any) => {
          modelCategories[model.name] = getModelInfo(model.name, model.size || 0)
        })
      }
    } catch (error) {
      console.log('⚠️ 모델 목록 가져오기 실패, 빈 목록 반환')
    }

    return NextResponse.json({
      success: true,
      activeModel,
      modelLoadTime: modelLoadTime?.toISOString(),
      loadedModels: loadedModels.map((model: any) => ({
        name: model.name,
        size: model.size,
        size_vram: model.size_vram,
        expires_at: model.expires_at
      })),
      availableModels,
      modelCategories
    })
  } catch (error) {
    console.error('❌ 모델 상태 확인 실패:', error)
    return NextResponse.json({ 
      error: 'Failed to get model status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}