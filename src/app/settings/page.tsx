'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Download, Check, AlertCircle, Settings2 } from 'lucide-react'
import Link from 'next/link'
import { LanguageModelRecommendation } from '../../components/LanguageModelRecommendation'
import { ModelPathSettings } from '../../components/ModelPathSettings'

interface LocalModel {
  id: string
  name: string
  size: string
  description: string
  recommended: boolean
  installed: boolean
  downloading: boolean
  downloadProgress?: number
}

export default function SettingsPage() {
  const [models, setModels] = useState<LocalModel[]>([
    // 추천 모델들
    {
      id: 'llama3.2:1b',
      name: 'Llama 3.2 1B',
      size: '1.3GB',
      description: '가장 가벼운 모델. 빠른 응답속도, 기본적인 대화 가능',
      recommended: true,
      installed: false,
      downloading: false
    },
    {
      id: 'llama3.2:3b',
      name: 'Llama 3.2 3B',
      size: '2.0GB',
      description: '성능과 속도의 균형. 일반적인 언어학습에 적합',
      recommended: true,
      installed: false,
      downloading: false
    },
    {
      id: 'gemma2:2b',
      name: 'Gemma 2 2B',
      size: '1.6GB',
      description: 'Google 개발. 효율적이고 정확한 응답',
      recommended: true,
      installed: false,
      downloading: false
    },
    
    // 추가 모델들
    {
      id: 'llama3.1:8b',
      name: 'Llama 3.1 8B',
      size: '4.7GB',
      description: '빠르고 효율적인 다국어 모델. 일상 대화에 적합',
      recommended: false,
      installed: false,
      downloading: false
    },
    {
      id: 'llama3.1:70b',
      name: 'Llama 3.1 70B',
      size: '40GB',
      description: '가장 강력한 다국어 모델. 높은 성능 요구',
      recommended: false,
      installed: false,
      downloading: false
    },
    {
      id: 'phi3.5:3.8b',
      name: 'Phi 3.5 3.8B',
      size: '2.3GB',
      description: 'Microsoft 개발. 코드와 언어 모두 뛰어남',
      recommended: false,
      installed: false,
      downloading: false
    },
    {
      id: 'qwen2.5:1.5b',
      name: 'Qwen 2.5 1.5B',
      size: '0.9GB',
      description: '매우 가벼우면서도 다국어 지원 우수',
      recommended: false,
      installed: false,
      downloading: false
    },
    {
      id: 'qwen2.5:7b',
      name: 'Qwen 2.5 7B',
      size: '4.4GB',
      description: '동아시아 언어에 특화된 중간 크기 모델',
      recommended: false,
      installed: false,
      downloading: false
    },
    {
      id: 'qwen2.5:14b',
      name: 'Qwen 2.5 14B',
      size: '8.7GB',
      description: '동아시아 언어에 최적화된 고성능 모델',
      recommended: false,
      installed: false,
      downloading: false
    },
    {
      id: 'qwen2.5:32b',
      name: 'Qwen 2.5 32B',
      size: '20GB',
      description: '한중일 언어 처리에 뛰어난 대형 모델',
      recommended: false,
      installed: false,
      downloading: false
    },
    {
      id: 'qwen2.5:72b',
      name: 'Qwen 2.5 72B',
      size: '41GB',
      description: '중국어 특화, 동아시아 언어 최고 성능',
      recommended: false,
      installed: false,
      downloading: false
    },
    {
      id: 'gemma2:9b',
      name: 'Gemma 2 9B',
      size: '5.4GB',
      description: 'Google의 중간 성능 모델',
      recommended: false,
      installed: false,
      downloading: false
    },
    {
      id: 'gemma2:27b',
      name: 'Gemma 2 27B',
      size: '16GB',
      description: 'Google의 균형잡힌 고성능 모델',
      recommended: false,
      installed: false,
      downloading: false
    },
    {
      id: 'mixtral:8x7b',
      name: 'Mixtral 8x7B',
      size: '26GB',
      description: '유럽 언어에 특화된 MoE 모델',
      recommended: false,
      installed: false,
      downloading: false
    },
    {
      id: 'mistral:7b',
      name: 'Mistral 7B',
      size: '4.1GB',
      description: '프랑스 Mistral AI의 효율적인 모델',
      recommended: false,
      installed: false,
      downloading: false
    },
    {
      id: 'codellama:7b',
      name: 'Code Llama 7B',
      size: '3.8GB',
      description: '코드 생성에 특화된 Llama 모델',
      recommended: false,
      installed: false,
      downloading: false
    },
    {
      id: 'codellama:13b',
      name: 'Code Llama 13B',
      size: '7.3GB',
      description: '고성능 코드 생성 모델',
      recommended: false,
      installed: false,
      downloading: false
    },
    {
      id: 'vicuna:7b',
      name: 'Vicuna 7B',
      size: '3.8GB',
      description: 'ChatGPT 스타일 대화에 최적화',
      recommended: false,
      installed: false,
      downloading: false
    },
    {
      id: 'vicuna:13b',
      name: 'Vicuna 13B',
      size: '7.3GB',
      description: '고품질 대화형 AI 모델',
      recommended: false,
      installed: false,
      downloading: false
    },
    {
      id: 'orca-mini:3b',
      name: 'Orca Mini 3B',
      size: '1.9GB',
      description: '가벼우면서도 똑똑한 추론 모델',
      recommended: false,
      installed: false,
      downloading: false
    },
    {
      id: 'orca-mini:7b',
      name: 'Orca Mini 7B',
      size: '3.8GB',
      description: 'Microsoft의 효율적인 추론 모델',
      recommended: false,
      installed: false,
      downloading: false
    }
  ])

  const [ollamaInstalled, setOllamaInstalled] = useState<boolean | null>(null)
  const [currentModel, setCurrentModel] = useState<string>('openai')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    checkOllamaStatus()
    checkInstalledModels()
  }, [])

  const checkOllamaStatus = async () => {
    try {
      const response = await fetch('/api/ollama/status')
      const data = await response.json()
      setOllamaInstalled(data.installed)
    } catch (error) {
      setOllamaInstalled(false)
    }
  }

  const checkInstalledModels = async () => {
    try {
      const response = await fetch('/api/ollama/models')
      if (response.ok) {
        const data = await response.json()
        const installedModelIds = data.models.map((m: any) => m.name)
        
        setModels(prev => prev.map(model => ({
          ...model,
          installed: installedModelIds.includes(model.id)
        })))
      }
    } catch (error) {
      console.error('Failed to check installed models:', error)
    }
  }

  const installOllama = async () => {
    try {
      const response = await fetch('/api/ollama/install', { method: 'POST' })
      const data = await response.json()
      
      if (data.success) {
        setOllamaInstalled(true)
        alert('Ollama가 성공적으로 설치되었습니다!')
      } else {
        alert('Ollama 설치에 실패했습니다. 수동 설치를 진행해주세요.')
        window.open('https://ollama.ai/download', '_blank')
      }
    } catch (error) {
      alert('Ollama 설치에 실패했습니다. 수동 설치를 진행해주세요.')
      window.open('https://ollama.ai/download', '_blank')
    }
  }

  const downloadModel = async (modelId: string) => {
    setModels(prev => prev.map(model => 
      model.id === modelId 
        ? { ...model, downloading: true, downloadProgress: 0 }
        : model
    ))

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

                setModels(prev => prev.map(model => 
                  model.id === modelId 
                    ? { 
                        ...model, 
                        downloading: !data.success,
                        installed: data.success,
                        downloadProgress: data.progress || 0
                      }
                    : model
                ))

                if (data.success) {
                  const savedPath = process.env.OLLAMA_MODELS || `${process.env.USERPROFILE || process.env.HOME}/.ollama/models`
                  alert(`${modelId} 모델이 성공적으로 다운로드되었습니다!\n저장 위치: ${savedPath}`)
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
      setModels(prev => prev.map(model => 
        model.id === modelId 
          ? { ...model, downloading: false, downloadProgress: 0 }
          : model
      ))
      alert('모델 다운로드에 실패했습니다. Ollama가 실행 중인지 확인해주세요.')
    }
  }

  const selectModel = async (modelType: string, modelId?: string) => {
    try {
      const response = await fetch('/api/settings/model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          modelType,
          modelId: modelId || null
        }),
      })

      if (response.ok) {
        setCurrentModel(modelType === 'openai' ? 'openai' : modelId || 'local')
        alert('모델이 성공적으로 변경되었습니다!')
      }
    } catch (error) {
      console.error('Failed to update model setting:', error)
      alert('모델 설정 변경에 실패했습니다.')
    }
  }

  // 모델 필터링 함수
  const filteredModels = models.filter(model => {
    const searchLower = searchQuery.toLowerCase()
    return (
      model.name.toLowerCase().includes(searchLower) ||
      model.id.toLowerCase().includes(searchLower) ||
      model.description.toLowerCase().includes(searchLower)
    )
  })

  const recommendedModels = filteredModels.filter(m => m.recommended)
  const otherModels = filteredModels.filter(m => !m.recommended)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            홈으로
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">설정</h1>
          <p className="text-gray-600 mt-2">LLM 모델을 선택하고 관리하세요</p>
        </div>

        {/* Current Model Selection */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Settings2 className="w-5 h-5 mr-2" />
            현재 사용 중인 모델
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <input
                type="radio"
                id="openai"
                name="model"
                checked={currentModel === 'openai'}
                onChange={() => selectModel('openai')}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="openai" className="flex-1">
                <div className="font-medium text-gray-900">OpenAI GPT</div>
                <div className="text-sm text-gray-600">클라우드 기반 고성능 모델 (API 키 필요)</div>
              </label>
            </div>

            {models.filter(m => m.installed).map(model => (
              <div key={model.id} className="flex items-center space-x-4">
                <input
                  type="radio"
                  id={model.id}
                  name="model"
                  checked={currentModel === model.id}
                  onChange={() => selectModel('local', model.id)}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor={model.id} className="flex-1">
                  <div className="font-medium text-gray-900">{model.name} (로컬)</div>
                  <div className="text-sm text-gray-600">{model.description}</div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Model Path Settings */}
        <div className="mb-8">
          <ModelPathSettings />
        </div>

        {/* Language Model Recommendation */}
        <div className="mb-8">
          <LanguageModelRecommendation />
        </div>

        {/* Ollama Status */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ollama 상태</h2>
          
          {ollamaInstalled === null ? (
            <div className="flex items-center text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
              확인 중...
            </div>
          ) : ollamaInstalled ? (
            <div className="flex items-center text-green-600">
              <Check className="w-5 h-5 mr-2" />
              Ollama가 설치되어 실행 중입니다
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center text-red-600">
                <AlertCircle className="w-5 h-5 mr-2" />
                Ollama가 설치되지 않았거나 실행되지 않고 있습니다
              </div>
              <button
                onClick={installOllama}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ollama 설치하기
              </button>
            </div>
          )}
        </div>

        {/* Local Models */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">로컬 LLM 모델</h2>
            <span className="text-sm text-gray-500">총 {models.length}개 모델</span>
          </div>
          
          <p className="text-gray-600 mb-4">
            가벼운 로컬 모델을 선택해서 다운로드하고 사용할 수 있습니다. 
            인터넷 연결 없이도 사용 가능합니다.
          </p>

          {/* 검색 입력 */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="모델 검색... (예: llama, gemma, qwen)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 추천 모델들 */}
          {recommendedModels.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                ⭐ 추천 모델
                <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {recommendedModels.length}개
                </span>
              </h3>
              <div className="space-y-3">
                {recommendedModels.map((model) => (
                  <div
                    key={model.id}
                    className="border rounded-lg p-4 border-blue-200 bg-blue-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-gray-900">{model.name}</h3>
                          <span className="text-sm text-gray-500">({model.size})</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            추천
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{model.description}</p>
                      </div>

                      <div className="ml-4">
                        {model.installed ? (
                          <div className="flex items-center text-green-600">
                            <Check className="w-4 h-4 mr-1" />
                            <span className="text-sm">설치됨</span>
                          </div>
                        ) : model.downloading ? (
                          <div className="flex flex-col items-end">
                            <div className="flex items-center text-blue-600 mb-1">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                              <span className="text-sm">다운로드 중...</span>
                            </div>
                            {model.downloadProgress !== undefined && (
                              <div className="w-24">
                                <div className="bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${model.downloadProgress}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs text-gray-600 mt-1 text-center">
                                  {model.downloadProgress}%
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => downloadModel(model.id)}
                            disabled={!ollamaInstalled}
                            className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            다운로드
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 기타 모델들 - 스크롤 영역 */}
          {otherModels.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                📦 추가 모델
                <span className="ml-2 text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                  {otherModels.length}개
                </span>
              </h3>
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                <div className="space-y-1 p-2">
                  {otherModels.map((model) => (
                    <div
                      key={model.id}
                      className="border rounded-lg p-3 border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900 text-sm">{model.name}</h4>
                            <span className="text-xs text-gray-500">({model.size})</span>
                          </div>
                          <p className="text-xs text-gray-600">{model.description}</p>
                        </div>

                        <div className="ml-3">
                          {model.installed ? (
                            <div className="flex items-center text-green-600">
                              <Check className="w-3 h-3 mr-1" />
                              <span className="text-xs">설치됨</span>
                            </div>
                          ) : model.downloading ? (
                            <div className="flex items-center text-blue-600">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                              <span className="text-xs">다운로드 중...</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => downloadModel(model.id)}
                              disabled={!ollamaInstalled}
                              className="flex items-center px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              다운로드
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 검색 결과가 없을 때 */}
          {filteredModels.length === 0 && searchQuery && (
            <div className="text-center py-8">
              <p className="text-gray-500">"{searchQuery}"에 대한 검색 결과가 없습니다.</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                검색 초기화
              </button>
            </div>
          )}

          {!ollamaInstalled && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium">
                    Ollama 설치 필요
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    로컬 모델을 사용하려면 먼저 Ollama를 설치해야 합니다.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}