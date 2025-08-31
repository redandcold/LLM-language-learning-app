import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '../../../../../lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { openaiApiKey: true }
    })

    return NextResponse.json({ 
      apiKey: user?.openaiApiKey ? '***' + user.openaiApiKey.slice(-4) : null 
    })
  } catch (error) {
    console.error('Failed to get OpenAI API key:', error)
    return NextResponse.json({ error: 'Failed to get API key' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { apiKey } = await request.json()

    if (!apiKey || !apiKey.startsWith('sk-')) {
      return NextResponse.json({ error: 'Invalid API key format' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { openaiApiKey: apiKey }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save OpenAI API key:', error)
    return NextResponse.json({ error: 'Failed to save API key' }, { status: 500 })
  }
}