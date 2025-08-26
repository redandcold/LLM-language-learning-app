import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '../../../../lib/prisma'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

interface ModelSettings {
  modelType: 'openai' | 'local'
  modelId?: string
  openaiApiKey?: string
  updatedAt: string
}

function loadModelSettings(): ModelSettings {
  const settingsFile = path.join(process.cwd(), 'data', 'model-settings.json')
  
  if (!fs.existsSync(settingsFile)) {
    return { modelType: 'openai', updatedAt: new Date().toISOString() }
  }

  try {
    const data = fs.readFileSync(settingsFile, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    return { modelType: 'openai', updatedAt: new Date().toISOString() }
  }
}

async function callOllamaAPI(modelId: string, messages: any[]) {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful language learning assistant. Help users practice languages by having conversations, correcting mistakes, and providing explanations. Respond in a friendly and encouraging manner.'
        },
        ...messages
      ],
      stream: false
    }),
    signal: AbortSignal.timeout(30000) // 30초로 타임아웃 단축
  })

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status}`)
  }

  const data = await response.json()
  return data.message?.content || 'Sorry, I couldn\'t generate a response.'
}

export async function POST(request: NextRequest) {
  try {
    const { message, history, chatRoomId } = await request.json()
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = loadModelSettings()
    console.log('🔧 현재 모델 설정:', settings)

    // 채팅룸이 없으면 생성
    let currentChatRoom
    if (chatRoomId) {
      currentChatRoom = await prisma.chatRoom.findUnique({
        where: { id: chatRoomId, userId: session.user.id }
      })
    }
    
    if (!currentChatRoom) {
      currentChatRoom = await prisma.chatRoom.create({
        data: {
          title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
          userId: session.user.id
        }
      })
    }

    // 사용자 메시지를 DB에 저장
    await prisma.message.create({
      data: {
        content: message,
        role: 'user',
        chatRoomId: currentChatRoom.id
      }
    })

    const messages = [
      ...history.map((msg: Message) => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ]

    let assistantResponse: string

    if (settings.modelType === 'local' && settings.modelId) {
      // 로컬 LLM 사용
      console.log('🤖 로컬 모델 사용:', settings.modelId)
      try {
        assistantResponse = await callOllamaAPI(settings.modelId, messages)
        console.log('✅ 로컬 모델 응답 성공')
      } catch (error) {
        console.error('Ollama API error:', error)
        if (error instanceof Error && error.name === 'TimeoutError') {
          assistantResponse = '응답 생성 중입니다. 로컬 모델이 처리하는데 시간이 오래 걸릴 수 있습니다. 잠시만 기다려주세요.'
        } else {
          assistantResponse = '로컬 모델에서 오류가 발생했습니다. Ollama가 실행 중이고 모델이 설치되어 있는지 확인해주세요.'
        }
      }
    } else if (settings.modelType === 'openai' && settings.openaiApiKey) {
      // OpenAI API 사용 (사용자 제공 키)
      console.log('🌐 OpenAI API 사용 (사용자 키)')
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful language learning assistant. Help users practice languages by having conversations, correcting mistakes, and providing explanations. Respond in a friendly and encouraging manner.'
            },
            ...messages
          ],
          max_tokens: 300, // 토큰 수 줄여서 응답 속도 향상
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      assistantResponse = data.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.'
    } else {
      // OpenAI API 키가 없거나 로컬 모델이 설정되지 않음
      if (settings.modelType === 'openai') {
        assistantResponse = 'OpenAI API 키가 설정되지 않았습니다. 설정에서 API 키를 입력해주세요.'
      } else {
        assistantResponse = '모델이 설정되지 않았습니다. 설정에서 사용할 모델을 선택해주세요.'
      }
    }

    // AI 응답을 DB에 저장
    await prisma.message.create({
      data: {
        content: assistantResponse,
        role: 'assistant',
        chatRoomId: currentChatRoom.id
      }
    })

    return NextResponse.json({ 
      response: assistantResponse,
      chatRoomId: currentChatRoom.id
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}