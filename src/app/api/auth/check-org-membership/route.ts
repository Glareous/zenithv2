import { db } from '@src/server/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get('orgId')
    const userId = searchParams.get('userId')

    if (!orgId || !userId) {
      return NextResponse.json(
        { isMember: false, error: 'Missing parameters' },
        { status: 400 }
      )
    }

    const member = await db.organizationMember.findFirst({
      where: {
        organizationId: orgId,
        userId: userId,
      },
    })

    return NextResponse.json({
      isMember: !!member,
      role: member?.role,
    })
  } catch (error) {
    console.error('Check org membership error:', error)
    return NextResponse.json(
      { isMember: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
