import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const projectLeadsCompanyRouter = createTRPCRouter({
  // Get all company leads for a project
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

      return await ctx.db.projectLeadsCompany.findMany({
        where: { projectId: input.projectId },
        orderBy: { createdAt: 'desc' },
      })
    }),

  // Get a single company lead by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const company = await ctx.db.projectLeadsCompany.findFirst({
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

      if (!company) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Company lead not found',
        })
      }

      return company
    }),

  // Get single company for project (1-to-1 relationship)
  getByProjectId: protectedProcedure
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

      return await ctx.db.projectLeadsCompany.findUnique({
        where: { projectId: input.projectId },
      })
    }),

  // Create a new company lead
  create: protectedProcedure
    .input(
      z.object({
        companyName: z.string().min(1).max(200),
        shortDescription: z.string().min(1).max(500),
        mainServices: z.string().min(1),
        targetAudience: z.string().min(1),
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has admin access to create company leads
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
          message: "You don't have permission to create company leads in this project",
        })
      }

      const { projectId, ...data } = input

      return await ctx.db.projectLeadsCompany.create({
        data: {
          ...data,
          projectId,
        },
      })
    }),

  // Update a company lead
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        companyName: z.string().min(1).max(200).optional(),
        shortDescription: z.string().min(1).max(500).optional(),
        mainServices: z.string().min(1).optional(),
        targetAudience: z.string().min(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has admin access
      const company = await ctx.db.projectLeadsCompany.findFirst({
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

      if (!company) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Company lead not found or you don't have permission to update it",
        })
      }

      const { id, ...updateData } = input

      return await ctx.db.projectLeadsCompany.update({
        where: { id },
        data: updateData,
      })
    }),

  // Delete a company lead
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has admin access
      const company = await ctx.db.projectLeadsCompany.findFirst({
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

      if (!company) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Company lead not found or you don't have permission to delete it",
        })
      }

      await ctx.db.projectLeadsCompany.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // Upsert (create or update) company for project
  upsert: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        companyName: z.string().min(1).max(200),
        shortDescription: z.string().min(1).max(500),
        mainServices: z.string().min(1),
        targetAudience: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has admin access
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
          message: "You don't have permission to manage company leads in this project",
        })
      }

      const { projectId, ...data } = input

      return await ctx.db.projectLeadsCompany.upsert({
        where: { projectId },
        create: {
          ...data,
          projectId,
        },
        update: data,
      })
    }),
})
