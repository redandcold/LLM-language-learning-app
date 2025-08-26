'use client'

import Link from 'next/link'
import { MessageCircle, BookOpen, FileText, User } from 'lucide-react'
import { AuthButton } from '../components/auth/AuthButton'
import LoginScreen from '../components/LoginScreen'
import { useSession } from 'next-auth/react'

function Dashboard() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-8">
          <AuthButton />
        </div>
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Chat-Learn Diary
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            LLM과 함께하는 개인 맞춤형 언어 학습 일기
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Link href="/chat" className="group">
            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 hover:border-blue-300 h-full flex flex-col">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 group-hover:bg-blue-200 transition-colors">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">대화방</h3>
              <p className="text-gray-600 text-sm flex-1">LLM과 1:1 대화를 통해 언어를 연습하세요</p>
            </div>
          </Link>

          <Link href="/examples" className="group">
            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 hover:border-green-300 h-full flex flex-col">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 group-hover:bg-green-200 transition-colors">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">용례 정리</h3>
              <p className="text-gray-600 text-sm flex-1">언어 질문에 따른 관련 용례를 정리해드립니다</p>
            </div>
          </Link>

          <Link href="/notes" className="group">
            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 hover:border-purple-300 h-full flex flex-col">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4 group-hover:bg-purple-200 transition-colors">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">개인 노트</h3>
              <p className="text-gray-600 text-sm flex-1">학습 내용을 정리하고 관리하세요</p>
            </div>
          </Link>

          <Link href="/settings" className="group">
            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 hover:border-orange-300 h-full flex flex-col">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4 group-hover:bg-orange-200 transition-colors">
                <User className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">설정</h3>
              <p className="text-gray-600 text-sm flex-1">LLM 모델을 선택하고 관리하세요</p>
            </div>
          </Link>
        </div>

      </div>
    </main>
  )
}

export default function Home() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Chat-Learn Diary</h1>
          <p className="text-gray-600">로딩중...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <LoginScreen />
  }

  return <Dashboard />
}