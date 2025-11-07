import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const projectProductStockMovementRouter = createTRPCRouter({
  getByProductId: protectedProcedure
    .input(
      z.object({
        productId: z.string().min(1, 'Product ID is required'),
        projectId: z.string().min(1, 'Project ID is required'),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        createdAt: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { productId, projectId, page, limit, createdAt } = input
      const skip = (page - 1) * limit

      const membership = await ctx.db.projectMember.findFirst({
        where: {
          userId: ctx.session.user.id,
          projectId,
        },
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            'You do not have permission to view stock movements in this project',
        })
      }

      const product = await ctx.db.projectProduct.findFirst({
        where: {
          id: productId,
          projectId,
        },
      })

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found or does not belong to this project',
        })
      }

      const where: any = { productId }

      if (createdAt) {
        const startOfDay = new Date(createdAt)
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date(createdAt)
        endOfDay.setHours(23, 59, 59, 999)

        where.createdAt = {
          gte: startOfDay,
          lte: endOfDay,
        }
      }

      const [movements, totalCount] = await Promise.all([
        ctx.db.projectProductStockMovement.findMany({
          where,
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
            warehouse: {
              select: {
                id: true,
                warehouseId: true,
                name: true,
              },
            },
            order: {
              select: {
                id: true,
                orderId: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        ctx.db.projectProductStockMovement.count({ where }),
      ])

      return {
        movements,
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
})
