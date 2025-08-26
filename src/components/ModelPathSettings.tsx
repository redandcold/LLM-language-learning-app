'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface ModelPathInfo {
  currentPath: string
  defaultPaths: {
    windows: string
    linux: string
    mac: string
  }
  projectPath: string
  platform: string
}

export function ModelPathSettings() {
  const [pathInfo, setPathInfo] = useState<ModelPathInfo | null>(null)
  const [customPath, setCustomPath] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [existingModels, setExistingModels] = useState<string[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    loadPathInfo()
    checkExistingModels()
  }, [])

  const loadPathInfo = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/ollama/model-path')
      if (response.ok) {
        const data = await response.json()
        setPathInfo(data)
        setCustomPath(data.currentPath === 'default' ? data.projectPath : data.currentPath)
      }
    } catch (error) {
      console.error('경로 정보 로드 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateModelPath = async (newPath: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch('/api/ollama/model-path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ modelPath: newPath }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(`✅ ${data.message}`)
        await loadPathInfo()
      } else {
        const error = await response.json()
        alert(`❌ ${error.error}`)
      }
    } catch (error) {
      console.error('경로 업데이트 오류:', error)
      alert('❌ 경로 설정 중 오류가 발생했습니다')
    } finally {
      setIsUpdating(false)
    }
  }

  const checkExistingModels = async () => {
    try {
      const response = await fetch('/api/ollama/models')
      if (response.ok) {
        const data = await response.json()
        setExistingModels(data.models.map((m: any) => m.name))
      }
    } catch (error) {
      console.error('기존 모델 확인 오류:', error)
    }
  }

  const handleQuickSelect = (path: string) => {
    setCustomPath(path)
  }

  const migrateModels = async (newPath: string) => {
    if (!confirm('기존 모델을 새 경로로 이동하시겠습니까?\n\n⚠️ 주의사항:\n- Ollama 서비스가 일시 중지됩니다\n- 이동 중 오류 발생 시 모델이 손상될 수 있습니다\n- 충분한 디스크 공간이 필요합니다')) {
      return
    }

    setIsMigrating(true)
    try {
      const response = await fetch('/api/ollama/migrate-models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPath }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(`✅ ${data.message}\n\n이동된 모델: ${data.movedModels.join(', ')}\n\n서버를 재시작하고 Ollama를 다시 시작해주세요.`)
        await loadPathInfo()
        await checkExistingModels()
      } else {
        const error = await response.json()
        alert(`❌ ${error.error}`)
      }
    } catch (error) {
      console.error('모델 마이그레이션 오류:', error)
      alert('❌ 모델 이동 중 오류가 발생했습니다')
    } finally {
      setIsMigrating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  if (!pathInfo) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <p className="text-red-600">경로 정보를 불러올 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* 헤더 - 클릭 가능 */}
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">📁 Ollama 모델 저장 경로 설정</h2>
            <p className="text-gray-600 text-sm mt-1">
              현재 경로: {pathInfo?.currentPath === 'default' 
                ? '기본 경로' 
                : pathInfo?.currentPath?.replace(/\\/g, '/') || '로딩 중...'
              }
              {existingModels.length > 0 && ` • ${existingModels.length}개 모델 설치됨`}
            </p>
          </div>
          <div className="text-gray-400">
            {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </div>
        </div>
      </div>
      
      {/* 접을 수 있는 내용 */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-200">
          <div className="space-y-4 mt-6">
        {/* 현재 경로 및 기존 모델 정보 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">현재 모델 저장 경로</h3>
          <p className="text-blue-700 font-mono text-sm mb-3">
            {pathInfo.currentPath === 'default' 
              ? `기본 경로 (${pathInfo.defaultPaths[pathInfo.platform as keyof typeof pathInfo.defaultPaths] || '시스템 기본값'})`
              : pathInfo.currentPath
            }
          </p>
          
          {existingModels.length > 0 && (
            <div className="border-t border-blue-200 pt-3">
              <h4 className="font-medium text-blue-800 mb-2">설치된 모델 ({existingModels.length}개)</h4>
              <div className="flex flex-wrap gap-2">
                {existingModels.map((model, index) => (
                  <span key={index} className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                    {model}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 빠른 선택 버튼들 */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">빠른 경로 선택</h3>
          
          {/* 프로젝트 폴더 내 (추천) */}
          <button
            onClick={() => handleQuickSelect(pathInfo.projectPath)}
            className="w-full p-3 text-left border rounded-lg hover:bg-green-50 border-green-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-green-700">📦 프로젝트 폴더 내 (추천)</span>
                <div className="text-sm text-gray-600 font-mono">{pathInfo.projectPath}</div>
              </div>
              <span className="text-green-600 text-sm">⭐ 추천</span>
            </div>
          </button>

          {/* 시스템 기본 경로 */}
          <button
            onClick={() => handleQuickSelect(pathInfo.defaultPaths[pathInfo.platform as keyof typeof pathInfo.defaultPaths])}
            className="w-full p-3 text-left border rounded-lg hover:bg-gray-50"
          >
            <div>
              <span className="font-medium text-gray-700">🏠 시스템 기본 경로</span>
              <div className="text-sm text-gray-600 font-mono">
                {pathInfo.defaultPaths[pathInfo.platform as keyof typeof pathInfo.defaultPaths]}
              </div>
            </div>
          </button>
        </div>

        {/* 사용자 정의 경로 입력 */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">사용자 정의 경로</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              value={customPath}
              onChange={(e) => setCustomPath(e.target.value)}
              placeholder="예: C:\MyModels 또는 ./my-ollama-models"
              className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => updateModelPath(customPath)}
              disabled={isUpdating || isMigrating || !customPath.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-md font-medium"
            >
              {isUpdating ? '설정 중...' : '설정'}
            </button>
            
            {existingModels.length > 0 && (
              <button
                onClick={() => migrateModels(customPath)}
                disabled={isUpdating || isMigrating || !customPath.trim()}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-md font-medium"
              >
                {isMigrating ? '이동 중...' : '모델 이동'}
              </button>
            )}
          </div>
          
          {existingModels.length > 0 && (
            <p className="text-sm text-orange-600">
              💡 "모델 이동" 버튼을 사용하면 기존 모델들을 새 경로로 자동 이동합니다
            </p>
          )}
        </div>

        {/* 안내 정보 */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-medium text-yellow-800 mb-2">💡 경로 설정 안내</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• <strong>프로젝트 폴더 내</strong>: 모델이 프로젝트와 함께 관리됩니다 (추천)</li>
            <li>• <strong>절대 경로</strong>: C:\MyModels, /home/user/models 등</li>
            <li>• <strong>상대 경로</strong>: ./models, ../shared-models 등</li>
            <li>• 경로 변경 후 <strong>서버를 재시작</strong>해야 적용됩니다</li>
            <li>• <strong>"모델 이동"</strong> 기능으로 기존 모델을 새 경로로 자동 이동 가능</li>
            <li>• 모델 이동 시 충분한 디스크 공간과 시간이 필요합니다</li>
          </ul>
        </div>
          </div>
        </div>
      )}
    </div>
  )
}