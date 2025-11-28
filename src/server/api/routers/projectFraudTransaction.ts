import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const projectFraudTransactionRouter = createTRPCRouter({
  // Get all fraud transactions for a project
  getByProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user has access to this project
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: input.projectId,
          userId: ctx.session.user.id,
        },
      })

      const organizationMember = await ctx.db.organizationMember.findFirst({
        where: {
          organization: {
            projects: {
              some: {
                id: input.projectId,
              },
            },
          },
          userId: ctx.session.user.id,
          role: { in: ['OWNER', 'ADMIN'] },
        },
      })

      if (!projectMember && !organizationMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this project",
        })
      }

      return await ctx.db.projectFraudTransaction.findMany({
        where: { projectId: input.projectId },
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    }),

  // Get a single fraud transaction by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const transaction = await ctx.db.projectFraudTransaction.findFirst({
        where: {
          id: input.id,
          project: {
            OR: [
              {
                members: {
                  some: {
                    userId: ctx.session.user.id,
                  },
                },
              },
              {
                organization: {
                  members: {
                    some: {
                      userId: ctx.session.user.id,
                      role: { in: ['OWNER', 'ADMIN'] },
                    },
                  },
                },
              },
            ],
          },
        },
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      })

      if (!transaction) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction not found or you do not have access',
        })
      }

      return transaction
    }),

  // Create a new fraud transaction
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        // TRANSACTION DATA
        user: z.number().int(),
        card: z.number().int(),
        year: z.number().int(),
        month: z.number().int().min(1).max(12),
        day: z.number().int().min(1).max(31),
        time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
        amount: z.number(),
        use_chip: z.enum(['Swipe Transaction', 'Chip Transaction', 'Online Transaction']),
        merchant_name: z.string(),
        merchant_city: z.string(),
        merchant_state: z.string().length(2),
        zip: z.number().int(),
        mcc: z.number().int(),
        // PREDICTION RESULTS (optional)
        fraud_score: z.number().min(0).max(1).optional(),
        prediccion: z.enum(['FRAUDE', 'NO FRAUDE']).optional(),
        // STATUS
        status: z.enum(['PROCESSING', 'COMPLETED', 'FAILED']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this project
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: input.projectId,
          userId: ctx.session.user.id,
        },
      })

      const organizationMember = await ctx.db.organizationMember.findFirst({
        where: {
          organization: {
            projects: {
              some: {
                id: input.projectId,
              },
            },
          },
          userId: ctx.session.user.id,
          role: { in: ['OWNER', 'ADMIN'] },
        },
      })

      if (!projectMember && !organizationMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this project",
        })
      }

      // Get organization's fraud detection agent (if exists)
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
        select: {
          organization: {
            select: {
              id: true,
              // Add agentFraudId when organization model has it
            },
          },
        },
      })

      return await ctx.db.projectFraudTransaction.create({
        data: {
          ...input,
          agentId: undefined, // Set to organization's fraud agent when available
          createdById: ctx.session.user.id,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      })
    }),

  // Update fraud transaction
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        // TRANSACTION DATA (all optional for update)
        user: z.number().int().optional(),
        card: z.number().int().optional(),
        year: z.number().int().optional(),
        month: z.number().int().min(1).max(12).optional(),
        day: z.number().int().min(1).max(31).optional(),
        time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
        amount: z.number().optional(),
        use_chip: z.enum(['Swipe Transaction', 'Chip Transaction', 'Online Transaction']).optional(),
        merchant_name: z.string().optional(),
        merchant_city: z.string().optional(),
        merchant_state: z.string().length(2).optional(),
        zip: z.number().int().optional(),
        mcc: z.number().int().optional(),
        // PREDICTION RESULTS
        fraud_score: z.number().min(0).max(1).optional(),
        prediccion: z.enum(['FRAUDE', 'NO FRAUDE']).optional(),
        // STATUS
        status: z.enum(['PROCESSING', 'COMPLETED', 'FAILED']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      // Check if user has access
      const transaction = await ctx.db.projectFraudTransaction.findFirst({
        where: {
          id,
          project: {
            OR: [
              {
                members: {
                  some: {
                    userId: ctx.session.user.id,
                  },
                },
              },
              {
                organization: {
                  members: {
                    some: {
                      userId: ctx.session.user.id,
                      role: { in: ['OWNER', 'ADMIN'] },
                    },
                  },
                },
              },
            ],
          },
        },
      })

      if (!transaction) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Transaction not found or you do not have access',
        })
      }

      return await ctx.db.projectFraudTransaction.update({
        where: { id },
        data,
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      })
    }),

  // Delete fraud transaction
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has access
      const transaction = await ctx.db.projectFraudTransaction.findFirst({
        where: {
          id: input.id,
          project: {
            OR: [
              {
                members: {
                  some: {
                    userId: ctx.session.user.id,
                  },
                },
              },
              {
                organization: {
                  members: {
                    some: {
                      userId: ctx.session.user.id,
                      role: { in: ['OWNER', 'ADMIN'] },
                    },
                  },
                },
              },
            ],
          },
        },
      })

      if (!transaction) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Transaction not found or you do not have access',
        })
      }

      await ctx.db.projectFraudTransaction.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
