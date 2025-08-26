import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { modelId } = await request.json()

    if (!modelId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Model ID is required' 
      })
    }

    // Ollama pull 명령어 실행 (스트리밍 활성화로 진행률 표시)
    const response = await fetch('http://localhost:11434/api/pull', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: modelId,
        stream: true  // 스트리밍 활성화로 진행률 추적
      }),
      signal: AbortSignal.timeout(600000) // 10분 타임아웃
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Ollama pull failed: ${errorData}`)
    }

    // 스트리밍 응답 처리
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Failed to get response reader')
    }

    let progress = 0
    let status = 'downloading'
    
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n').filter(line => line.trim())
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            if (data.status === 'downloading' && data.completed && data.total) {
              progress = Math.round((data.completed / data.total) * 100)
            }
            status = data.status || 'downloading'
          } catch (e) {
            // JSON 파싱 오류 무시
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
    
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