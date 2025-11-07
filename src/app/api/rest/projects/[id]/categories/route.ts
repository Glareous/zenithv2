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

    if (ctx.isAdminApiKey) {
      // Admin API key: Solo proyectos donde es OWNER o ProjectMember
      const [ownedProject, memberProject, createdProject] = await Promise.all([
        // Proyectos donde es OWNER de la organización
        ctx.db.project.findFirst({
          where: {
            id,
            organization: {
              ownerId: user.id,
            },
          },
          include: {
            categories: {
              include: {
                _count: {
                  select: {
                    productRelations: true,
                    serviceRelations: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
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
            project: {
              include: {
                categories: {
                  include: {
                    _count: {
                      select: {
                        productRelations: true,
                        serviceRelations: true,
                      },
                    },
                  },
                  orderBy: { createdAt: 'desc' },
                },
              },
            },
          },
        }),
        // Proyectos que creó (incluso en otras organizaciones)
        ctx.db.project.findFirst({
          where: {
            id,
            createdById: user.id,
          },
          include: {
            categories: {
              include: {
                _count: {
                  select: {
                    productRelations: true,
                    serviceRelations: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        }),
      ])

      project = ownedProject || memberProject?.project || createdProject
    } else {
      // Regular access - solo proyectos propios (OWNER)
      project = await ctx.db.project.findFirst({
        where: {
          id,
          organization: {
            ownerId: user.id,
          },
        },
        include: {
          categories: {
            include: {
              _count: {
                select: {
                  productRelations: true,
                  serviceRelations: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      })
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const categories = project.categories.map((category) => ({
      ...category,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    }))

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error in /api/rest/projects/[id]/categories GET:', error)
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
    const { name, description, type, isActive } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (!type || !['PRODUCT', 'SERVICE'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be PRODUCT or SERVICE' },
        { status: 400 }
      )
    }

    let project

    if (ctx.isAdminApiKey) {
      // Admin API key: Solo proyectos donde es OWNER o ProjectMember
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
      // Regular access - solo proyectos propios (OWNER)
      project = await ctx.db.project.findFirst({
        where: {
          id,
          organization: {
            ownerId: user.id,
          },
        },
      })
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const category = await ctx.db.projectCategory.create({
      data: {
        name: name.trim(),
        description,
        type,
        isActive: isActive !== undefined ? isActive : true,
        projectId: id,
        createdById: user.id,
      },
      include: {
        _count: {
          select: {
            productRelations: true,
            serviceRelations: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        ...category,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in /api/rest/projects/[id]/categories POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}