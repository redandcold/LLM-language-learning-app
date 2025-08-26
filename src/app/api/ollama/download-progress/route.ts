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

    // Server-Sent Events 설정
    const encoder = new TextEncoder()
    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          const response = await fetch('http://localhost:11434/api/pull', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: modelId,
              stream: true
            }),
            signal: AbortSignal.timeout(600000)
          })

          if (!response.ok) {
            const errorData = await response.text()
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              error: `Ollama pull failed: ${errorData}`,
              success: false
            })}\n\n`))
            controller.close()
            return
          }

          const reader = response.body?.getReader()
          if (!reader) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              error: 'Failed to get response reader',
              success: false
            })}\n\n`))
            controller.close()
            return
          }

          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = new TextDecoder().decode(value)
              const lines = chunk.split('\n').filter(line => line.trim())
              
              for (const line of lines) {
                try {
                  const data = JSON.parse(line)
                  let progress = 0
                  
                  if (data.status === 'downloading' && data.completed && data.total) {
                    progress = Math.round((data.completed / data.total) * 100)
                  } else if (data.status === 'success') {
                    progress = 100
                  }

                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    progress,
                    status: data.status || 'downloading',
                    message: data.status === 'success' ? 
                      `${modelId} 다운로드 완료!` : 
                      `${modelId} 다운로드 중... ${progress}%`,
                    success: data.status === 'success'
                  })}\n\n`))

                  if (data.status === 'success') {
                    controller.close()
                    return
                  }
                } catch (e) {
                  // JSON 파싱 오류 무시
                }
              }
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              progress: 100,
              status: 'success',
              message: `${modelId} 다운로드 완료!`,
              success: true
            })}\n\n`))
            controller.close()

          } finally {
            reader.releaseLock()
          }
        } catch (error) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error',
            success: false
          })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(customReadable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })

  } catch (error) {
    console.error('Download progress error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to start download progress stream' 
    })
  }
}