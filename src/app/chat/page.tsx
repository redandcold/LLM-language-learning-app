'use client'

import { useState, useEffect } from 'react'
import { Send, ArrowLeft, Plus, Settings, X } from 'lucide-react'
import Link from 'next/link'

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

export default function ChatPage() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [modelSettings, setModelSettings] = useState<ModelSettings>({ modelType: 'openai', updatedAt: '' })
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [loadingModels, setLoadingModels] = useState(false)

  useEffect(() => {
    loadModelSettings()
    loadChatRooms()
  }, [])

  useEffect(() => {
    if (selectedRoom) {
      loadChatHistory(selectedRoom)
    }
  }, [selectedRoom])

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
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
      setMessages([])
    }
  }

  const loadModelSettings = async () => {
    try {
      const response = await fetch('/api/settings/model')
      if (response.ok) {
        const settings = await response.json()
        setModelSettings(settings)
        if (settings.modelType === 'local') {
          loadAvailableModels()
        }
      }
    } catch (error) {
      console.error('Failed to load model settings:', error)
    }
  }

  const loadAvailableModels = async () => {
    setLoadingModels(true)
    try {
      const response = await fetch('/api/ollama/models')
      if (response.ok) {
        const data = await response.json()
        setAvailableModels(data.models || [])
      }
    } catch (error) {
      console.error('Failed to load models:', error)
    }
    setLoadingModels(false)
  }

  const saveModelSettings = async (newSettings: Partial<ModelSettings>) => {
    try {
      const updatedSettings = { ...modelSettings, ...newSettings, updatedAt: new Date().toISOString() }
      const response = await fetch('/api/settings/model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      })
      if (response.ok) {
        setModelSettings(updatedSettings)
        setShowSettings(false)
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
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

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages,
          chatRoomId: selectedRoom
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      // Update room's last message
      setChatRooms(prev => prev.map(room => 
        room.id === selectedRoom 
          ? { ...room, lastMessage: data.response, updatedAt: new Date() }
          : room
      ))

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, there was an error processing your message. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Chat Rooms */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
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

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {chatRooms.find(room => room.id === selectedRoom)?.name}
              </h2>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
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
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
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
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">LLM 설정</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
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
                      onChange={(e) => saveModelSettings({ modelType: e.target.value as 'openai' })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OpenAI API 키
                  </label>
                  <input
                    type="password"
                    placeholder="sk-..."
                    value={modelSettings.openaiApiKey || ''}
                    onChange={(e) => setModelSettings(prev => ({ ...prev, openaiApiKey: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    🔒 API 키는 암호화되어 안전하게 저장됩니다
                  </p>
                </div>
              )}

              {modelSettings.modelType === 'local' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    사용할 모델
                  </label>
                  {loadingModels ? (
                    <div className="text-sm text-gray-500">모델 목록 불러오는 중...</div>
                  ) : availableModels.length > 0 ? (
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
                  ) : (
                    <div className="text-sm text-gray-500">
                      사용 가능한 모델이 없습니다. Ollama가 실행 중인지 확인하세요.
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  취소
                </button>
                <button
                  onClick={() => saveModelSettings(modelSettings)}
                  disabled={
                    (modelSettings.modelType === 'local' && !modelSettings.modelId) ||
                    (modelSettings.modelType === 'openai' && !modelSettings.openaiApiKey)
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