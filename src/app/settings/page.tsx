'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Download, Check, AlertCircle, Settings2, Trash2, Key, Eye, EyeOff } from 'lucide-react'
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
  const [modelStatus, setModelStatus] = useState<any>(null)
  const [switchingModel, setSwitchingModel] = useState(false)
  const [openaiApiKey, setOpenaiApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [savingApiKey, setSavingApiKey] = useState(false)

  useEffect(() => {
    checkOllamaStatus()
    checkInstalledModels()
    checkModelStatus()
    loadOpenaiApiKey()
  }, [])

  const loadOpenaiApiKey = async () => {
    try {
      const response = await fetch('/api/settings/openai')
      if (response.ok) {
        const data = await response.json()
        setOpenaiApiKey(data.apiKey || '')
      }
    } catch (error) {
      console.error('Failed to load OpenAI API key:', error)
    }
  }

  const saveOpenaiApiKey = async () => {
    setSavingApiKey(true)
    try {
      const response = await fetch('/api/settings/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: openaiApiKey })
      })
      
      if (response.ok) {
        alert('✅ OpenAI API 키가 저장되었습니다!')
      } else {
        throw new Error('Failed to save API key')
      }
    } catch (error) {
      console.error('Failed to save OpenAI API key:', error)
      alert('❌ API 키 저장에 실패했습니다.')
    } finally {
      setSavingApiKey(false)
    }
  }

  const checkModelStatus = async () => {
    try {
      const response = await fetch('/api/ollama/manage-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status' })
      })
      
      if (response.ok) {
        const status = await response.json()
        setModelStatus(status)
      }
    } catch (error) {
      console.error('Failed to check model status:', error)
    }
  }

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
        
        // 디버깅: API 응답 출력
        console.log('API 응답:', data)
        console.log('설치된 모델들:', data.models)
        
        if (data.models && Array.isArray(data.models)) {
          const installedModelIds = data.models.map((m: any) => {
            // 다양한 형태의 모델 데이터 처리
            return m.name || m.model || m.id || m
          })
          
          console.log('처리된 설치된 모델 ID들:', installedModelIds)
          console.log('UI 모델 ID들:', models.map(m => m.id))
          
          setModels(prev => {
            const updatedModels = prev.map(model => {
              // 다양한 매칭 방식 시도
              const isInstalled = installedModelIds.some(installedId => {
                // 정확한 일치
                if (installedId === model.id) return true
                // 태그 없이 비교 (예: llama3.1:8b vs llama3.1)
                if (installedId.includes(':') && installedId === model.id) return true
                if (model.id.includes(':') && installedId === model.id.split(':')[0]) return true
                // 부분 일치
                if (installedId.toLowerCase().includes(model.id.toLowerCase().split(':')[0])) return true
                return false
              })
              
              console.log(`모델 ${model.id}: ${isInstalled ? '설치됨' : '미설치'}`)
              return {
                ...model,
                installed: isInstalled
              }
            })
            
            // 하드코딩된 리스트에 없는 설치된 모델들을 동적으로 추가
            installedModelIds.forEach(installedId => {
              if (typeof installedId === 'string' && installedId.trim()) {
                const exists = updatedModels.some(model => 
                  model.id === installedId || 
                  installedId.toLowerCase().includes(model.id.toLowerCase().split(':')[0])
                )
                
                if (!exists) {
                  // 새로운 설치된 모델을 동적으로 추가
                  const newModel: LocalModel = {
                    id: installedId,
                    name: installedId.charAt(0).toUpperCase() + installedId.slice(1).replace(':', ' '),
                    size: '알 수 없음',
                    description: '사용자가 설치한 모델',
                    recommended: false,
                    installed: true,
                    downloading: false
                  }
                  updatedModels.push(newModel)
                  console.log('동적으로 추가된 모델:', newModel)
                }
              }
            })
            
            return updatedModels
          })
        }
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
      setSwitchingModel(true)
      
      // 1. 모델 설정 저장
      const settingsResponse = await fetch('/api/settings/model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          modelType,
          modelId: modelId || null
        }),
      })

      if (!settingsResponse.ok) {
        throw new Error('Failed to save model settings')
      }

      // 2. 로컬 모델인 경우 스마트 전환 수행
      if (modelType === 'local' && modelId) {
        console.log('🔄 스마트 모델 전환 시작:', modelId)
        
        const switchResponse = await fetch('/api/ollama/manage-model', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'switch',
            modelId: modelId
          })
        })

        if (switchResponse.ok) {
          const switchResult = await switchResponse.json()
          console.log('✅ 모델 전환 완료:', switchResult)
          
          let message = `✅ ${modelId} 모델로 전환 완료!`
          
          if (switchResult.results?.unloaded?.success) {
            message += `\n📤 이전 모델 (${switchResult.results.unloaded.model}) 메모리 해제됨`
          }
          
          if (switchResult.results?.loaded?.size) {
            message += `\n💾 메모리 사용량: ${switchResult.results.loaded.size}`
            message += `\n⏰ 유지 시간: ${switchResult.results.loaded.keepAlive}`
          }
          
          alert(message)
        } else {
          console.warn('모델 전환 실패, 기본 설정으로 진행')
          alert('⚠️ 모델 전환 중 문제가 발생했지만 설정은 저장되었습니다.')
        }
      } else {
        alert('✅ 모델이 성공적으로 변경되었습니다!')
      }

      setCurrentModel(modelType === 'openai' ? 'openai' : modelId || 'local')
      
      // 상태 새로고침
      checkModelStatus()
      
    } catch (error) {
      console.error('Failed to update model setting:', error)
      alert('❌ 모델 설정 변경에 실패했습니다.')
    } finally {
      setSwitchingModel(false)
    }
  }

  const deleteModel = async (modelId: string) => {
    if (!confirm(`${modelId} 모델을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    try {
      const response = await fetch('/api/ollama/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ modelId }),
      })

      const data = await response.json()

      if (response.ok) {
        // 로컬 상태에서 모델을 설치되지 않음으로 업데이트
        setModels(prev => prev.map(model => 
          model.id === modelId 
            ? { ...model, installed: false }
            : model
        ))

        // 현재 사용 중인 모델이 삭제된 경우 OpenAI로 변경
        if (currentModel === modelId) {
          await selectModel('openai')
        }

        alert(`${modelId} 모델이 성공적으로 삭제되었습니다.`)
      } else {
        throw new Error(data.error || 'Failed to delete model')
      }
    } catch (error) {
      console.error('Model deletion failed:', error)
      alert('모델 삭제에 실패했습니다. Ollama가 실행 중인지 확인해주세요.')
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

        {/* Model Memory Status */}
        {modelStatus && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              💾 메모리 사용 현황
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-800">현재 로드된 모델</h3>
                {modelStatus.loadedModels && modelStatus.loadedModels.length > 0 ? (
                  modelStatus.loadedModels.map((model: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div>
                        <div className="font-medium text-green-800">{model.name}</div>
                        <div className="text-sm text-green-600">
                          💾 {model.size || '알 수 없음'} 
                          {model.size_vram && ` (VRAM: ${model.size_vram})`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-green-600">
                          {model.expires_at ? 
                            `⏰ ${new Date(model.expires_at).toLocaleTimeString()}까지 유지` :
                            '🔄 활성 상태'
                          }
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                    메모리에 로드된 모델이 없습니다
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium text-gray-800">모델별 메모리 효율성</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded">
                    <span className="text-sm">qwen2.5:0.5b</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">397MB • 빠름 🚀</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <span className="text-sm">llama3.1:8b</span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">4.9GB • 무거움 ⚡</span>
                  </div>
                </div>
                
                <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                  💡 <strong>팁:</strong> 작은 모델은 30분, 큰 모델은 10분간 메모리 유지
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OpenAI API Key Settings */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Key className="w-5 h-5 mr-2" />
            OpenAI API 설정
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              ChatGPT를 사용하려면 OpenAI API 키가 필요합니다. 
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" 
                 className="text-blue-600 hover:text-blue-700 underline ml-1">
                여기서 발급받을 수 있습니다
              </a>
            </p>
            
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={saveOpenaiApiKey}
                disabled={savingApiKey || !openaiApiKey.trim()}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {savingApiKey ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    저장 중...
                  </>
                ) : (
                  '저장'
                )}
              </button>
            </div>
            
            {openaiApiKey && (
              <div className="flex items-center text-green-600 text-sm">
                <Check className="w-4 h-4 mr-1" />
                API 키가 설정되었습니다
              </div>
            )}
          </div>
        </div>

        {/* Current Model Selection */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Settings2 className="w-5 h-5 mr-2" />
            현재 사용가능한 모델
            {switchingModel && (
              <div className="ml-2 flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-1"></div>
                <span className="text-sm">전환 중...</span>
              </div>
            )}
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
                <button
                  onClick={() => deleteModel(model.id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  title="모델 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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

                      <div className="ml-4 flex items-center space-x-2">
                        {model.installed ? (
                          <>
                            <div className="flex items-center text-green-600">
                              <Check className="w-4 h-4 mr-1" />
                              <span className="text-sm">설치됨</span>
                            </div>
                            <button
                              onClick={() => deleteModel(model.id)}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                              title="모델 삭제"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
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

                        <div className="ml-3 flex items-center space-x-1">
                          {model.installed ? (
                            <>
                              <div className="flex items-center text-green-600">
                                <Check className="w-3 h-3 mr-1" />
                                <span className="text-xs">설치됨</span>
                              </div>
                              <button
                                onClick={() => deleteModel(model.id)}
                                className="p-0.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                title="모델 삭제"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </>
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