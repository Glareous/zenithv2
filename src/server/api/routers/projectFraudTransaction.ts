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
        // DATOS BÁSICOS
        amount: z.number(),
        timestamp: z.coerce.date(),
        // DATOS DEL TARJETAHABIENTE
        cardType: z.string(),
        cardLevel: z.string(),
        customerAge: z.number().int(),
        accountAgeDays: z.number().int(),
        customerCountry: z.string(),
        // DATOS DEL COMERCIO
        merchantCategory: z.string(),
        merchantCountry: z.string(),
        merchantRiskLevel: z.string(),
        // COMPORTAMIENTO HISTÓRICO
        daysSinceLastTransaction: z.number(),
        numTransactionsToday: z.number().int(),
        numTransactionsThisHour: z.number().int(),
        avgTransactionAmount30d: z.number(),
        stdTransactionAmount30d: z.number(),
        numTransactions30d: z.number().int(),
        // VELOCIDAD DE TRANSACCIONES
        amountSpentLast24h: z.number(),
        numUniqueMerchants24h: z.number().int(),
        numCountries24h: z.number().int(),
        // INDICADORES DE RIESGO
        internationalTransaction: z.boolean(),
        onlineTransaction: z.boolean(),
        weekendTransaction: z.boolean(),
        nightTransaction: z.boolean(),
        highRiskCountry: z.boolean(),
        firstTimeMerchant: z.boolean(),
        // PATRONES ANÓMALOS
        amountDeviationFromAvg: z.number(),
        unusualHourForUser: z.boolean(),
        unusualMerchantCategory: z.boolean(),
        suddenLocationChange: z.boolean(),
        // AUTENTICACIÓN
        authenticationMethod: z.string(),
        failedAttemptsToday: z.number().int(),
        cardPresent: z.boolean(),
        cvvMatch: z.boolean(),
        // RESULTADO (opcional)
        isFraud: z.boolean().optional(),
        fraudProbability: z.number().optional(),
        riskScore: z.number().int().optional(),
        // STATUS Y SUMMARY
        status: z.enum(['PROCESSING', 'COMPLETED', 'FAILED']).optional(),
        summary: z.string().optional(),
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

      return await ctx.db.projectFraudTransaction.create({
        data: {
          ...input,
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
        // DATOS BÁSICOS
        amount: z.number().optional(),
        timestamp: z.coerce.date().optional(),
        // DATOS DEL TARJETAHABIENTE
        cardType: z.string().optional(),
        cardLevel: z.string().optional(),
        customerAge: z.number().int().optional(),
        accountAgeDays: z.number().int().optional(),
        customerCountry: z.string().optional(),
        // DATOS DEL COMERCIO
        merchantCategory: z.string().optional(),
        merchantCountry: z.string().optional(),
        merchantRiskLevel: z.string().optional(),
        // COMPORTAMIENTO HISTÓRICO
        daysSinceLastTransaction: z.number().optional(),
        numTransactionsToday: z.number().int().optional(),
        numTransactionsThisHour: z.number().int().optional(),
        avgTransactionAmount30d: z.number().optional(),
        stdTransactionAmount30d: z.number().optional(),
        numTransactions30d: z.number().int().optional(),
        // VELOCIDAD DE TRANSACCIONES
        amountSpentLast24h: z.number().optional(),
        numUniqueMerchants24h: z.number().int().optional(),
        numCountries24h: z.number().int().optional(),
        // INDICADORES DE RIESGO
        internationalTransaction: z.boolean().optional(),
        onlineTransaction: z.boolean().optional(),
        weekendTransaction: z.boolean().optional(),
        nightTransaction: z.boolean().optional(),
        highRiskCountry: z.boolean().optional(),
        firstTimeMerchant: z.boolean().optional(),
        // PATRONES ANÓMALOS
        amountDeviationFromAvg: z.number().optional(),
        unusualHourForUser: z.boolean().optional(),
        unusualMerchantCategory: z.boolean().optional(),
        suddenLocationChange: z.boolean().optional(),
        // AUTENTICACIÓN
        authenticationMethod: z.string().optional(),
        failedAttemptsToday: z.number().int().optional(),
        cardPresent: z.boolean().optional(),
        cvvMatch: z.boolean().optional(),
        // RESULTADO
        isFraud: z.boolean().optional(),
        fraudProbability: z.number().optional(),
        riskScore: z.number().int().optional(),
        status: z.enum(['PROCESSING', 'COMPLETED', 'FAILED']).optional(),
        summary: z.string().optional(),
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
