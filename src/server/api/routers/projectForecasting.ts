import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { triggerForecastAsync } from '@src/server/services/backendAsync'

export const projectForecastingRouter = createTRPCRouter({
  // Get all forecasting records for a project
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

      return await ctx.db.projectForecasting.findMany({
        where: { projectId: input.projectId },
        include: {
          files: {
            take: 1,
            orderBy: {
              createdAt: 'desc',
            },
          },
          series: {
            orderBy: {
              order: 'asc',
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    }),

  // Get a single forecasting record by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const forecasting = await ctx.db.projectForecasting.findFirst({
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
          files: {
            orderBy: {
              createdAt: 'desc',
            },
          },
          series: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      })

      if (!forecasting) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Forecasting record not found',
        })
      }

      return forecasting
    }),

  // Create a new forecasting record
  create: protectedProcedure
    .input(
      z.object({
        timeInterval: z.number().int().positive(),
        timeUnit: z.enum(['SECONDS', 'MINUTES', 'HOURS', 'DAYS', 'MONTHS', 'YEARS']),
        description: z.string().optional(),
        status: z.enum(['PROCESSING', 'COMPLETED']).optional(),
        periodToPredict: z.number().int().positive().optional(),
        confidenceLevel: z.number().min(80).max(100).optional(),
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has admin access to create forecasting
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: input.projectId,
          userId: ctx.session.user.id,
          role: { in: ['ADMIN'] },
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
          message: "You don't have permission to create forecasting in this project",
        })
      }

      const { projectId, ...data } = input

      // Get organization's Forecasting agent
      const project = await ctx.db.project.findUnique({
        where: { id: projectId },
        select: {
          organization: {
            select: {
              agentForecastingId: true,
            },
          },
        },
      })

      const forecasting = await ctx.db.projectForecasting.create({
        data: {
          ...data,
          projectId,
          agentId: project?.organization?.agentForecastingId,
          createdById: ctx.session.user.id,
        },
      })
      triggerForecastAsync(forecasting.id).catch((err) => {
        console.error('[Forecast Router] Failed to trigger async:', err)
      })



      return forecasting
    }),

  // Update a forecasting record
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        timeInterval: z.number().int().positive().optional(),
        timeUnit: z.enum(['SECONDS', 'MINUTES', 'HOURS', 'DAYS', 'MONTHS', 'YEARS']).optional(),
        description: z.string().optional(),
        summary: z.string().optional(),
        status: z.enum(['PROCESSING', 'COMPLETED']).optional(),
        periodToPredict: z.number().int().positive().optional(),
        confidenceLevel: z.number().min(80).max(100).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has admin access
      const forecasting = await ctx.db.projectForecasting.findFirst({
        where: {
          id: input.id,
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
      })

      if (!forecasting) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Forecasting record not found or you don't have permission to update it",
        })
      }

      const { id, ...updateData } = input

      const updatedForecasting = await ctx.db.projectForecasting.update({
        where: { id },
        data: updateData,
      })

      // Trigger async processing (fire and forget)
      console.log('[Forecast Router] About to trigger async for updated Forecast:', updatedForecasting.id)
      triggerForecastAsync(updatedForecasting.id).catch((err) => {
        console.error('[Forecast Router] Failed to trigger async:', err)
      })

      return updatedForecasting
    }),

  // Delete a forecasting record
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has admin access
      const forecasting = await ctx.db.projectForecasting.findFirst({
        where: {
          id: input.id,
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
      })

      if (!forecasting) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Forecasting record not found or you don't have permission to delete it",
        })
      }

      await ctx.db.projectForecasting.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
