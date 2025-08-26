import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function DELETE(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { modelId } = await request.json()

    if (!modelId) {
      return NextResponse.json({ error: 'Model ID is required' }, { status: 400 })
    }

    // Ollama API를 통해 모델 삭제
    const ollamaResponse = await fetch('http://localhost:11434/api/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: modelId
      })
    })

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text()
      console.error('Ollama delete error:', errorText)
      return NextResponse.json(
        { error: 'Failed to delete model from Ollama' }, 
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: `Model ${modelId} deleted successfully` 
    })

  } catch (error) {
    console.error('Delete model error:', error)
    return NextResponse.json(
      { error: 'Failed to delete model' }, 
      { status: 500 }
    )
  }
}