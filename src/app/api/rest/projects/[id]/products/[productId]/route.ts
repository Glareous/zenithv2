import { NextRequest, NextResponse } from 'next/server'

import { createTRPCContext } from '@src/server/api/trpc'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; productId: string } }
) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers })
    const user = ctx.session?.user || ctx.apiKeyUser

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, productId } = params

    let product

    if (ctx.isAdminApiKey) {
      // Admin API key: Solo productos de proyectos donde es OWNER o ProjectMember
      const [ownedProject, memberProject, createdProject] = await Promise.all([
        // Proyectos donde es OWNER de la organización
        ctx.db.projectProduct.findFirst({
          where: {
            id: productId,
            projectId: id,
            project: {
              organization: {
                ownerId: user.id,
              },
            },
          },
          include: {
            categories: {
              include: {
                category: true,
              },
            },
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            _count: {
              select: {
                stockMovements: true,
              },
            },
          },
        }),
        // Proyectos específicos donde es ProjectMember
        ctx.db.projectProduct.findFirst({
          where: {
            id: productId,
            projectId: id,
            project: {
              id: {
                in: await ctx.db.projectMember
                  .findMany({
                    where: { userId: user.id },
                    select: { projectId: true },
                  })
                  .then((members) => members.map((m) => m.projectId)),
              },
            },
          },
          include: {
            categories: {
              include: {
                category: true,
              },
            },
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            _count: {
              select: {
                stockMovements: true,
              },
            },
          },
        }),
        // Proyectos que creó (incluso en otras organizaciones)
        ctx.db.projectProduct.findFirst({
          where: {
            id: productId,
            projectId: id,
            project: {
              createdById: user.id,
            },
          },
          include: {
            categories: {
              include: {
                category: true,
              },
            },
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            _count: {
              select: {
                stockMovements: true,
              },
            },
          },
        }),
      ])

      product = ownedProject || memberProject || createdProject
    } else {
      // Regular access - solo productos de proyectos propios (OWNER)
      product = await ctx.db.projectProduct.findFirst({
        where: {
          id: productId,
          projectId: id,
          project: {
            organization: {
              ownerId: user.id,
            },
          },
        },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              stockMovements: true,
            },
          },
        },
      })
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...product,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error(
      'Error in /api/rest/projects/[id]/products/[productId] GET:',
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
  { params }: { params: { id: string; productId: string } }
) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers })
    const user = ctx.session?.user || ctx.apiKeyUser

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, productId } = params
    const body = await req.json()
    const { name, description, price, imageUrl, categoryId, isActive } = body

    let product

    if (ctx.isAdminApiKey) {
      // Admin API key: Solo productos de proyectos donde es OWNER o ProjectMember
      const [ownedProject, memberProject, createdProject] = await Promise.all([
        // Proyectos donde es OWNER de la organización
        ctx.db.projectProduct.findFirst({
          where: {
            id: productId,
            projectId: id,
            project: {
              organization: {
                ownerId: user.id,
              },
            },
          },
        }),
        // Proyectos específicos donde es ProjectMember
        ctx.db.projectProduct.findFirst({
          where: {
            id: productId,
            projectId: id,
            project: {
              id: {
                in: await ctx.db.projectMember
                  .findMany({
                    where: { userId: user.id },
                    select: { projectId: true },
                  })
                  .then((members) => members.map((m) => m.projectId)),
              },
            },
          },
        }),
        // Proyectos que creó (incluso en otras organizaciones)
        ctx.db.projectProduct.findFirst({
          where: {
            id: productId,
            projectId: id,
            project: {
              createdById: user.id,
            },
          },
        }),
      ])

      product = ownedProject || memberProject || createdProject
    } else {
      // Regular access - solo productos de proyectos propios (OWNER)
      product = await ctx.db.projectProduct.findFirst({
        where: {
          id: productId,
          projectId: id,
          project: {
            organization: {
              ownerId: user.id,
            },
          },
        },
      })
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
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
    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0) {
        return NextResponse.json(
          { error: 'Price must be a positive number' },
          { status: 400 }
        )
      }
      updateData.price = price
    }
    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl
    }
    if (isActive !== undefined) {
      if (typeof isActive !== 'boolean') {
        return NextResponse.json(
          { error: 'isActive must be a boolean' },
          { status: 400 }
        )
      }
      updateData.isActive = isActive
    }
    if (categoryId !== undefined) {
      if (categoryId) {
        const category = await ctx.db.projectCategory.findFirst({
          where: {
            id: categoryId,
            projectId: id,
          },
        })
        if (!category) {
          return NextResponse.json(
            { error: 'Invalid category' },
            { status: 400 }
          )
        }
      }
      updateData.categoryId = categoryId
    }

    const updatedProduct = await ctx.db.projectProduct.update({
      where: { id: productId },
      data: updateData,
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return NextResponse.json({
      ...updatedProduct,
      createdAt: updatedProduct.createdAt.toISOString(),
      updatedAt: updatedProduct.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('Error in PUT:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; productId: string } }
) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers })
    const user = ctx.session?.user || ctx.apiKeyUser

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, productId } = params

    let product

    if (ctx.isAdminApiKey) {
      // Admin API key: Solo productos de proyectos donde es OWNER o ProjectMember
      const [ownedProject, memberProject, createdProject] = await Promise.all([
        // Proyectos donde es OWNER de la organización
        ctx.db.projectProduct.findFirst({
          where: {
            id: productId,
            projectId: id,
            project: {
              organization: {
                ownerId: user.id,
              },
            },
          },
        }),
        // Proyectos específicos donde es ProjectMember
        ctx.db.projectProduct.findFirst({
          where: {
            id: productId,
            projectId: id,
            project: {
              id: {
                in: await ctx.db.projectMember
                  .findMany({
                    where: { userId: user.id },
                    select: { projectId: true },
                  })
                  .then((members) => members.map((m) => m.projectId)),
              },
            },
          },
        }),
        // Proyectos que creó (incluso en otras organizaciones)
        ctx.db.projectProduct.findFirst({
          where: {
            id: productId,
            projectId: id,
            project: {
              createdById: user.id,
            },
          },
        }),
      ])

      product = ownedProject || memberProject || createdProject
    } else {
      // Regular access - solo productos de proyectos propios (OWNER)
      product = await ctx.db.projectProduct.findFirst({
        where: {
          id: productId,
          projectId: id,
          project: {
            organization: {
              ownerId: user.id,
            },
          },
        },
      })
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    await ctx.db.projectProduct.delete({
      where: { id: productId },
    })

    return NextResponse.json(null, { status: 204 })
  } catch (error) {
    console.error('Error in DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
