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

    // If admin API key, can access any project
    if (ctx.isAdminApiKey) {
      project = await ctx.db.project.findUnique({
        where: { id },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              agents: true,
              products: true,
              customers: true,
              orders: true,
            },
          },
        },
      })
    } else {
      // Regular access - check organization membership
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
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              agents: true,
              products: true,
              customers: true,
              orders: true,
            },
          },
        },
      })
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...project,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('Error in /api/rest/projects/[id] GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const { name, description, logoUrl, status } = body

    let project

    if (ctx.isAdminApiKey) {
      // Admin API key: Puede acceder a proyectos donde es OWNER, ProjectMember, O creador
      const [ownedProject, memberProject, createdProject] = await Promise.all([
        // Proyectos donde es OWNER de la organización
        ctx.db.project.findFirst({
          where: {
            id,
            organization: {
              ownerId: user.id,
            },
          },
        }),
        // Proyectos específicos donde es ProjectMember
        ctx.db.projectMember.findFirst({
          where: {
            projectId: id,
            userId: user.id,
          },
          include: {
            project: true,
          },
        }),
        // Proyectos que creó (incluso en otras organizaciones)
        ctx.db.project.findFirst({
          where: {
            id,
            createdById: user.id,
          },
        }),
      ])

      project = ownedProject || memberProject?.project || createdProject
    } else {
      // Regular access - check organization membership
      project = await ctx.db.project.findFirst({
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
    }

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or insufficient permissions' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Name must be a non-empty string' },
          { status: 400 }
        )
      }
      updateData.name = name.trim()
    }
    if (description !== undefined) {
      updateData.description = description
    }
    if (logoUrl !== undefined) {
      updateData.logoUrl = logoUrl
    }
    if (status !== undefined) {
      if (!['ACTIVE', 'CREATED', 'COMPLETED'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      updateData.status = status
    }

    const updatedProject = await ctx.db.project.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      ...updatedProject,
      createdAt: updatedProject.createdAt.toISOString(),
      updatedAt: updatedProject.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('Error in /api/rest/projects/[id] PUT:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    if (ctx.isAdminApiKey) {
      // Admin API key: Puede eliminar proyectos donde es OWNER, ProjectMember, O creador
      const [ownedProject, memberProject, createdProject] = await Promise.all([
        // Proyectos donde es OWNER de la organización
        ctx.db.project.findFirst({
          where: {
            id,
            organization: {
              ownerId: user.id,
            },
          },
        }),
        // Proyectos específicos donde es ProjectMember
        ctx.db.projectMember.findFirst({
          where: {
            projectId: id,
            userId: user.id,
          },
          include: {
            project: true,
          },
        }),
        // Proyectos que creó (incluso en otras organizaciones)
        ctx.db.project.findFirst({
          where: {
            id,
            createdById: user.id,
          },
        }),
      ])

      project = ownedProject || memberProject?.project || createdProject
    } else {
      // Regular access - check organization membership
      project = await ctx.db.project.findFirst({
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
    }

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or insufficient permissions' },
        { status: 404 }
      )
    }

    await ctx.db.project.delete({
      where: { id },
    })

    return NextResponse.json(null, { status: 204 })
  } catch (error) {
    console.error('Error in /api/rest/projects/[id] DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
