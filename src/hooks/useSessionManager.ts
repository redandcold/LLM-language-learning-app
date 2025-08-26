'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'

interface SessionManager {
  timeLeft: number
  isExpiringSoon: boolean
  extendSession: () => Promise<void>
  isExtending: boolean
  showWarning: boolean
}

export function useSessionManager(): SessionManager {
  const { data: session, status, update } = useSession()
  const [timeLeft, setTimeLeft] = useState(0)
  const [isExtending, setIsExtending] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  // 세션 연장 함수
  const extendSession = useCallback(async () => {
    if (!session || isExtending) return

    setIsExtending(true)
    try {
      const response = await fetch('/api/auth/extend-session', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        console.log('세션 연장 성공:', data.message)
        
        // NextAuth 세션 업데이트
        await update()
        
        // 타이머 리셋
        setTimeLeft(60 * 60) // 1시간
        setShowWarning(false)
      } else {
        throw new Error('세션 연장 실패')
      }
    } catch (error) {
      console.error('세션 연장 오류:', error)
    } finally {
      setIsExtending(false)
    }
  }, [session, isExtending, update])

  // 세션 만료 체크 및 타이머
  useEffect(() => {
    if (!session || status !== 'authenticated') {
      setTimeLeft(0)
      setShowWarning(false)
      return
    }

    // 초기 타이머 설정 (1시간)
    setTimeLeft(60 * 60)

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1

        // 5분 남았을 때 경고 표시
        if (newTime === 5 * 60 && !showWarning) {
          setShowWarning(true)
        }

        // 세션 만료 시 자동 로그아웃
        if (newTime <= 0) {
          signOut({ callbackUrl: '/auth/signin' })
          return 0
        }

        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [session, status, showWarning])

  const isExpiringSoon = timeLeft <= 5 * 60 && timeLeft > 0 // 5분 이하

  return {
    timeLeft,
    isExpiringSoon,
    extendSession,
    isExtending,
    showWarning
  }
}