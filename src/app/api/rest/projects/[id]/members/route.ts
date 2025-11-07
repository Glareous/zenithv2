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

    // If admin API key, can access any project's members
    if (ctx.isAdminApiKey) {
      project = await ctx.db.project.findUnique({
        where: { id },
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
      })
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const members = await ctx.db.projectMember.findMany({
      where: {
        projectId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    })

    return NextResponse.json(
      members.map((member) => ({
        id: member.id,
        role: member.role,
        createdAt: member.joinedAt.toISOString(),
        updatedAt: member.joinedAt.toISOString(),
        user: member.user,
      }))
    )
  } catch (error) {
    console.error('Error in /api/rest/projects/[id]/members GET:', error)
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
    const { userId, role = 'MEMBER' } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    if (!['ADMIN', 'MEMBER'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Verify user has admin access to the project
    const project = await ctx.db.project.findFirst({
      where: {
        id,
        organization: {
          members: {
            some: {
              userId: user.id,
              role: { in: ['OWNER', 'ADMIN'] },
            },
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or insufficient permissions' },
        { status: 404 }
      )
    }

    // Check if user exists and is part of the organization
    const targetUser = await ctx.db.user.findFirst({
      where: {
        id: userId,
        organizationMemberships: {
          some: {
            organizationId: project.organizationId,
          },
        },
      },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found or not part of organization' },
        { status: 404 }
      )
    }

    // Check if user is already a project member
    const existingMember = await ctx.db.projectMember.findFirst({
      where: {
        projectId: id,
        userId: userId,
      },
    })

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a project member' },
        { status: 400 }
      )
    }

    const newMember = await ctx.db.projectMember.create({
      data: {
        projectId: id,
        userId: userId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        id: newMember.id,
        role: newMember.role,
        createdAt: newMember.joinedAt.toISOString(),
        updatedAt: newMember.joinedAt.toISOString(),
        user: newMember.user,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in /api/rest/projects/[id]/members POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
