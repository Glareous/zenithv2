import { NextRequest, NextResponse } from 'next/server'

import { createTRPCContext } from '@/server/api/trpc'

export async function POST(
  req: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    // 1. Authenticate with API key or session
    const ctx = await createTRPCContext({ headers: req.headers })
    const user = ctx.session?.user || ctx.apiKeyUser

    if (!user) {
      return NextResponse.json(
        {
          error: {
            message: 'Unauthorized - API key required',
            code: 'UNAUTHORIZED',
          },
        },
        { status: 401 }
      )
    }

    // 2. Get agent ID from URL
    const { agentId } = await params

    // 3. Verify agent exists and user has access
    const agent = await ctx.db.projectAgent.findFirst({
      where: {
        id: agentId,
        project: {
          organization: {
            members: {
              some: { userId: user.id },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
    })

    if (!agent) {
      return NextResponse.json(
        {
          error: {
            message: 'Agent not found or access denied',
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      )
    }

    // 4. TODO: Implement webhook logic here
    // For now, just acknowledge receipt
    return NextResponse.json({
      success: true,
      message: 'Webhook endpoint is active but not yet implemented',
      agentId: agent.id,
      agentName: agent.name,
      agentType: agent.type,
      timestamp: new Date().toISOString(),
      status: '...',
    })
  } catch (error) {
    console.error('Error in /api/rest/webhook/[agentId] POST:', error)
    return NextResponse.json(
      {
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_SERVER_ERROR',
        },
      },
      { status: 500 }
    )
  }
}
