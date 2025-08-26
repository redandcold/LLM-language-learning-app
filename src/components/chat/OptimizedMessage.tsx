'use client'

import { useState, useEffect } from 'react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  isOptimistic?: boolean
}

interface OptimizedMessageProps {
  message: Message
  isLatest?: boolean
}

export function OptimizedMessage({ message, isLatest }: OptimizedMessageProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 새 메시지가 추가될 때 애니메이션
    if (isLatest) {
      const timer = setTimeout(() => setIsVisible(true), 50)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(true)
    }
  }, [isLatest])

  return (
    <div
      className={`transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div
        className={`flex mb-4 ${
          message.role === 'user' ? 'justify-end' : 'justify-start'
        }`}
      >
        <div
          className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
            message.role === 'user'
              ? `bg-blue-500 text-white ${
                  message.isOptimistic ? 'opacity-70' : 'opacity-100'
                }`
              : 'bg-white text-gray-900 border border-gray-100'
          }`}
        >
          <div className="whitespace-pre-wrap break-words">
            {message.content}
            {message.isOptimistic && (
              <span className="ml-2 inline-block w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
            )}
          </div>
          <div
            className={`text-xs mt-2 ${
              message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
            }`}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>
    </div>
  )
}