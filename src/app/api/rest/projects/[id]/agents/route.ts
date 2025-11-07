import { NextRequest, NextResponse } from 'next/server'

import { createTRPCContext } from '@src/server/api/trpc'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers })
    const user = ctx.session?.user || ctx.apiKeyUser

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    let project

    // If admin API key, can access any project's agents
    if (ctx.isAdminApiKey) {
      project = await ctx.db.project.findUnique({
        where: { id },
        include: {
          agents: {
            // Solo incluir campos básicos, no la relación project
            select: {
              id: true,
              name: true,
              type: true,
              isActive: true,
              systemInstructions: true,
              createdAt: true,
              updatedAt: true,
              // NO incluir: project: true
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      })
    } else {
      // Regular access - verify user has access to the project
      project = await ctx.db.project.findFirst({
        where: {
          id,
          organization: {
            members: {
              some: { userId: user.id },
            },
          },
        },
        include: {
          agents: {
            // Solo incluir campos básicos, no la relación project
            select: {
              id: true,
              name: true,
              type: true,
              isActive: true,
              systemInstructions: true,
              createdAt: true,
              updatedAt: true,
              // NO incluir: project: true
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      })
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const agents = project.agents.map((agent) => ({
      ...agent,
      createdAt: agent.createdAt.toISOString(),
      updatedAt: agent.updatedAt.toISOString(),
    }))

    return NextResponse.json(agents)
  } catch (error) {
    console.error('Error in /api/rest/projects/[id]/agents GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers })
    const user = ctx.session?.user || ctx.apiKeyUser

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { name, type, systemInstructions } = body

    if (
      !type ||
      !['SALES', 'NFO', 'CUSTOMER_SERVICE', 'LOGISTICS', 'CRM'].includes(type)
    ) {
      return NextResponse.json(
        { error: 'Valid type is required' },
        { status: 400 }
      )
    }

    // Verify user has access to the project
    const project = await ctx.db.project.findFirst({
      where: {
        id,
        organization: {
          members: {
            some: { userId: user.id },
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const agent = await ctx.db.projectAgent.create({
      data: {
        name,
        type,
        systemInstructions,
        projectId: id,
      },
    })

    return NextResponse.json(
      {
        ...agent,
        createdAt: agent.createdAt.toISOString(),
        updatedAt: agent.updatedAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in /api/rest/projects/[id]/agents POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
