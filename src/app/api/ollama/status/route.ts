import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Ollama 서버가 실행 중인지 확인
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5초 타임아웃
    })

    if (response.ok) {
      return NextResponse.json({ installed: true, running: true })
    } else {
      return NextResponse.json({ installed: false, running: false })
    }
  } catch (error) {
    // Ollama가 설치되지 않았거나 실행되지 않음
    return NextResponse.json({ installed: false, running: false })
  }
}