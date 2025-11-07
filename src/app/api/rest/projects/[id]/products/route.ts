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
            products: {
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
                products: {
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
            products: {
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
          products: {
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
            orderBy: { createdAt: 'desc' },
          },
        },
      })
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const products = project.products.map((product) => ({
      ...product,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }))

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error in /api/rest/projects/[id]/products GET:', error)
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
    const { name, description, price, imageUrl, categoryId } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
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

    // Verify category belongs to project if provided
    if (categoryId) {
      const category = await ctx.db.projectCategory.findFirst({
        where: {
          id: categoryId,
          projectId: id,
        },
      })

      if (!category) {
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
      }
    }

    const product = await ctx.db.projectProduct.create({
      data: {
        name: name.trim(),
        description,
        price,
        imageUrl,
        categories: {
          create: {
            categoryId: categoryId,
            // Remove projectId and createdById - they don't exist in ProductCategory
          },
        },
        projectId: id,
        createdById: user.id,
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
      },
    })

    return NextResponse.json(
      {
        ...product,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in /api/rest/projects/[id]/products POST:', error)
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
    const {
      productId,
      name,
      description,
      price,
      imageUrl,
      isActive,
      categoryId,
    } = body

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    if (
      name !== undefined &&
      (typeof name !== 'string' || name.trim().length === 0)
    ) {
      return NextResponse.json(
        { error: 'Name must be a non-empty string' },
        { status: 400 }
      )
    }

    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
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
            products: {
              where: { id: productId },
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
                products: {
                  where: { id: productId },
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
            products: {
              where: { id: productId },
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
          products: {
            where: { id: productId },
          },
        },
      })
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if product exists in this project
    const existingProduct = project.products[0]
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found in this project' },
        { status: 404 }
      )
    }

    // Verify category belongs to project if provided
    if (categoryId) {
      const category = await ctx.db.projectCategory.findFirst({
        where: {
          id: categoryId,
          projectId: id,
        },
      })

      if (!category) {
        return NextResponse.json(
          { error: 'Invalid category for this project' },
          { status: 400 }
        )
      }
    }

    // Update the product
    const updatedProduct = await ctx.db.projectProduct.update({
      where: { id: productId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isActive !== undefined && { isActive }),
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
      },
    })

    // Update category if provided
    if (categoryId) {
      // Remove existing categories
      await ctx.db.projectProductCategory.deleteMany({
        where: { productId },
      })

      // Add new category
      await ctx.db.projectProductCategory.create({
        data: {
          productId,
          categoryId,
        },
      })

      // Refetch with updated categories
      const productWithUpdatedCategories =
        await ctx.db.projectProduct.findUnique({
          where: { id: productId },
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
        ...productWithUpdatedCategories,
        createdAt: productWithUpdatedCategories!.createdAt.toISOString(),
        updatedAt: productWithUpdatedCategories!.updatedAt.toISOString(),
      })
    }

    return NextResponse.json({
      ...updatedProduct,
      createdAt: updatedProduct.createdAt.toISOString(),
      updatedAt: updatedProduct.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('Error in /api/rest/projects/[id]/products PUT:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
