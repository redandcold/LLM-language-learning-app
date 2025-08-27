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

// 모델 크기별 분류
const MODEL_CATEGORIES: Record<string, ModelInfo> = {
  'qwen2.5:0.5b': {
    name: 'qwen2.5:0.5b',
    size: '397MB',
    keepAliveTime: '30m', // 작은 모델은 오래 유지
    priority: 'small'
  },
  'qwen2.5:1.5b': {
    name: 'qwen2.5:1.5b',
    size: '900MB',
    keepAliveTime: '20m',
    priority: 'small'
  },
  'llama3.1:8b': {
    name: 'llama3.1:8b',
    size: '4.9GB',
    keepAliveTime: '10m', // 큰 모델은 짧게 유지
    priority: 'large'
  },
  'llama3.2:3b': {
    name: 'llama3.2:3b',
    size: '2.0GB',
    keepAliveTime: '15m',
    priority: 'medium'
  }
}

// 활성 모델 관리를 위한 메모리 저장소
let activeModel: string | null = null
let modelLoadTime: Date | null = null

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
    
    const modelInfo = MODEL_CATEGORIES[modelId]
    if (!modelInfo) {
      return NextResponse.json({ error: 'Unknown model' }, { status: 400 })
    }

    // 모델 사전 로딩 (빈 대화로 모델을 메모리에 로드)
    const loadResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelId,
        prompt: 'Hi',
        stream: false,
        keep_alive: modelInfo.keepAliveTime
      }),
      signal: AbortSignal.timeout(60000) // 1분 타임아웃
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

    // 1. 기존 모델 언로드 (있다면)
    if (activeModel && activeModel !== newModelId) {
      console.log(`📤 기존 모델 언로딩: ${activeModel}`)
      
      try {
        await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: activeModel,
            prompt: '',
            stream: false,
            keep_alive: 0
          }),
          signal: AbortSignal.timeout(15000)
        })
        
        results.unloaded = {
          model: activeModel,
          success: true,
          unloadedAt: new Date().toISOString()
        }
        console.log(`✅ 기존 모델 언로딩 완료: ${activeModel}`)
      } catch (error) {
        console.error(`❌ 기존 모델 언로딩 실패: ${activeModel}`, error)
        results.unloaded = {
          model: activeModel,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

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
      availableModels: Object.keys(MODEL_CATEGORIES),
      modelCategories: MODEL_CATEGORIES
    })
  } catch (error) {
    console.error('❌ 모델 상태 확인 실패:', error)
    return NextResponse.json({ 
      error: 'Failed to get model status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}