import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '../../../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const chatRoomId = searchParams.get('chatRoomId')

    if (!chatRoomId) {
      return NextResponse.json({ error: 'Chat room ID required' }, { status: 400 })
    }

    // 채팅룸이 현재 사용자 소유인지 확인
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { 
        id: chatRoomId,
        userId: session.user.id
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!chatRoom) {
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 })
    }

    return NextResponse.json({
      chatRoom,
      languageSettings: {
        mainLanguage: chatRoom.mainLanguage,
        learningLanguage: chatRoom.learningLanguage
      },
      messages: chatRoom.messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: new Date(msg.createdAt).toISOString() // Date 객체로 변환 후 ISO 문자열로
      }))
    })

  } catch (error) {
    console.error('Chat history API error:', error)
    return NextResponse.json(
      { error: 'Failed to load chat history' },
      { status: 500 }
    )
  }
}

// 사용자의 모든 채팅룸 목록 가져오기
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const chatRooms = await prisma.chatRoom.findMany({
      where: { userId: session.user.id },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({
      chatRooms: chatRooms.map(room => ({
        id: room.id,
        title: room.title,
        updatedAt: room.updatedAt,
        lastMessage: room.messages[0]?.content || null
      }))
    })

  } catch (error) {
    console.error('Chat rooms API error:', error)
    return NextResponse.json(
      { error: 'Failed to load chat rooms' },
      { status: 500 }
    )
  }
}