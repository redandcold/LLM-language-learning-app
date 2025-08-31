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

function createLanguageLearningPrompt(languageSettings?: { mainLanguage: string, learningLanguage: string }): string {
  if (!languageSettings) {
    return 'You are a helpful language learning assistant. Help users practice languages by having conversations, correcting mistakes, and providing explanations. Respond in a friendly and encouraging manner.'
  }

  const { mainLanguage, learningLanguage } = languageSettings

  return `You are a professional language learning assistant specialized in helping users learn ${learningLanguage}. 

IMPORTANT INSTRUCTIONS:
- Always respond in ${mainLanguage} unless the user specifically asks you to respond in ${learningLanguage}
- Your primary role is to help the user learn and practice ${learningLanguage}
- When the user asks questions about ${learningLanguage} (grammar, vocabulary, expressions, culture), provide detailed explanations in ${mainLanguage}
- If the user writes in ${learningLanguage}, you should:
  1. Acknowledge their effort
  2. Gently correct any mistakes if present
  3. Explain the corrections in ${mainLanguage}
  4. Provide additional context or examples
- Be encouraging, patient, and supportive
- Use examples and comparisons that would be familiar to a ${mainLanguage} speaker
- If asked about other topics not related to ${learningLanguage} learning, still respond in ${mainLanguage} but try to relate back to language learning when appropriate

Current learning focus: User is a ${mainLanguage} speaker learning ${learningLanguage}.`
}

