'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, ArrowLeft, Plus, Settings, X, ChevronDown, FileText } from 'lucide-react'
import Link from 'next/link'
import { AnalysisButtons } from '@/components/chat/AnalysisButtons'
import { generateAnalysisPrompt } from '@/utils/analysisPrompts'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

interface ChatRoom {
  id: string
  name: string
  lastMessage?: string
  updatedAt: Date
}

interface ModelSettings {
  modelType: 'openai' | 'local'
  modelId?: string
  openaiApiKey?: string
  updatedAt: string
}

interface LanguageSettings {
  mainLanguage: string
  learningLanguage: string
}

export default function ChatPage() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [modelSettings, setModelSettings] = useState<ModelSettings>({ modelType: 'openai', updatedAt: '' })
  const [hasOpenAIKey, setHasOpenAIKey] = useState<boolean>(false)
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [chatSettingsExpanded, setChatSettingsExpanded] = useState(true)
  const [modelSettingsExpanded, setModelSettingsExpanded] = useState(true)
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [languageSettings, setLanguageSettings] = useState<LanguageSettings>({
    mainLanguage: '한국어',
    learningLanguage: '영어'
  })
  
  // 자동 스크롤을 위한 ref
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadModelSettings()
    loadChatRooms()
  }, [])

  useEffect(() => {
    if (selectedRoom) {
      loadChatHistory(selectedRoom)
    }
  }, [selectedRoom])

  // 메시지가 업데이트될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatRooms = async () => {
    try {
      const response = await fetch('/api/chat/history', {
        method: 'POST',
      })
      if (response.ok) {
        const data = await response.json()
        setChatRooms(data.chatRooms.map((room: any) => ({
          id: room.id,
          name: room.title,
          lastMessage: room.lastMessage,
          updatedAt: new Date(room.updatedAt)
        })))
        
        // 첫 번째 채팅룸 자동 선택
        if (data.chatRooms.length > 0 && !selectedRoom) {
          setSelectedRoom(data.chatRooms[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to load chat rooms:', error)
    }
  }

  const loadChatHistory = async (chatRoomId: string) => {
    try {
      const response = await fetch(`/api/chat/history?chatRoomId=${chatRoomId}`)
      if (response.ok) {
        const data = await response.json()
        // timestamp를 Date 객체로 변환
        const messages = data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        setMessages(messages)
        
        // 언어 설정 업데이트
        if (data.languageSettings) {
          setLanguageSettings(data.languageSettings)
        }
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
      setMessages([])
    }
  }

  const loadModelSettings = async () => {
    try {
      setSettingsError(null)
      const response = await fetch('/api/settings/model')
      if (response.ok) {
        const settings = await response.json()
        setModelSettings(settings)
        if (settings.modelType === 'local') {
          await loadAvailableModels()
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      // 메인페이지에서 저장된 OpenAI API 키 확인
      const openaiResponse = await fetch('/api/settings/openai')
      if (openaiResponse.ok) {
        const openaiData = await openaiResponse.json()
        setHasOpenAIKey(!!openaiData.apiKey)
      }
    } catch (error) {
      console.error('Failed to load model settings:', error)
      setSettingsError('모델 설정을 불러오는데 실패했습니다.')
    }
  }

  const loadAvailableModels = async () => {
    setLoadingModels(true)
    try {
      setSettingsError(null)
      const response = await fetch('/api/ollama/models')
      if (response.ok) {
        const data = await response.json()
        console.log('Models API response:', data) // 디버깅용
        
        if (data.models && Array.isArray(data.models)) {
          const modelNames = data.models.map((model: any) => {
            // 다양한 형태의 모델 데이터 처리
            if (typeof model === 'string') {
              return model
            }
            return model.name || model.model || JSON.stringify(model)
          })
          console.log('Processed model names:', modelNames) // 디버깅용
          setAvailableModels(modelNames)
        } else {
          console.warn('Invalid models data structure:', data)
          setAvailableModels([])
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Failed to load models:', error)
      setSettingsError('사용 가능한 모델을 불러오는데 실패했습니다.')
      setAvailableModels([])
    } finally {
      setLoadingModels(false)
    }
  }

  const saveModelSettings = async (settingsToSave?: Partial<ModelSettings>) => {
    try {
      setSettingsError(null)
      const updatedSettings = { 
        ...modelSettings, 
        ...(settingsToSave || {}), 
        updatedAt: new Date().toISOString() 
      }
      
      const response = await fetch('/api/settings/model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      })
      
      if (response.ok) {
        setModelSettings(updatedSettings)
        setShowSettings(false)
        setSettingsError(null)
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      setSettingsError('설정 저장에 실패했습니다.')
    }
  }

  const createNewRoom = () => {
    const newRoom: ChatRoom = {
      id: Date.now().toString(),
      name: `대화방 ${chatRooms.length + 1}`,
      updatedAt: new Date()
    }
    setChatRooms([newRoom, ...chatRooms])
    setSelectedRoom(newRoom.id)
    setMessages([{
      id: '1',
      content: 'Hello! I\'m here to help you practice languages. What would you like to work on today?',
      role: 'assistant',
      timestamp: new Date()
    }])
  }

  const handleAnalysisRequest = async (type: 'grammar' | 'vocabulary' | 'both') => {
    // 마지막 assistant 메시지 찾기
    const lastAssistantMessage = [...messages].reverse().find(msg => msg.role === 'assistant')
    if (!lastAssistantMessage) {
      console.error('No assistant message found for analysis')
      return
    }

    // 분석 프롬프트 생성
    const analysisPrompt = generateAnalysisPrompt(type, lastAssistantMessage.content, languageSettings)
    
    // 분석 요청 메시지 생성
    const analysisMessage: Message = {
      id: Date.now().toString(),
      content: analysisPrompt,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, analysisMessage])
    setIsLoading(true)

    // 임시 assistant 메시지 추가 (스트리밍용)
    const tempAssistantId = (Date.now() + 1).toString()
    const tempAssistantMessage: Message = {
      id: tempAssistantId,
      content: '',
      role: 'assistant',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, tempAssistantMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: analysisMessage.content,
          history: messages,
          chatRoomId: selectedRoom,
          languageSettings
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send analysis request')
      }

      // 스트리밍 응답 처리 (기존 sendMessage와 동일)
      const contentType = response.headers.get('Content-Type')
      
      if (contentType?.includes('text/plain')) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let fullResponse = ''

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '))

            for (const line of lines) {
              try {
                const data = JSON.parse(line.replace('data: ', ''))
                
                if (data.content) {
                  fullResponse += data.content
                  setMessages(prev => prev.map(msg =>
                    msg.id === tempAssistantId
                      ? { ...msg, content: fullResponse }
                      : msg
                  ))
                }
                
                if (data.done && data.chatRoomId) {
                  // 분석 요청 - 채팅방 ID 처리
                  if (selectedRoom !== data.chatRoomId) {
                    console.log('🔄 분석 요청 - 채팅방 ID 업데이트:', selectedRoom, '->', data.chatRoomId)
                    setSelectedRoom(data.chatRoomId)
                    setChatRooms(prev => prev.map(room =>
                      room.id === selectedRoom
                        ? { ...room, id: data.chatRoomId, lastMessage: fullResponse, updatedAt: new Date() }
                        : room
                    ))
                  } else {
                    setChatRooms(prev => prev.map(room => 
                      room.id === selectedRoom 
                        ? { ...room, lastMessage: fullResponse, updatedAt: new Date() }
                        : room
                    ))
                  }
                  setIsLoading(false)
                  return
                }
                
                if (data.error) {
                  throw new Error(data.error)
                }
              } catch (parseError) {
                // JSON 파싱 오류 무시
              }
            }
          }
        }
      } else {
        const data = await response.json()
        
        setMessages(prev => prev.map(msg =>
          msg.id === tempAssistantId
            ? { ...msg, content: data.response }
            : msg
        ))

        // 분석 요청 일반 응답 - 채팅방 ID 처리
        if (data.chatRoomId && selectedRoom !== data.chatRoomId) {
          console.log('🔄 분석 일반 응답 - 채팅방 ID 업데이트:', selectedRoom, '->', data.chatRoomId)
          setSelectedRoom(data.chatRoomId)
          setChatRooms(prev => prev.map(room =>
            room.id === selectedRoom
              ? { ...room, id: data.chatRoomId, lastMessage: data.response, updatedAt: new Date() }
              : room
          ))
        } else {
          setChatRooms(prev => prev.map(room => 
            room.id === selectedRoom 
              ? { ...room, lastMessage: data.response, updatedAt: new Date() }
              : room
          ))
        }
      }

    } catch (error) {
      console.error('Error sending analysis request:', error)
      const errorMessage = 'Sorry, there was an error processing your analysis request. Please try again.'
      
      setMessages(prev => prev.map(msg =>
        msg.id === tempAssistantId
          ? { ...msg, content: errorMessage }
          : msg
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // 임시 assistant 메시지 추가 (스트리밍용)
    const tempAssistantId = (Date.now() + 1).toString()
    const tempAssistantMessage: Message = {
      id: tempAssistantId,
      content: '',
      role: 'assistant',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, tempAssistantMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages,
          chatRoomId: selectedRoom,
          languageSettings
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      // 스트리밍 응답인지 일반 응답인지 확인
      const contentType = response.headers.get('Content-Type')
      
      if (contentType?.includes('text/plain')) {
        // 스트리밍 응답 처리
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let fullResponse = ''

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '))

            for (const line of lines) {
              try {
                const data = JSON.parse(line.replace('data: ', ''))
                
                if (data.content) {
                  fullResponse += data.content
                  // 실시간으로 메시지 업데이트
                  setMessages(prev => prev.map(msg =>
                    msg.id === tempAssistantId
                      ? { ...msg, content: fullResponse }
                      : msg
                  ))
                }
                
                if (data.done && data.chatRoomId) {
                  // 새로운 채팅방이 생성된 경우 selectedRoom 업데이트
                  if (selectedRoom !== data.chatRoomId) {
                    console.log('🔄 채팅방 ID 업데이트:', selectedRoom, '->', data.chatRoomId)
                    setSelectedRoom(data.chatRoomId)
                    // 채팅룸 목록에서도 업데이트
                    setChatRooms(prev => prev.map(room =>
                      room.id === selectedRoom
                        ? { ...room, id: data.chatRoomId, lastMessage: fullResponse, updatedAt: new Date() }
                        : room
                    ))
                  } else {
                    // 기존 채팅룸 마지막 메시지 업데이트
                    setChatRooms(prev => prev.map(room => 
                      room.id === selectedRoom 
                        ? { ...room, lastMessage: fullResponse, updatedAt: new Date() }
                        : room
                    ))
                  }
                  setIsLoading(false)
                  return
                }
                
                if (data.error) {
                  throw new Error(data.error)
                }
              } catch (parseError) {
                // JSON 파싱 오류 무시
              }
            }
          }
        }
      } else {
        // 기존 일반 응답 처리 (OpenAI 등)
        const data = await response.json()
        
        setMessages(prev => prev.map(msg =>
          msg.id === tempAssistantId
            ? { ...msg, content: data.response }
            : msg
        ))

        // 채팅룸 ID 처리 및 마지막 메시지 업데이트
        if (data.chatRoomId && selectedRoom !== data.chatRoomId) {
          console.log('🔄 일반 응답 - 채팅방 ID 업데이트:', selectedRoom, '->', data.chatRoomId)
          setSelectedRoom(data.chatRoomId)
          setChatRooms(prev => prev.map(room =>
            room.id === selectedRoom
              ? { ...room, id: data.chatRoomId, lastMessage: data.response, updatedAt: new Date() }
              : room
          ))
        } else {
          setChatRooms(prev => prev.map(room => 
            room.id === selectedRoom 
              ? { ...room, lastMessage: data.response, updatedAt: new Date() }
              : room
          ))
        }
      }

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = 'Sorry, there was an error processing your message. Please try again.'
      
      setMessages(prev => prev.map(msg =>
        msg.id === tempAssistantId
          ? { ...msg, content: errorMessage }
          : msg
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const saveToMemo = async (content: string) => {
    try {
      // 내용을 요약해서 제목 생성 (첫 50자 + "..." 또는 첫 줄)
      const title = content.split('\n')[0].substring(0, 50) + (content.length > 50 ? '...' : '')
      
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      })

      if (response.ok) {
        alert('메모장에 저장되었습니다!')
      } else {
        throw new Error('메모 저장에 실패했습니다')
      }
    } catch (error) {
      console.error('Failed to save to memo:', error)
      alert('메모 저장에 실패했습니다')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Chat Rooms - Fixed position */}
      <div className="fixed left-0 top-0 bottom-0 w-80 bg-white border-r border-gray-200 flex flex-col z-40">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5 mr-2" />
              홈으로
            </Link>
          </div>
          <button
            onClick={createNewRoom}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            새 대화방
          </button>
        </div>

        {/* Chat rooms list with separate scroll */}
        <div className="flex-1 overflow-y-auto">
          {chatRooms.map((room) => (
            <div
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedRoom === room.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <h3 className="font-medium text-gray-900 mb-1">{room.name}</h3>
              {room.lastMessage && (
                <p className="text-sm text-gray-600 truncate">{room.lastMessage}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {room.updatedAt.toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area - Adjusted for fixed sidebar */}
      <div className="flex-1 flex flex-col ml-80">
        {selectedRoom ? (
          <>
            {/* Chat Header - Fixed position */}
            <div className="fixed top-0 right-0 left-80 p-4 bg-white border-b border-gray-200 flex items-center justify-between z-30">
              <h2 className="text-lg font-semibold text-gray-900">
                {chatRooms.find(room => room.id === selectedRoom)?.name}
              </h2>
              <button
                onClick={() => {
                  setShowSettings(true)
                  setSettingsError(null)
                  loadModelSettings()
                }}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 mr-2" />
                설정
              </button>
            </div>

            {/* Messages - Adjusted for fixed header */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 mt-20 mb-48"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${message.role === 'assistant' ? 'space-y-2' : ''}`}>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    
                    {/* 메모장에 옮기기 버튼 - AI 응답에만 표시 */}
                    {message.role === 'assistant' && message.content.trim() && !isLoading && (
                      <div className="flex justify-start">
                        <button
                          onClick={() => saveToMemo(message.content)}
                          className="flex items-center px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          title="메모장에 저장"
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          메모장에 옮기기
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 max-w-[70%]">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-sm text-gray-600">AI가 응답을 생성하고 있습니다...</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      💡 처음 응답은 모델 로딩으로 인해 시간이 걸릴 수 있습니다
                    </div>
                  </div>
                </div>
              )}
              {/* 스크롤 참조점 */}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className="fixed bottom-0 right-0 left-80 p-4 bg-white border-t border-gray-200 z-30">
              {/* Analysis Buttons - 입력창 위에 표시 */}
              <AnalysisButtons
                onAnalysisRequest={handleAnalysisRequest}
                lastAssistantMessage={[...messages].reverse().find(msg => msg.role === 'assistant')?.content}
                disabled={isLoading}
              />
              
              <div className="flex space-x-4">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                대화방을 선택하세요
              </h3>
              <p className="text-gray-600 mb-4">
                새 대화방을 만들거나 기존 대화방을 선택해주세요
              </p>
              <button
                onClick={createNewRoom}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                첫 번째 대화방 만들기
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">설정</h3>
              <button
                onClick={() => {
                  setShowSettings(false)
                  setSettingsError(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {settingsError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                {settingsError}
              </div>
            )}

            <div className="space-y-4">
              {/* Chat Settings Section */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setChatSettingsExpanded(!chatSettingsExpanded)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-medium text-gray-900">대화방 설정</h4>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      chatSettingsExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {chatSettingsExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-200">
                    <div className="space-y-3 mt-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          대화방 이름
                        </label>
                        <input
                          type="text"
                          value={chatRooms.find(room => room.id === selectedRoom)?.name || ''}
                          onChange={(e) => {
                            const newName = e.target.value
                            setChatRooms(prev => prev.map(room =>
                              room.id === selectedRoom
                                ? { ...room, name: newName }
                                : room
                            ))
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="대화방 이름을 입력하세요"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          주 언어 (AI가 답변할 언어)
                        </label>
                        <select
                          value={languageSettings.mainLanguage}
                          onChange={(e) => setLanguageSettings(prev => ({ ...prev, mainLanguage: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="한국어">한국어</option>
                          <option value="English">English</option>
                          <option value="日本語">日本語</option>
                          <option value="中文">中文</option>
                          <option value="Español">Español</option>
                          <option value="Français">Français</option>
                          <option value="Deutsch">Deutsch</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          배울 언어
                        </label>
                        <select
                          value={languageSettings.learningLanguage}
                          onChange={(e) => setLanguageSettings(prev => ({ ...prev, learningLanguage: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="영어">영어 (English)</option>
                          <option value="일본어">일본어 (日本語)</option>
                          <option value="중국어">중국어 (中文)</option>
                          <option value="스페인어">스페인어 (Español)</option>
                          <option value="프랑스어">프랑스어 (Français)</option>
                          <option value="독일어">독일어 (Deutsch)</option>
                          <option value="한국어">한국어 (Korean)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          메시지 기록
                        </label>
                        <p className="text-sm text-gray-600">
                          현재 대화방에 {messages.length}개의 메시지가 있습니다
                        </p>
                        <button
                          onClick={() => setMessages([])}
                          className="mt-2 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          대화 기록 삭제
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Model Settings Section */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setModelSettingsExpanded(!modelSettingsExpanded)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-medium text-gray-900">모델 설정</h4>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      modelSettingsExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {modelSettingsExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-200">
                    <div className="space-y-3 mt-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          모델 타입
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="modelType"
                              value="openai"
                              checked={modelSettings.modelType === 'openai'}
                              onChange={(e) => setModelSettings(prev => ({ ...prev, modelType: e.target.value as 'openai' }))}
                              className="mr-2"
                            />
                            ChatGPT API
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="modelType"
                              value="local"
                              checked={modelSettings.modelType === 'local'}
                              onChange={(e) => {
                                const newType = e.target.value as 'local'
                                setModelSettings(prev => ({ ...prev, modelType: newType }))
                                if (newType === 'local') {
                                  loadAvailableModels()
                                }
                              }}
                              className="mr-2"
                            />
                            Local LLM (Ollama)
                          </label>
                        </div>
                      </div>

                      {modelSettings.modelType === 'openai' && (
                        <div>
                          {hasOpenAIKey ? (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                <p className="text-sm text-green-700">
                                  ✅ OpenAI API 키가 메인페이지 설정에서 이미 저장되었습니다
                                </p>
                              </div>
                              <p className="text-xs text-green-600 mt-1">
                                바로 ChatGPT를 사용할 수 있습니다
                              </p>
                            </div>
                          ) : (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-sm text-yellow-700 mb-2">
                                ⚠️ OpenAI API 키가 설정되지 않았습니다
                              </p>
                              <p className="text-xs text-yellow-600">
                                메인페이지의 설정에서 OpenAI API 키를 먼저 설정해주세요
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {modelSettings.modelType === 'local' && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              사용할 모델
                            </label>
                            <button
                              onClick={loadAvailableModels}
                              disabled={loadingModels}
                              className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                            >
                              {loadingModels ? '새로고침 중...' : '새로고침'}
                            </button>
                          </div>
                          {loadingModels ? (
                            <div className="text-sm text-gray-500">모델 목록 불러오는 중...</div>
                          ) : availableModels.length > 0 ? (
                            <>
                              <select
                                value={modelSettings.modelId || ''}
                                onChange={(e) => setModelSettings(prev => ({ ...prev, modelId: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="">모델을 선택하세요</option>
                                {availableModels.map(model => (
                                  <option key={model} value={model}>{model}</option>
                                ))}
                              </select>
                              <p className="text-xs text-gray-500 mt-1">
                                총 {availableModels.length}개의 모델이 사용 가능합니다.
                              </p>
                            </>
                          ) : (
                            <div className="text-sm text-gray-500">
                              사용 가능한 모델이 없습니다. Ollama가 실행 중인지 확인하세요.
                              <button
                                onClick={loadAvailableModels}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                다시 시도
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowSettings(false)
                    setSettingsError(null)
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  취소
                </button>
                <button
                  onClick={() => saveModelSettings()}
                  disabled={
                    (modelSettings.modelType === 'local' && !modelSettings.modelId) ||
                    (modelSettings.modelType === 'openai' && !hasOpenAIKey)
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}