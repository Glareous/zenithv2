import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

const createDealSchema = z.object({
  dealDate: z.date().optional(),
  isActive: z.boolean().default(true),
  isExpired: z.boolean().default(true),
  revenue: z.number().optional(),
  customerId: z.string().min(1, 'Customer ID is required'),
  projectId: z.string().min(1, 'ProjectId is required'),
})

const updateDealSchema = createDealSchema.extend({
  id: z.string().min(1, 'ID is required'),
  name: z.string().optional(),
})

export const projectDealRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createDealSchema)
    .mutation(async ({ ctx, input }) => {
      const { projectId, customerId, revenue, ...dealData } = input

      const membership = await ctx.db.projectMember.findFirst({
        where: {
          userId: ctx.session.user.id,
          projectId,
        },
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to create deals in this project',
        })
      }

      const customer = await ctx.db.projectCustomer.findFirst({
        where: {
          id: customerId,
          projectId,
        },
        include: {
          files: {
            where: {
              fileType: 'IMAGE',
            },
            take: 1,
          },
        },
      })

      if (!customer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Customer not found',
        })
      }

      const result = await ctx.db.$transaction(async (tx) => {
        const deal = await tx.projectDeal.create({
          data: {
            ...dealData,
            name: customer.name,
            customerId: customer.id,
            projectId,
            revenue,
            createdById: ctx.session.user.id,
          },
          include: {
            customer: {
              include: {
                files: true,
              },
            },
          },
        })

        const dealImage =
          customer.files?.[0]?.s3Url || '/assets/images/user-avatar.jpg'

        const dealMessage = await tx.projectDealMessage.create({
          data: {
            dealId: deal.id,
            dealName: deal.name,
            dealImage,
            status: 'ACTIVE',
          },
        })

        return { deal, dealMessage }
      })

      return result.deal
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, 'Project ID is required'),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        isActive: z.boolean().optional(),
        isExpired: z.boolean().optional(),
        selectedActiveStatuses: z.array(z.boolean()).optional(),
        selectedExpiredStatuses: z.array(z.boolean()).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const {
        projectId,
        page,
        limit,
        search,
        isActive,
        isExpired,
        selectedActiveStatuses,
        selectedExpiredStatuses,
      } = input
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
          message: 'You do not have permission to view deals in this project',
        })
      }

      const where: any = { projectId }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { customer: { name: { contains: search, mode: 'insensitive' } } },
          { customer: { email: { contains: search, mode: 'insensitive' } } },
        ]
      }

      if (isActive !== undefined) {
        where.isActive = isActive
      }

      if (isExpired !== undefined) {
        where.isExpired = isExpired
      }

      if (selectedActiveStatuses && selectedActiveStatuses.length > 0) {
        where.isActive = { in: selectedActiveStatuses }
      }

      if (selectedExpiredStatuses && selectedExpiredStatuses.length > 0) {
        where.isExpired = { in: selectedExpiredStatuses }
      }

      const [deals, totalCount] = await Promise.all([
        ctx.db.projectDeal.findMany({
          where,
          include: {
            customer: {
              include: {
                files: true,
              },
            },
            dealMessage: {
              select: {
                id: true,
                dealName: true,
                dealImage: true,
                status: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.db.projectDeal.count({ where }),
      ])

      return {
        deals,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: limit,
        },
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const deal = await ctx.db.projectDeal.findFirst({
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
          customer: {
            include: {
              files: true,
            },
          },
          dealMessage: {
            select: {
              id: true,
              dealName: true,
              dealImage: true,
              status: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      })

      if (!deal) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Deal not found',
        })
      }

      return deal
    }),

  update: protectedProcedure
    .input(updateDealSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, projectId, customerId, revenue, ...dealData } = input

      const membership = await ctx.db.projectMember.findFirst({
        where: {
          userId: ctx.session.user.id,
          projectId,
        },
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update deals in this project',
        })
      }

      const customer = await ctx.db.projectCustomer.findFirst({
        where: {
          id: customerId,
          projectId,
        },
      })

      if (!customer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Customer not found',
        })
      }

      const deal = await ctx.db.projectDeal.update({
        where: { id },
        data: {
          ...dealData,
          name: customer.name,
          customerId: customer.id,
          revenue,
        },
        include: {
          customer: {
            include: {
              files: true,
            },
          },
        },
      })

      return deal
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string(), projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, projectId } = input

      const membership = await ctx.db.projectMember.findFirst({
        where: {
          userId: ctx.session.user.id,
          projectId,
        },
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete deals in this project',
        })
      }

      const deal = await ctx.db.projectDeal.findFirst({
        where: {
          id,
          projectId,
        },
        include: {
          dealMessage: true,
        },
      })

      if (!deal) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Deal not found',
        })
      }

      await ctx.db.$transaction(async (tx) => {
        if (deal.dealMessage) {
          await tx.projectDealMessage.delete({
            where: { dealId: id },
          })
        }

        await tx.projectDeal.delete({
          where: { id },
        })
      })

      return { success: true }
    }),
})
