import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const projectPQRRouter = createTRPCRouter({
  // Get all PQRs for a project
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

      return await ctx.db.projectPQR.findMany({
        where: { projectId: input.projectId },
        orderBy: { createdAt: 'desc' },
      })
    }),

  // Get a single PQR by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const pqr = await ctx.db.projectPQR.findFirst({
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
          analysis: true,
        },
      })

      if (!pqr) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'PQR not found',
        })
      }

      return pqr
    }),

  // Create a new PQR
  create: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(1).max(100),
        lastName: z.string().min(1).max(100),
        phone: z.string().min(1),
        email: z.string().email(),
        city: z.string().min(1),
        documentType: z.enum(['CC', 'CE', 'PASSPORT', 'NIT']),
        documentNumber: z.string().min(1),
        message: z.string().min(1),
        status: z.enum(['PROCESSING', 'COMPLETED']).optional(),
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has admin access to create PQRs
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
          message: "You don't have permission to create PQRs in this project",
        })
      }

      const { projectId, ...data } = input

      return await ctx.db.projectPQR.create({
        data: {
          ...data,
          projectId,
        },
      })
    }),

  // Update a PQR
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        firstName: z.string().min(1).max(100).optional(),
        lastName: z.string().min(1).max(100).optional(),
        phone: z.string().min(1).optional(),
        email: z.string().email().optional(),
        city: z.string().min(1).optional(),
        documentType: z.enum(['CC', 'CE', 'PASSPORT', 'NIT']).optional(),
        documentNumber: z.string().min(1).optional(),
        message: z.string().min(1).optional(),
        status: z.enum(['PROCESSING', 'COMPLETED']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has admin access
      const pqr = await ctx.db.projectPQR.findFirst({
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

      if (!pqr) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "PQR not found or you don't have permission to update it",
        })
      }

      const { id, ...updateData } = input

      return await ctx.db.projectPQR.update({
        where: { id },
        data: updateData,
      })
    }),

  // Delete a PQR
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has admin access
      const pqr = await ctx.db.projectPQR.findFirst({
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

      if (!pqr) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "PQR not found or you don't have permission to delete it",
        })
      }

      await ctx.db.projectPQR.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})