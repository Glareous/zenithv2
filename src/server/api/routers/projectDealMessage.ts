import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

const createDealMessageSchema = z.object({
  dealId: z.string().min(1, 'Deal ID is required'),
  dealName: z.string().min(1, 'Deal name is required'),
  dealImage: z.string().min(1, 'Deal image is required'),
  status: z.enum(['ACTIVE', 'CLOSED', 'ARCHIVED']).default('ACTIVE'),
})

const updateDealMessageSchema = createDealMessageSchema.extend({
  id: z.string().min(1, 'ID is required'),
})

export const projectDealMessageRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createDealMessageSchema)
    .mutation(async ({ ctx, input }) => {
      const { dealId, ...dealMessageData } = input

      // Verify deal exists and user has access to the project
      const deal = await ctx.db.projectDeal.findFirst({
        where: {
          id: dealId,
          project: {
            members: {
              some: {
                userId: ctx.session.user.id,
              },
            },
          },
        },
      })

      if (!deal) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Deal not found or you do not have access to it',
        })
      }

      // Check if deal message already exists (one-to-one relationship)
      const existingDealMessage = await ctx.db.projectDealMessage.findUnique({
        where: { dealId },
      })

      if (existingDealMessage) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Deal message already exists for this deal',
        })
      }

      const dealMessage = await ctx.db.projectDealMessage.create({
        data: {
          ...dealMessageData,
          dealId,
        },
        include: {
          deal: {
            select: {
              id: true,
              name: true,
              projectId: true,
            },
          },
        },
      })

      return dealMessage
    }),

  getByDealId: protectedProcedure
    .input(z.object({ dealId: z.string() }))
    .query(async ({ ctx, input }) => {
      const dealMessage = await ctx.db.projectDealMessage.findFirst({
        where: {
          dealId: input.dealId,
          deal: {
            project: {
              members: {
                some: {
                  userId: ctx.session.user.id,
                },
              },
            },
          },
        },
        include: {
          deal: {
            select: {
              id: true,
              name: true,
              projectId: true,
              revenue: true,
            },
          },
        },
      })

      if (!dealMessage) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Deal message not found',
        })
      }

      return dealMessage
    }),

  update: protectedProcedure
    .input(updateDealMessageSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, dealId, ...updateData } = input

      // Verify deal message exists and user has access
      const dealMessage = await ctx.db.projectDealMessage.findFirst({
        where: {
          id,
          deal: {
            project: {
              members: {
                some: {
                  userId: ctx.session.user.id,
                },
              },
            },
          },
        },
      })

      if (!dealMessage) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Deal message not found or you do not have access to it',
        })
      }

      // If dealId is being changed, verify the new deal exists and user has access
      if (dealId && dealId !== dealMessage.dealId) {
        const newDeal = await ctx.db.projectDeal.findFirst({
          where: {
            id: dealId,
            project: {
              members: {
                some: {
                  userId: ctx.session.user.id,
                },
              },
            },
          },
        })

        if (!newDeal) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'New deal not found or you do not have access to it',
          })
        }

        // Check if the new deal already has a deal message
        const existingDealMessage = await ctx.db.projectDealMessage.findUnique({
          where: { dealId },
        })

        if (existingDealMessage) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'New deal already has a deal message',
          })
        }
      }

      const updatedDealMessage = await ctx.db.projectDealMessage.update({
        where: { id },
        data: {
          ...updateData,
          dealId: dealId || dealMessage.dealId,
        },
        include: {
          deal: {
            select: {
              id: true,
              name: true,
              projectId: true,
              revenue: true,
            },
          },
        },
      })

      return updatedDealMessage
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input

      // Verify deal message exists and user has access
      const dealMessage = await ctx.db.projectDealMessage.findFirst({
        where: {
          id,
          deal: {
            project: {
              members: {
                some: {
                  userId: ctx.session.user.id,
                },
              },
            },
          },
        },
      })

      if (!dealMessage) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Deal message not found or you do not have access to it',
        })
      }

      await ctx.db.projectDealMessage.delete({
        where: { id },
      })

      return { success: true }
    }),

  // Additional utility queries
  getAllByProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, 'ProjectId is required'),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        status: z.enum(['ACTIVE', 'CLOSED', 'ARCHIVED']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { projectId, page, limit, status } = input
      const skip = (page - 1) * limit

      // Verify user has access to the project
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId,
          userId: ctx.session.user.id,
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this project",
        })
      }

      const where: any = {
        deal: {
          projectId,
        },
      }

      if (status) {
        where.status = status
      }

      const [dealMessages, totalCount] = await Promise.all([
        ctx.db.projectDealMessage.findMany({
          where,
          include: {
            deal: {
              select: {
                id: true,
                name: true,
                projectId: true,
                revenue: true,
                customer: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.db.projectDealMessage.count({ where }),
      ])

      return {
        dealMessages,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: limit,
        },
      }
    }),
})
