import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const projectLeadsCompanyAnalysisRouter = createTRPCRouter({
  // Get analysis by Company Lead ID
  getByCompanyId: protectedProcedure
    .input(z.object({ leadsCompanyId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user has access to this company lead
      const company = await ctx.db.projectLeadsCompany.findFirst({
        where: {
          id: input.leadsCompanyId,
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

      if (!company) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this company lead",
        })
      }

      return await ctx.db.projectLeadsCompanyAnalysis.findUnique({
        where: { leadsCompanyId: input.leadsCompanyId },
      })
    }),

  // Create analysis for a company lead (will be used by AI or DB injection)
  create: protectedProcedure
    .input(
      z.object({
        leadsCompanyId: z.string(),
        // Lead Overview
        shortSummary: z.string().min(1),
        detectedNeeds: z.array(z.string()),
        matchedServices: z.array(z.string()),
        // Contact Profile
        fullName: z.string().min(1),
        jobPosition: z.string().min(1),
        seniorityLevel: z.string().min(1),
        roleType: z.string().min(1),
        decisionPower: z.string().min(1),
        age: z.number().optional(),
        email: z.string().email(),
        emailType: z.string().min(1),
        emailDomain: z.string().min(1),
        location: z.string().min(1),
        companyNameContact: z.string().min(1),
        industryInferred: z.string().min(1),
        // Fit
        fitScore: z.number().min(0).max(100),
        fitGrade: z.string().min(1),
        industryMatch: z.boolean(),
        companySizeMatch: z.boolean(),
        geoMatch: z.boolean(),
        isIdealCustomerProfile: z.boolean(),
        fitReasons: z.array(z.string()),
        // Urgency
        urgencyScore: z.number().min(0).max(100),
        urgencyLevel: z.string().min(1),
        urgencySignals: z.array(z.string()),
        // Opportunity
        dealSizePotential: z.string().min(1),
        complexity: z.string().min(1),
        riskFlags: z.array(z.string()),
        // Data Quality
        dataQualityScore: z.number().min(0).max(100),
        dataQualityLevel: z.string().min(1),
        fieldsCompleteness: z.string().min(1),
        isEmailCorporate: z.boolean(),
        dataIssues: z.array(z.string()),
        // Classification
        stage: z.string().min(1),
        priority: z.string().min(1),
        recommendedOwner: z.string().min(1),
        slaResponseMinutes: z.number(),
        // Recommended Actions
        recommendedActions: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this company lead
      const company = await ctx.db.projectLeadsCompany.findFirst({
        where: {
          id: input.leadsCompanyId,
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

      if (!company) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this company lead",
        })
      }

      // Check if analysis already exists
      const existingAnalysis = await ctx.db.projectLeadsCompanyAnalysis.findUnique({
        where: { leadsCompanyId: input.leadsCompanyId },
      })

      if (existingAnalysis) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Analysis already exists for this company lead',
        })
      }

      return await ctx.db.projectLeadsCompanyAnalysis.create({
        data: input,
      })
    }),

  // Update analysis (for manual override or AI re-generation)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        // Lead Overview
        shortSummary: z.string().min(1).optional(),
        detectedNeeds: z.array(z.string()).optional(),
        matchedServices: z.array(z.string()).optional(),
        // Contact Profile
        fullName: z.string().min(1).optional(),
        jobPosition: z.string().min(1).optional(),
        seniorityLevel: z.string().min(1).optional(),
        roleType: z.string().min(1).optional(),
        decisionPower: z.string().min(1).optional(),
        age: z.number().optional(),
        email: z.string().email().optional(),
        emailType: z.string().min(1).optional(),
        emailDomain: z.string().min(1).optional(),
        location: z.string().min(1).optional(),
        companyNameContact: z.string().min(1).optional(),
        industryInferred: z.string().min(1).optional(),
        // Fit
        fitScore: z.number().min(0).max(100).optional(),
        fitGrade: z.string().min(1).optional(),
        industryMatch: z.boolean().optional(),
        companySizeMatch: z.boolean().optional(),
        geoMatch: z.boolean().optional(),
        isIdealCustomerProfile: z.boolean().optional(),
        fitReasons: z.array(z.string()).optional(),
        // Urgency
        urgencyScore: z.number().min(0).max(100).optional(),
        urgencyLevel: z.string().min(1).optional(),
        urgencySignals: z.array(z.string()).optional(),
        // Opportunity
        dealSizePotential: z.string().min(1).optional(),
        complexity: z.string().min(1).optional(),
        riskFlags: z.array(z.string()).optional(),
        // Data Quality
        dataQualityScore: z.number().min(0).max(100).optional(),
        dataQualityLevel: z.string().min(1).optional(),
        fieldsCompleteness: z.string().min(1).optional(),
        isEmailCorporate: z.boolean().optional(),
        dataIssues: z.array(z.string()).optional(),
        // Classification
        stage: z.string().min(1).optional(),
        priority: z.string().min(1).optional(),
        recommendedOwner: z.string().min(1).optional(),
        slaResponseMinutes: z.number().optional(),
        // Recommended Actions
        recommendedActions: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this analysis
      const existingAnalysis = await ctx.db.projectLeadsCompanyAnalysis.findFirst({
        where: {
          id: input.id,
          leadsCompany: {
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

      return await ctx.db.projectLeadsCompanyAnalysis.update({
        where: { id },
        data: updateData,
      })
    }),

  // Delete analysis
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this analysis
      const existingAnalysis = await ctx.db.projectLeadsCompanyAnalysis.findFirst({
        where: {
          id: input.id,
          leadsCompany: {
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

      await ctx.db.projectLeadsCompanyAnalysis.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // Create or update analysis (upsert) - useful for AI/DB injection
  upsert: protectedProcedure
    .input(
      z.object({
        leadsCompanyId: z.string(),
        // Lead Overview
        shortSummary: z.string().min(1),
        detectedNeeds: z.array(z.string()),
        matchedServices: z.array(z.string()),
        // Contact Profile
        fullName: z.string().min(1),
        jobPosition: z.string().min(1),
        seniorityLevel: z.string().min(1),
        roleType: z.string().min(1),
        decisionPower: z.string().min(1),
        age: z.number().optional(),
        email: z.string().email(),
        emailType: z.string().min(1),
        emailDomain: z.string().min(1),
        location: z.string().min(1),
        companyNameContact: z.string().min(1),
        industryInferred: z.string().min(1),
        // Fit
        fitScore: z.number().min(0).max(100),
        fitGrade: z.string().min(1),
        industryMatch: z.boolean(),
        companySizeMatch: z.boolean(),
        geoMatch: z.boolean(),
        isIdealCustomerProfile: z.boolean(),
        fitReasons: z.array(z.string()),
        // Urgency
        urgencyScore: z.number().min(0).max(100),
        urgencyLevel: z.string().min(1),
        urgencySignals: z.array(z.string()),
        // Opportunity
        dealSizePotential: z.string().min(1),
        complexity: z.string().min(1),
        riskFlags: z.array(z.string()),
        // Data Quality
        dataQualityScore: z.number().min(0).max(100),
        dataQualityLevel: z.string().min(1),
        fieldsCompleteness: z.string().min(1),
        isEmailCorporate: z.boolean(),
        dataIssues: z.array(z.string()),
        // Classification
        stage: z.string().min(1),
        priority: z.string().min(1),
        recommendedOwner: z.string().min(1),
        slaResponseMinutes: z.number(),
        // Recommended Actions
        recommendedActions: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this company lead
      const company = await ctx.db.projectLeadsCompany.findFirst({
        where: {
          id: input.leadsCompanyId,
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

      if (!company) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this company lead",
        })
      }

      const { leadsCompanyId, ...data } = input

      return await ctx.db.projectLeadsCompanyAnalysis.upsert({
        where: { leadsCompanyId },
        create: {
          ...data,
          leadsCompanyId,
        },
        update: {
          ...data,
        },
      })
    }),
})
