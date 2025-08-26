import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../[...nextauth]/route'
import { prisma } from '../../../../../lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    // 현재 세션 토큰 가져오기
    const cookies = request.headers.get('cookie') || ''
    const sessionTokenMatch = cookies.match(/next-auth\.session-token=([^;]+)/)
    
    if (!sessionTokenMatch) {
      return NextResponse.json(
        { error: '세션 토큰을 찾을 수 없습니다' },
        { status: 400 }
      )
    }

    const sessionToken = sessionTokenMatch[1]

    // 세션 만료 시간을 현재 시간 + 1시간으로 업데이트
    const newExpires = new Date(Date.now() + 60 * 60 * 1000) // 1시간 후

    await prisma.session.updateMany({
      where: {
        sessionToken: sessionToken,
        userId: session.user.id
      },
      data: {
        expires: newExpires
      }
    })

    return NextResponse.json({
      success: true,
      newExpires: newExpires.toISOString(),
      message: '세션이 1시간 연장되었습니다'
    })

  } catch (error) {
    console.error('세션 연장 오류:', error)
    return NextResponse.json(
      { error: '세션 연장 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}