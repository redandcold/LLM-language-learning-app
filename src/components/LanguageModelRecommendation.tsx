'use client'

import { useState } from 'react'
import { LANGUAGES } from '../../lib/model-recommendations'

interface ModelRecommendation {
  model: string
  displayName: string
  size: string
  description: string
  score: number
  nativeScore: number
  targetScore: number
  nativeSpeciality?: string
  targetSpeciality?: string
  sizeInGB: number
  languages: {
    [key: string]: {
      score: number
      speciality?: string
    }
  }
}

interface RecommendationResponse {
  nativeLanguage: string
  targetLanguage: string
  recommendations: ModelRecommendation[]
  filterType: 'recommendation' | 'size'
}

export function LanguageModelRecommendation() {
  const [nativeLanguage, setNativeLanguage] = useState('')
  const [targetLanguage, setTargetLanguage] = useState('')
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [filterType, setFilterType] = useState<'recommendation' | 'size'>('recommendation')
  const [allRecommendations, setAllRecommendations] = useState<ModelRecommendation[]>([])
  const [downloadingModels, setDownloadingModels] = useState<Set<string>>(new Set())

  const handleRecommend = async (filterTypeOverride?: 'recommendation' | 'size') => {
    if (!nativeLanguage || !targetLanguage) {
      alert('주언어와 배울언어를 모두 선택해주세요')
      return
    }

    setIsLoading(true)
    try {
      // 안전한 데이터만 추출하여 JSON으로 변환
      const requestData = {
        nativeLanguage: String(nativeLanguage), 
        targetLanguage: String(targetLanguage), 
        filterType: String(filterTypeOverride || filterType)
      }
      
      const response = await fetch('/api/language-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })
      
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data)
        setAllRecommendations(data.recommendations)
        if (filterTypeOverride) {
          setFilterType(filterTypeOverride)
        }
      } else {
        const error = await response.json().catch(() => ({ error: '알 수 없는 오류' }))
        console.error('추천 API 오류:', error)
        alert(error.error || `서버 오류 (${response.status}): 추천을 가져오는데 실패했습니다`)
      }
    } catch (error) {
      console.error('네트워크 오류:', error)
      console.error('오류 상세:', {
        name: error instanceof Error ? error.name : 'unknown',
        message: error instanceof Error ? error.message : '알 수 없는 오류',
        stack: error instanceof Error ? error.stack : 'no stack'
      })
      alert(`네트워크 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-600 bg-green-100'
    if (score >= 7) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 9) return '🟢 우수'
    if (score >= 7) return '🟡 양호'
    return '🔴 보통'
  }

  const downloadModel = async (modelId: string) => {
    setDownloadingModels(prev => new Set(prev).add(modelId))

    try {
      const response = await fetch('/api/ollama/download-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ modelId }),
      })

      if (!response.ok) {
        throw new Error('Failed to start download')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Failed to get response reader')
      }

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = new TextDecoder().decode(value)
          const lines = chunk.split('\n').filter(line => line.trim())
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                
                if (data.error) {
                  throw new Error(data.error)
                }

                if (data.success) {
                  alert(`${modelId} 모델이 성공적으로 다운로드되었습니다!`)
                  break
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e)
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

    } catch (error) {
      console.error('Model download failed:', error)
      alert('모델 다운로드에 실패했습니다. Ollama가 실행 중인지 확인해주세요.')
    } finally {
      setDownloadingModels(prev => {
        const newSet = new Set(prev)
        newSet.delete(modelId)
        return newSet
      })
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">🌍 언어별 모델 추천</h2>
      
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            주언어 (모국어)
          </label>
          <select
            value={nativeLanguage}
            onChange={(e) => setNativeLanguage(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">언어를 선택하세요</option>
            {Object.entries(LANGUAGES).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            배울언어 (목표언어)
          </label>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">언어를 선택하세요</option>
            {Object.entries(LANGUAGES).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleRecommend}
        disabled={isLoading || !nativeLanguage || !targetLanguage}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-3 px-6 rounded-md transition-colors"
      >
        {isLoading ? '분석 중...' : '🤖 모델 추천 받기'}
      </button>

      {recommendations && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-2">
            📊 {recommendations.nativeLanguage} → {recommendations.targetLanguage} 최적 모델
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            * 종합점수 = (주언어 지원점수 + 배울언어 지원점수) ÷ 2 | 각 언어별 10점 만점으로 평가
          </p>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => handleRecommend('recommendation')}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'recommendation'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🏆 추천순
            </button>
            <button
              onClick={() => handleRecommend('size')}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'size'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📦 용량순 (가벼운 순)
            </button>
          </div>

          {filterType === 'size' && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 6점 이상 모델 중 용량이 작은 순서로 정렬됩니다. 메모리가 부족한 환경에 적합합니다.
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            {recommendations.recommendations.map((model, index) => (
              <div
                key={model.model}
                className={`border rounded-lg p-4 ${
                  index === 0 ? 'border-green-500 bg-green-50' : 'border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {index === 0 && <span className="text-lg">🏆</span>}
                    <h4 className="font-semibold text-lg">{model.displayName}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${getScoreColor(model.score)}`}>
                      종합 {model.score.toFixed(1)}점
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{model.size}</span>
                </div>
                
                <p className="text-gray-600 mb-3">{model.description}</p>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="font-medium text-gray-700 mb-1">
                      {recommendations.nativeLanguage} 지원
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{getScoreBadge(model.nativeScore)}</span>
                      <span className="text-xs text-gray-500">
                        {model.nativeSpeciality && `특화: ${model.nativeSpeciality}`}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="font-medium text-gray-700 mb-1">
                      {recommendations.targetLanguage} 지원
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{getScoreBadge(model.targetScore)}</span>
                      <span className="text-xs text-gray-500">
                        {model.targetSpeciality && `특화: ${model.targetSpeciality}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 다운로드 버튼 */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadModel(model.model)}
                      disabled={downloadingModels.has(model.model)}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2"
                    >
                      {downloadingModels.has(model.model) ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          다운로드 중...
                        </>
                      ) : (
                        <>
                          📥 다운로드
                        </>
                      )}
                    </button>
                    
                    {index === 0 && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        🏆 최적 모델
                      </span>
                    )}
                  </div>
                  
                  <span className="text-xs text-gray-500">
                    모델 크기: {model.size}
                  </span>
                </div>

                {index === 0 && (
                  <div className="mt-3 p-2 bg-green-100 rounded text-sm text-green-800">
                    💡 이 모델이 선택한 언어 조합에 가장 적합합니다!
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">📝 주의사항</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 큰 모델일수록 더 정확하지만 더 많은 메모리가 필요합니다</li>
              <li>• Gemma 모델은 한국어-일본어 조합에서 상대적으로 약할 수 있습니다</li>
              <li>• Qwen 모델은 동아시아 언어(한국어, 일본어, 중국어)에 특화되어 있습니다</li>
              <li>• 설정 페이지에서 추천된 모델을 다운로드하고 선택하세요</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}