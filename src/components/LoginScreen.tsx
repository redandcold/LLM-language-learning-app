'use client'

import { signIn } from 'next-auth/react'

export default function LoginScreen() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">
              Chat-Learn Diary
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              LLM과 함께하는 개인 맞춤형 언어 학습 일기
            </p>
            <p className="text-lg text-gray-500 mb-12">
              로그인하여 학습을 시작해보세요
            </p>
          </div>

          {/* 로그인 버튼 */}
          <div className="bg-white rounded-xl p-8 shadow-xl border border-gray-200 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
              시작하기
            </h2>
            <button
              onClick={() => signIn('email')}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              이메일로 로그인
            </button>
            <p className="text-sm text-gray-500 text-center mt-4">
              이메일 주소를 입력하면 로그인 링크를 보내드립니다
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}