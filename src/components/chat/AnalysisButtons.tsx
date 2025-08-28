'use client'

import { BookOpen, Languages, Users } from 'lucide-react'

interface AnalysisButtonsProps {
  onAnalysisRequest: (type: 'grammar' | 'vocabulary' | 'both') => void
  lastAssistantMessage?: string
  disabled?: boolean
}

export function AnalysisButtons({ 
  onAnalysisRequest, 
  lastAssistantMessage, 
  disabled = false 
}: AnalysisButtonsProps) {
  // AI의 마지막 응답이 없으면 버튼을 숨김
  if (!lastAssistantMessage || lastAssistantMessage.trim() === '') {
    return null
  }

  const buttons = [
    {
      type: 'grammar' as const,
      label: '문법',
      icon: BookOpen,
      description: '문법 설명과 예문',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200'
    },
    {
      type: 'vocabulary' as const,
      label: '단어',
      icon: Languages,
      description: '단어·숙어·속담 설명',
      bgColor: 'bg-green-50 hover:bg-green-100',
      textColor: 'text-green-700',
      borderColor: 'border-green-200'
    },
    {
      type: 'both' as const,
      label: '문법 및 단어',
      icon: Users,
      description: '모든 설명',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200'
    }
  ]

  return (
    <div className="flex flex-wrap gap-2 mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="w-full text-xs text-gray-600 mb-2">
        💡 AI 응답에 대해 더 자세히 알고 싶은 내용을 선택하세요
      </div>
      {buttons.map((button) => {
        const Icon = button.icon
        return (
          <button
            key={button.type}
            onClick={() => onAnalysisRequest(button.type)}
            disabled={disabled}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 
              ${button.bgColor} ${button.textColor} ${button.borderColor}
              hover:shadow-sm active:scale-95 
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-opacity-50
            `}
          >
            <Icon className="w-4 h-4" />
            <div className="text-left">
              <div className="font-medium text-sm">{button.label}</div>
              <div className="text-xs opacity-75">{button.description}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}