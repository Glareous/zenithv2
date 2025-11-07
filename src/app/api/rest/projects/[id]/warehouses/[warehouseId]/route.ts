import { NextRequest, NextResponse } from 'next/server'

import { createTRPCContext } from '@src/server/api/trpc'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; warehouseId: string } }
) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers })
    const user = ctx.session?.user || ctx.apiKeyUser

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, warehouseId } = await params

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
              where: { id: warehouseId },
              include: {
                _count: {
                  select: {
                    products: true,
                  },
                },
              },
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
                  where: { id: warehouseId },
                  include: {
                    _count: {
                      select: {
                        products: true,
                      },
                    },
                  },
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
              where: { id: warehouseId },
              include: {
                _count: {
                  select: {
                    products: true,
                  },
                },
              },
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
            where: { id: warehouseId },
            include: {
              _count: {
                select: {
                  products: true,
                },
              },
            },
          },
        },
      })
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const warehouse = project.warehouses[0]
    if (!warehouse) {
      return NextResponse.json(
        { error: 'Warehouse not found in this project' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...warehouse,
      createdAt: warehouse.createdAt.toISOString(),
      updatedAt: warehouse.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error(
      'Error in /api/rest/projects/[id]/warehouses/[warehouseId] GET:',
      error
    )
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; warehouseId: string } }
) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers })
    const user = ctx.session?.user || ctx.apiKeyUser

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, warehouseId } = await params
    const body = await req.json()
    const { name, description, isActive } = body

    if (
      name !== undefined &&
      (typeof name !== 'string' || name.trim().length === 0)
    ) {
      return NextResponse.json(
        { error: 'Name must be a non-empty string' },
        { status: 400 }
      )
    }

    if (isActive !== undefined && typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be a boolean' },
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
          include: {
            warehouses: {
              where: { id: warehouseId },
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
                  where: { id: warehouseId },
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
              where: { id: warehouseId },
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
            where: { id: warehouseId },
          },
        },
      })
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if warehouse exists in this project
    const existingWarehouse = project.warehouses[0]
    if (!existingWarehouse) {
      return NextResponse.json(
        { error: 'Warehouse not found in this project' },
        { status: 404 }
      )
    }

    // Update the warehouse
    const updatedWarehouse = await ctx.db.projectProductWarehouse.update({
      where: { id: warehouseId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    return NextResponse.json({
      ...updatedWarehouse,
      createdAt: updatedWarehouse.createdAt.toISOString(),
      updatedAt: updatedWarehouse.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error(
      'Error in /api/rest/projects/[id]/warehouses/[warehouseId] PUT:',
      error
    )
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; warehouseId: string } }
) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers })
    const user = ctx.session?.user || ctx.apiKeyUser

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, warehouseId } = await params

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
              where: { id: warehouseId },
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
                  where: { id: warehouseId },
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
              where: { id: warehouseId },
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
            where: { id: warehouseId },
          },
        },
      })
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if warehouse exists in this project
    const warehouse = project.warehouses[0]
    if (!warehouse) {
      return NextResponse.json(
        { error: 'Warehouse not found in this project' },
        { status: 404 }
      )
    }

    // Prevent deletion of default warehouses
    if (warehouse.isDefault) {
      return NextResponse.json(
        { error: 'Cannot delete default warehouses' },
        { status: 400 }
      )
    }

    // Check if warehouse has products
    const productsCount = await ctx.db.productWarehouse.count({
      where: { warehouseId },
    })

    if (productsCount > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete warehouse that has products. Please remove all products first.',
        },
        { status: 400 }
      )
    }

    await ctx.db.projectProductWarehouse.delete({
      where: { id: warehouseId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(
      'Error in /api/rest/projects/[id]/warehouses/[warehouseId] DELETE:',
      error
    )
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}