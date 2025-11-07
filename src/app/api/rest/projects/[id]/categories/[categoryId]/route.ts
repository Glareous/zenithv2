import { NextRequest, NextResponse } from 'next/server'

import { createTRPCContext } from '@src/server/api/trpc'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; categoryId: string } }
) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers })
    const user = ctx.session?.user || ctx.apiKeyUser

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, categoryId } = await params

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
              where: { id: categoryId },
              include: {
                _count: {
                  select: {
                    productRelations: true,
                    serviceRelations: true,
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
                categories: {
                  where: { id: categoryId },
                  include: {
                    _count: {
                      select: {
                        productRelations: true,
                        serviceRelations: true,
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
            categories: {
              where: { id: categoryId },
              include: {
                _count: {
                  select: {
                    productRelations: true,
                    serviceRelations: true,
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
          categories: {
            where: { id: categoryId },
            include: {
              _count: {
                select: {
                  productRelations: true,
                  serviceRelations: true,
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

    const category = project.categories[0]
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found in this project' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...category,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error(
      'Error in /api/rest/projects/[id]/categories/[categoryId] GET:',
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
  { params }: { params: { id: string; categoryId: string } }
) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers })
    const user = ctx.session?.user || ctx.apiKeyUser

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, categoryId } = await params
    const body = await req.json()
    const { name, description, type, isActive } = body

    if (
      name !== undefined &&
      (typeof name !== 'string' || name.trim().length === 0)
    ) {
      return NextResponse.json(
        { error: 'Name must be a non-empty string' },
        { status: 400 }
      )
    }

    if (type !== undefined && !['PRODUCT', 'SERVICE'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be PRODUCT or SERVICE' },
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
            categories: {
              where: { id: categoryId },
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
                  where: { id: categoryId },
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
              where: { id: categoryId },
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
            where: { id: categoryId },
          },
        },
      })
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if category exists in this project
    const existingCategory = project.categories[0]
    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found in this project' },
        { status: 404 }
      )
    }

    // Update the category
    const updatedCategory = await ctx.db.projectCategory.update({
      where: { id: categoryId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(isActive !== undefined && { isActive }),
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

    return NextResponse.json({
      ...updatedCategory,
      createdAt: updatedCategory.createdAt.toISOString(),
      updatedAt: updatedCategory.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error(
      'Error in /api/rest/projects/[id]/categories/[categoryId] PUT:',
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
  { params }: { params: { id: string; categoryId: string } }
) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers })
    const user = ctx.session?.user || ctx.apiKeyUser

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, categoryId } = await params

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
              where: { id: categoryId },
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
                  where: { id: categoryId },
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
              where: { id: categoryId },
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
            where: { id: categoryId },
          },
        },
      })
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if category exists in this project
    const category = project.categories[0]
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found in this project' },
        { status: 404 }
      )
    }

    // Prevent deletion of default categories
    if (category.isDefault) {
      return NextResponse.json(
        { error: 'Cannot delete default categories' },
        { status: 400 }
      )
    }

    // Check if category has products or services
    const [productsCount, servicesCount] = await Promise.all([
      ctx.db.projectProductCategory.count({
        where: { categoryId },
      }),
      ctx.db.projectServiceCategory.count({
        where: { categoryId },
      }),
    ])

    if (productsCount > 0 || servicesCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category that has ${productsCount > 0 ? 'products' : 'services'}. Please remove all items first.`,
        },
        { status: 400 }
      )
    }

    await ctx.db.projectCategory.delete({
      where: { id: categoryId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(
      'Error in /api/rest/projects/[id]/categories/[categoryId] DELETE:',
      error
    )
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}