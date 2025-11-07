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
            warehouses: {
              include: {
                _count: {
                  select: {
                    products: true,
                  },
                },
              },
              orderBy: { warehouseId: 'asc' },
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
                warehouses: {
                  include: {
                    _count: {
                      select: {
                        products: true,
                      },
                    },
                  },
                  orderBy: { warehouseId: 'asc' },
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
            warehouses: {
              include: {
                _count: {
                  select: {
                    products: true,
                  },
                },
              },
              orderBy: { warehouseId: 'asc' },
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
          warehouses: {
            include: {
              _count: {
                select: {
                  products: true,
                },
              },
            },
            orderBy: { warehouseId: 'asc' },
          },
        },
      })
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const warehouses = project.warehouses.map((warehouse) => ({
      ...warehouse,
      createdAt: warehouse.createdAt.toISOString(),
      updatedAt: warehouse.updatedAt.toISOString(),
    }))

    return NextResponse.json(warehouses)
  } catch (error) {
    console.error('Error in /api/rest/projects/[id]/warehouses GET:', error)
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
    const { name, description, isActive } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
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

    // Get the highest warehouseId for this project to auto-increment
    const lastWarehouse = await ctx.db.projectProductWarehouse.findFirst({
      where: { projectId: id },
      orderBy: { warehouseId: 'desc' },
      select: { warehouseId: true },
    })

    // Generate next warehouseId (a001, a002, a003, etc.)
    let nextWarehouseId = 'a001'
    if (lastWarehouse) {
      const lastNumber = parseInt(lastWarehouse.warehouseId.substring(1))
      const nextNumber = lastNumber + 1
      nextWarehouseId = `a${nextNumber.toString().padStart(3, '0')}`
    }

    const warehouse = await ctx.db.projectProductWarehouse.create({
      data: {
        warehouseId: nextWarehouseId,
        name: name.trim(),
        description,
        isActive: isActive !== undefined ? isActive : true,
        projectId: id,
        createdById: user.id,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        ...warehouse,
        createdAt: warehouse.createdAt.toISOString(),
        updatedAt: warehouse.updatedAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in /api/rest/projects/[id]/warehouses POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}