'use client'

import { useState, useCallback, useRef } from 'react'
import { Send } from 'lucide-react'

interface OptimizedInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
  placeholder?: string
}

export function OptimizedInput({ 
  onSendMessage, 
  isLoading, 
  placeholder = "메시지를 입력하세요..." 
}: OptimizedInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 디바운스된 자동 크기 조정
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }, [])

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!message.trim() || isLoading) return
    
    onSendMessage(message.trim())
    setMessage('')
    
    // 높이 리셋
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [message, isLoading, onSendMessage])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    adjustHeight()
  }, [adjustHeight])

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
      <div className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className="w-full resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="flex items-center justify-center w-11 h-11 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform active:scale-95"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </form>
  )
}