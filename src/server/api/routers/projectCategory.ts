import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const projectCategoryRouter = createTRPCRouter({
  // Create a new category (product or service)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        type: z.enum(['PRODUCT', 'SERVICE']),
        isActive: z.boolean().default(true),
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to create categories in this project
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: input.projectId,
          userId: ctx.session.user.id,
          role: { in: ['ADMIN'] },
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            "You don't have permission to create categories in this project",
        })
      }

      const category = await ctx.db.projectCategory.create({
        data: {
          name: input.name,
          description: input.description,
          type: input.type,
          isActive: input.isActive,
          projectId: input.projectId,
          createdById: ctx.session.user.id,
        },
      })

      return category
    }),

  // Get all categories for a project with pagination
  getAll: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        type: z.enum(['PRODUCT', 'SERVICE']).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { projectId, page, limit, search, type, isActive } = input
      const skip = (page - 1) * limit

      // Check if user has access to this project
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: input.projectId,
          userId: ctx.session.user.id,
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this project",
        })
      }

      // Build filters
      const where: any = { projectId }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      }

      if (type) {
        where.type = type
      }

      if (isActive !== undefined) {
        where.isActive = isActive
      }

      // Get paginated categories and total count
      const [categories, totalCount] = await Promise.all([
        ctx.db.projectCategory.findMany({
          where,
          include: {
            _count: {
              select: {
                productRelations: true,
                serviceRelations: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.db.projectCategory.count({ where }),
      ])

      return {
        categories,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPrevPage: page > 1,
        },
      }
    }),

  // Get category by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.projectCategory.findFirst({
        where: {
          id: input.id,
          project: {
            members: {
              some: {
                userId: ctx.session.user.id,
              },
            },
          },
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

      if (!category) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Category not found or you do not have access to it',
        })
      }

      return category
    }),

  // Update category
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        type: z.enum(['PRODUCT', 'SERVICE']).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to update this category
      const category = await ctx.db.projectCategory.findFirst({
        where: {
          id: input.id,
          project: {
            members: {
              some: {
                userId: ctx.session.user.id,
                role: { in: ['ADMIN'] },
              },
            },
          },
        },
      })

      if (!category) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have permission to update this category",
        })
      }

      const updatedCategory = await ctx.db.projectCategory.update({
        where: { id: input.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.description !== undefined && {
            description: input.description,
          }),
          ...(input.type && { type: input.type }),
          ...(input.isActive !== undefined && { isActive: input.isActive }),
        },
      })

      return updatedCategory
    }),

  // Delete category
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to delete this category
      const category = await ctx.db.projectCategory.findFirst({
        where: {
          id: input.id,
          project: {
            members: {
              some: {
                userId: ctx.session.user.id,
                role: { in: ['ADMIN'] },
              },
            },
          },
        },
      })

      if (!category) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have permission to delete this category",
        })
      }

      // Prevent deletion of default categories
      if (category.isDefault) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete default categories',
        })
      }

      // Check if category has products or services
      const [productsCount, servicesCount] = await Promise.all([
        ctx.db.projectProductCategory.count({
          where: { categoryId: input.id },
        }),
        ctx.db.projectServiceCategory.count({
          where: { categoryId: input.id },
        }),
      ])

      if (productsCount > 0 || servicesCount > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot delete category that has ${productsCount > 0 ? 'products' : 'services'}. Please remove all items first.`,
        })
      }

      await ctx.db.projectCategory.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
