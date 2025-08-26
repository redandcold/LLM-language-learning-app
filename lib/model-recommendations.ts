// 언어별 모델 성능 데이터
export interface ModelPerformance {
  model: string
  displayName: string
  languages: {
    [key: string]: {
      score: number // 1-10 점수
      speciality?: string // 특화 분야
    }
  }
  size: string
  description: string
}

export const MODEL_PERFORMANCE: ModelPerformance[] = [
  {
    model: 'llama3.1:70b',
    displayName: 'Llama 3.1 70B',
    size: '40GB',
    description: '가장 강력한 다국어 모델',
    languages: {
      'ko': { score: 9, speciality: '자연스러운 한국어' },
      'ja': { score: 9, speciality: '정확한 일본어 문법' },
      'en': { score: 10 },
      'zh': { score: 8 },
      'es': { score: 8 },
      'fr': { score: 8 },
      'de': { score: 7 },
    }
  },
  {
    model: 'llama3.1:8b',
    displayName: 'Llama 3.1 8B',
    size: '4.7GB',
    description: '빠르고 효율적인 다국어 모델',
    languages: {
      'ko': { score: 8, speciality: '일상 대화' },
      'ja': { score: 8, speciality: '기본 회화' },
      'en': { score: 9 },
      'zh': { score: 7 },
      'es': { score: 7 },
      'fr': { score: 7 },
      'de': { score: 6 },
    }
  },
  {
    model: 'gemma2:27b',
    displayName: 'Gemma 2 27B',
    size: '16GB',
    description: 'Google의 균형잡힌 모델',
    languages: {
      'ko': { score: 7, speciality: '문법 설명' },
      'ja': { score: 6, speciality: '기초 학습' },
      'en': { score: 9 },
      'zh': { score: 6 },
      'es': { score: 7 },
      'fr': { score: 7 },
      'de': { score: 7 },
    }
  },
  {
    model: 'gemma2:9b',
    displayName: 'Gemma 2 9B',
    size: '5.4GB',
    description: '가벼운 Google 모델',
    languages: {
      'ko': { score: 6, speciality: '단어 설명' },
      'ja': { score: 5, speciality: '기초 단어' },
      'en': { score: 8 },
      'zh': { score: 5 },
      'es': { score: 6 },
      'fr': { score: 6 },
      'de': { score: 6 },
    }
  },
  {
    model: 'qwen2.5:72b',
    displayName: 'Qwen 2.5 72B',
    size: '41GB',
    description: '중국어 특화, 동아시아 언어 강함',
    languages: {
      'ko': { score: 8, speciality: '한자 어원 설명' },
      'ja': { score: 9, speciality: '한자 및 문법' },
      'en': { score: 8 },
      'zh': { score: 10, speciality: '중국어 완벽 지원' },
      'es': { score: 6 },
      'fr': { score: 6 },
      'de': { score: 5 },
    }
  },
  {
    model: 'qwen2.5:14b',
    displayName: 'Qwen 2.5 14B',
    size: '8.7GB',
    description: '동아시아 언어에 최적화',
    languages: {
      'ko': { score: 7, speciality: '문법 패턴' },
      'ja': { score: 8, speciality: '일본어 문법' },
      'en': { score: 7 },
      'zh': { score: 9, speciality: '중국어 회화' },
      'es': { score: 5 },
      'fr': { score: 5 },
      'de': { score: 4 },
    }
  },
  {
    model: 'mixtral:8x7b',
    displayName: 'Mixtral 8x7B',
    size: '26GB',
    description: '유럽 언어에 특화',
    languages: {
      'ko': { score: 5 },
      'ja': { score: 4 },
      'en': { score: 9 },
      'zh': { score: 4 },
      'es': { score: 9, speciality: '스페인어 완벽' },
      'fr': { score: 9, speciality: '프랑스어 완벽' },
      'de': { score: 8, speciality: '독일어 문법' },
    }
  }
]

export const LANGUAGES = {
  'ko': '한국어',
  'ja': '일본어', 
  'en': '영어',
  'zh': '중국어',
  'es': '스페인어',
  'fr': '프랑스어',
  'de': '독일어',
}

// 용량을 숫자로 변환하는 함수
function parseSizeToGB(sizeStr: string): number {
  const num = parseFloat(sizeStr.replace(/[^0-9.]/g, ''))
  if (sizeStr.includes('TB')) return num * 1000
  return num
}

export function getModelRecommendations(nativeLanguage: string, targetLanguage: string) {
  const recommendations = MODEL_PERFORMANCE
    .filter(model => 
      model.languages[nativeLanguage] && 
      model.languages[targetLanguage]
    )
    .map(model => ({
      ...model,
      score: (
        model.languages[nativeLanguage].score + 
        model.languages[targetLanguage].score
      ) / 2,
      nativeScore: model.languages[nativeLanguage].score,
      targetScore: model.languages[targetLanguage].score,
      nativeSpeciality: model.languages[nativeLanguage].speciality,
      targetSpeciality: model.languages[targetLanguage].speciality,
      sizeInGB: parseSizeToGB(model.size),
    }))
    .sort((a, b) => b.score - a.score)

  return recommendations
}

export function getModelRecommendationsBySize(nativeLanguage: string, targetLanguage: string) {
  const recommendations = getModelRecommendations(nativeLanguage, targetLanguage)
  
  // 점수 7점 이상인 모델들 중에서 용량 순으로 정렬
  return recommendations
    .filter(model => model.score >= 6) // 최소 6점 이상
    .sort((a, b) => a.sizeInGB - b.sizeInGB) // 용량 작은 순
}

export function getBestModelForLanguages(nativeLanguage: string, targetLanguage: string) {
  const recommendations = getModelRecommendations(nativeLanguage, targetLanguage)
  return recommendations[0] || null
}