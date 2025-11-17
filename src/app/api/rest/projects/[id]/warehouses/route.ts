import { NextRequest, NextResponse } from 'next/server'

import { createTRPCContext } from '@src/server/api/trpc'
import { verifyProjectAccess } from '@src/server/api/rest/helpers'

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

    const project = await verifyProjectAccess(
      id,
      user,
      ctx.isGlobalApiKey,
      ctx.isAdminApiKey,
      {
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
      }
    )

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const warehouses = (project as any).warehouses.map((warehouse: any) => ({
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

    const project = await verifyProjectAccess(
      id,
      user,
      ctx.isGlobalApiKey,
      ctx.isAdminApiKey
    )

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