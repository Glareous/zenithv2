import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const projectPQRAnalysisRouter = createTRPCRouter({
  // Get analysis by PQR ID
  getByPQRId: protectedProcedure
    .input(z.object({ pqrId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user has access to this PQR
      const pqr = await ctx.db.projectPQR.findFirst({
        where: {
          id: input.pqrId,
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

      if (!pqr) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this PQR",
        })
      }

      return await ctx.db.projectPQRAnalysis.findUnique({
        where: { pqrId: input.pqrId },
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

  // Create analysis for a PQR (will be used by AI)
  create: protectedProcedure
    .input(
      z.object({
        pqrId: z.string(),
        customer: z.string().min(1),
        type: z.string().min(1),
        priority: z.string().min(1),
        risk: z.string().min(1),
        sla: z.string().min(1),
        sentiment: z.string().min(1),
        emotion: z.string().min(1),
        topic: z.string().min(1),
        keywords: z.string().min(1),
        analysis: z.string().min(1),
        pts: z.string().optional(),
        override: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this PQR
      const pqr = await ctx.db.projectPQR.findFirst({
        where: {
          id: input.pqrId,
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

      if (!pqr) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this PQR",
        })
      }

      // Check if analysis already exists
      const existingAnalysis = await ctx.db.projectPQRAnalysis.findUnique({
        where: { pqrId: input.pqrId },
      })

      if (existingAnalysis) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Analysis already exists for this PQR',
        })
      }

      const { pqrId, ...data } = input

      return await ctx.db.projectPQRAnalysis.create({
        data: {
          ...data,
          pqrId,
          createdById: ctx.session.user.id,
        },
      })
    }),

  // Update analysis (for manual override or AI re-generation)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        customer: z.string().min(1).optional(),
        type: z.string().min(1).optional(),
        priority: z.string().min(1).optional(),
        risk: z.string().min(1).optional(),
        sla: z.string().min(1).optional(),
        sentiment: z.string().min(1).optional(),
        emotion: z.string().min(1).optional(),
        topic: z.string().min(1).optional(),
        keywords: z.string().min(1).optional(),
        analysis: z.string().min(1).optional(),
        pts: z.string().optional(),
        override: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this analysis
      const existingAnalysis = await ctx.db.projectPQRAnalysis.findFirst({
        where: {
          id: input.id,
          pqr: {
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
        },
      })

      if (!existingAnalysis) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            "Analysis not found or you don't have permission to update it",
        })
      }

      const { id, ...updateData } = input

      return await ctx.db.projectPQRAnalysis.update({
        where: { id },
        data: updateData,
      })
    }),

  // Delete analysis
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this analysis
      const existingAnalysis = await ctx.db.projectPQRAnalysis.findFirst({
        where: {
          id: input.id,
          pqr: {
            project: {
              OR: [
                {
                  members: {
                    some: {
                      userId: ctx.session.user.id,
                      role: 'ADMIN',
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
        },
      })

      if (!existingAnalysis) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            "Analysis not found or you don't have permission to delete it",
        })
      }

      await ctx.db.projectPQRAnalysis.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // Create or update analysis (upsert) - useful for AI regeneration
  upsert: protectedProcedure
    .input(
      z.object({
        pqrId: z.string(),
        customer: z.string().min(1),
        type: z.string().min(1),
        priority: z.string().min(1),
        risk: z.string().min(1),
        sla: z.string().min(1),
        sentiment: z.string().min(1),
        emotion: z.string().min(1),
        topic: z.string().min(1),
        keywords: z.string().min(1),
        analysis: z.string().min(1),
        pts: z.string().optional(),
        override: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this PQR
      const pqr = await ctx.db.projectPQR.findFirst({
        where: {
          id: input.pqrId,
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

      if (!pqr) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this PQR",
        })
      }

      const { pqrId, ...data } = input

      return await ctx.db.projectPQRAnalysis.upsert({
        where: { pqrId },
        create: {
          ...data,
          pqrId,
          createdById: ctx.session.user.id,
        },
        update: {
          ...data,
        },
      })
    }),
})
