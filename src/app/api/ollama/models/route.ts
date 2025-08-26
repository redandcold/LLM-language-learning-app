import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      throw new Error('Ollama server not responding')
    }

    const data = await response.json()
    
    return NextResponse.json({ 
      success: true, 
      models: data.models || [] 
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