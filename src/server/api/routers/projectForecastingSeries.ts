import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const projectForecastingSeriesRouter = createTRPCRouter({
  // Get all series for a forecasting
  getByForecasting: protectedProcedure
    .input(z.object({ forecastingId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user has access to this forecasting
      const forecasting = await ctx.db.projectForecasting.findFirst({
        where: {
          id: input.forecastingId,
          project: {
            OR: [
              // User is a project member
              {
                members: {
                  some: {
                    userId: ctx.session.user.id,
                  },
                },
              },
              // User is organization owner/admin
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
          message: "You don't have access to this forecasting",
        })
      }

      // Get all series for this forecasting, ordered by order field
      const series = await ctx.db.projectForecastingSeries.findMany({
        where: { forecastingId: input.forecastingId },
        orderBy: { order: 'asc' },
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

      return series
    }),

  // Get single series by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const series = await ctx.db.projectForecastingSeries.findFirst({
        where: {
          id: input.id,
          forecasting: {
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

      if (!series) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Series not found',
        })
      }

      return series
    }),

  // Update series (name and order only, values cannot be modified)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        order: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has admin access
      const series = await ctx.db.projectForecastingSeries.findFirst({
        where: {
          id: input.id,
          forecasting: {
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

      if (!series) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Series not found or you don't have permission to update it",
        })
      }

      // Update only allowed fields
      const updateData: { name?: string; order?: number } = {}
      if (input.name !== undefined) updateData.name = input.name
      if (input.order !== undefined) updateData.order = input.order

      const updatedSeries = await ctx.db.projectForecastingSeries.update({
        where: { id: input.id },
        data: updateData,
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

      return updatedSeries
    }),

  // Delete series
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const series = await ctx.db.projectForecastingSeries.findFirst({
        where: {
          id: input.id,
          forecasting: {
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

      if (!series) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Series not found or you don't have permission to delete it",
        })
      }

      // Delete the series
      await ctx.db.projectForecastingSeries.delete({
        where: { id: input.id },
      })

      // Check if there are any remaining series for this forecasting
      const remainingSeriesCount = await ctx.db.projectForecastingSeries.count({
        where: { forecastingId: series.forecastingId },
      })

      // If no series left, set forecasting status back to PROCESSING
      if (remainingSeriesCount === 0) {
        await ctx.db.projectForecasting.update({
          where: { id: series.forecastingId },
          data: {
            status: 'PROCESSING',
          },
        })
      }

      return { success: true }
    }),
})
