import { NextResponse } from 'next/server'
import { getModelRecommendations, getModelRecommendationsBySize, LANGUAGES } from '../../../../lib/model-recommendations'

export async function POST(request: Request) {
  try {
    const { nativeLanguage, targetLanguage, filterType = 'recommendation' } = await request.json()

    if (!nativeLanguage || !targetLanguage) {
      return NextResponse.json(
        { error: '주언어와 배울언어를 모두 선택해주세요' },
        { status: 400 }
      )
    }

    let recommendations
    if (filterType === 'size') {
      recommendations = getModelRecommendationsBySize(nativeLanguage, targetLanguage).slice(0, 5)
    } else {
      recommendations = getModelRecommendations(nativeLanguage, targetLanguage).slice(0, 5)
    }

    return NextResponse.json({
      nativeLanguage: LANGUAGES[nativeLanguage as keyof typeof LANGUAGES],
      targetLanguage: LANGUAGES[targetLanguage as keyof typeof LANGUAGES],
      recommendations,
      filterType,
    })

  } catch (error) {
    console.error('언어 추천 오류:', error)
    return NextResponse.json(
      { error: '추천 시스템 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}