async function callOllamaAPIStreaming(modelId: string, messages: any[], systemPrompt: string) {
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
          content: systemPrompt
        },
        ...messages
      ],
      stream: true
    }),
    signal: AbortSignal.timeout(180000) // 180초로 타임아웃 확대 (3분)
  })

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status}`)
  }

  return response
}

export async function POST(request: NextRequest) {
  try {
    const { message, history, chatRoomId, languageSettings } = await request.json()
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = loadModelSettings()
    
    // 사용자의 OpenAI API 키 가져오기
    if (settings.modelType === 'openai') {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { openaiApiKey: true }
      })
      settings.openaiApiKey = user?.openaiApiKey || undefined
    }
    
    console.log('🔧 현재 모델 설정:', { ...settings, openaiApiKey: settings.openaiApiKey ? '***' + settings.openaiApiKey?.slice(-4) : 'none' })

    // 채팅룸이 있으면 DB에서 언어 설정을 불러오고, 없으면 요청의 설정을 사용
    let finalLanguageSettings = languageSettings
    if (chatRoomId) {
      const existingRoom = await prisma.chatRoom.findUnique({
        where: { id: chatRoomId, userId: session.user.id }
      })
      if (existingRoom) {
        finalLanguageSettings = {
          mainLanguage: existingRoom.mainLanguage,
          learningLanguage: existingRoom.learningLanguage
        }
      }
    }

    // 언어 설정에 따른 시스템 프롬프트 생성
    const systemPrompt = createLanguageLearningPrompt(finalLanguageSettings)
    console.log('🌐 언어 설정:', finalLanguageSettings)

    // 채팅룸 처리
    let currentChatRoom
    if (chatRoomId) {
      console.log('🔍 채팅룸 ID로 검색:', chatRoomId)
      currentChatRoom = await prisma.chatRoom.findUnique({
        where: { id: chatRoomId, userId: session.user.id }
      })
      console.log('🎯 찾은 채팅룸:', currentChatRoom ? '존재함' : '없음')
    }
    
    if (!currentChatRoom) {
      console.log('🆕 새로운 채팅룸 생성')
      currentChatRoom = await prisma.chatRoom.create({
        data: {
          title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
          userId: session.user.id,
          mainLanguage: languageSettings?.mainLanguage || '한국어',
          learningLanguage: languageSettings?.learningLanguage || '영어'
        }
      })
      console.log('✅ 새로운 채팅룸 생성 완료:', currentChatRoom.id)
    } else if (languageSettings && languageSettings.mainLanguage && languageSettings.learningLanguage) {
      // 기존 채팅룸의 언어 설정 업데이트 (유효한 값만)
      try {
        currentChatRoom = await prisma.chatRoom.update({
          where: { id: currentChatRoom.id },
          data: {
            mainLanguage: languageSettings.mainLanguage,
            learningLanguage: languageSettings.learningLanguage
          }
        })
      } catch (error) {
        console.warn('언어 설정 업데이트 실패, 기본값 사용:', error)
        // 업데이트 실패시 기존 값 유지
      }
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
      // 로컬 LLM 스트리밍 사용
      console.log('🤖 로컬 모델 스트리밍 사용:', settings.modelId)
      
      // 모델 자동 전환/로딩
      try {
        console.log('🔄 모델 관리 시작:', settings.modelId)
        const modelManageResponse = await fetch('http://localhost:3000/api/ollama/manage-model', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || ''
          },
          body: JSON.stringify({
            action: 'switch',
            modelId: settings.modelId
          })
        })
        
        if (modelManageResponse.ok) {
          const manageResult = await modelManageResponse.json()
          console.log('✅ 모델 관리 완료:', manageResult)
          
          if (manageResult.results?.unloaded) {
            console.log('📤 이전 모델 언로딩:', manageResult.results.unloaded)
          }
        } else {
          console.warn('⚠️ 모델 관리 실패, 계속 진행:', await modelManageResponse.text())
        }
      } catch (modelError) {
        console.warn('⚠️ 모델 관리 오류, 계속 진행:', modelError)
      }
      
      try {
        const ollamaResponse = await callOllamaAPIStreaming(settings.modelId, messages, systemPrompt)
        
        // 스트리밍 응답을 위한 ReadableStream 생성
        const encoder = new TextEncoder()
        const stream = new ReadableStream({
          async start(controller) {
            let fullResponse = ''
            
            try {
              const reader = ollamaResponse.body?.getReader()
              if (!reader) throw new Error('No response body')
              
              let streamComplete = false
              const decoder = new TextDecoder()
              
              while (!streamComplete) {
                const { done, value } = await reader.read()
                if (done) {
                  console.log('📡 스트림 종료: reader done')
                  break
                }
                
                const chunk = decoder.decode(value, { stream: true })
                const lines = chunk.split('\n').filter(line => line.trim())
                
                for (const line of lines) {
                  try {
                    const data = JSON.parse(line)
                    console.log('📦 받은 데이터:', { content: data.message?.content?.substring(0, 50), done: data.done })
                    
                    if (data.message?.content) {
                      fullResponse += data.message.content
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: data.message.content, fullResponse })}\n\n`))
                    }
                    
                    if (data.done) {
                      console.log('✅ 스트림 완료, 전체 응답 길이:', fullResponse.length)
                      streamComplete = true
                      
                      // 완료된 응답을 DB에 저장
                      await prisma.message.create({
                        data: {
                          content: fullResponse,
                          role: 'assistant',
                          chatRoomId: currentChatRoom.id
                        }
                      })
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, chatRoomId: currentChatRoom.id })}\n\n`))
                      controller.close()
                      return
                    }
                  } catch (e) {
                    console.warn('⚠️ JSON 파싱 실패:', line.substring(0, 100))
                  }
                }
              }
              // 무한 루프 방지를 위한 안전 장치
              if (fullResponse.length === 0) {
                console.log('⚠️ 응답이 없어서 스트림 종료')
                streamComplete = true
              }
              
            } catch (error) {
              console.error('스트리밍 오류:', error)
              let streamErrorMessage = '스트리밍 중 오류가 발생했습니다.'
              
              if (error instanceof Error) {
                if (error.message.includes('terminated') || error.message.includes('Socket')) {
                  streamErrorMessage = '연결이 중단되었습니다. Ollama 서비스를 확인해주세요.'
                } else if (error.message.includes('ECONNREFUSED')) {
                  streamErrorMessage = 'Ollama 서비스에 연결할 수 없습니다.'
                }
              }
              
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: streamErrorMessage })}\n\n`))
              controller.close()
            }
          }
        })
        
        return new NextResponse(stream, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked',
          },
        })
        
      } catch (error) {
        console.error('Ollama API error:', error)
        
        let errorMessage = '로컬 모델에서 오류가 발생했습니다.'
        
        if (error instanceof Error) {
          if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
            errorMessage = '💡 Ollama 서비스에 연결할 수 없습니다.\n\n다음을 확인해주세요:\n1. Ollama가 실행 중인지 확인 (ollama serve)\n2. 모델이 메모리에 로드되어 있는지 확인\n3. 다른 프로그램이 Ollama를 사용 중인지 확인\n\n잠시 후 다시 시도해보세요.'
          } else if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
            errorMessage = '⏱️ 모델 응답 시간이 초과되었습니다.\n\nLlama 3.1 8B는 큰 모델로 처리 시간이 오래 걸릴 수 있습니다.\n더 빠른 응답을 원하시면 qwen2.5:0.5b 모델을 사용해보세요.'
          } else if (error.message.includes('terminated') || error.message.includes('Socket')) {
            errorMessage = '🔌 연결이 중단되었습니다.\n\nOllama 서비스가 불안정할 수 있습니다.\n잠시 후 다시 시도해보세요.'
          }
        }
        
        // AI 응답을 DB에 저장
        await prisma.message.create({
          data: {
            content: errorMessage,
            role: 'assistant',
            chatRoomId: currentChatRoom.id
          }
        })

        return NextResponse.json({ 
          response: errorMessage,
          chatRoomId: currentChatRoom.id
        })
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
              content: systemPrompt
            },
            ...messages
          ],
          max_tokens: 2000, // 충분한 토큰 수로 증가 (분석 답변 대응)
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