'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useSessionManager } from '../../hooks/useSessionManager'

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function AuthButton() {
  const { data: session, status } = useSession()
  const { timeLeft, isExpiringSoon, extendSession, isExtending } = useSessionManager()

  if (status === 'loading') {
    return <div className="animate-pulse bg-gray-200 h-10 w-20 rounded"></div>
  }

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          {session.user?.email}
        </span>
        
        {/* 세션 타이머 표시 */}
        <div className={`text-sm px-2 py-1 rounded ${
          isExpiringSoon 
            ? 'bg-red-100 text-red-700 animate-pulse' 
            : 'bg-gray-100 text-gray-700'
        }`}>
          ⏰ {formatTime(timeLeft)}
        </div>

        {/* 세션 연장 버튼 - 항상 표시 */}
        <button
          onClick={extendSession}
          disabled={isExtending}
          className={`px-3 py-1 rounded text-sm text-white ${
            isExpiringSoon 
              ? 'bg-red-500 hover:bg-red-600 disabled:bg-red-300' 
              : 'bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300'
          }`}
        >
          {isExtending ? '연장 중...' : '연장'}
        </button>
        
        <button
          onClick={() => signOut()}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
        >
          로그아웃
        </button>
      </div>
    )
  }

  return (
    <Link
      href="/auth/signin"
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
    >
      로그인
    </Link>
  )
}