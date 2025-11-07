import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const projectModelRouter = createTRPCRouter({
  // Check if user is admin of the project
  checkIsAdmin: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
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

      return {
        isAdmin: !!projectMember || !!organizationMember,
      }
    }),

  // Create a new AI model
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        provider: z.string().min(1).max(50),
        modelName: z.string().min(1).max(100),
        apiKey: z.string().min(1),
        url: z.string().url().optional().or(z.literal('')),
        type: z.string().default('GENERATIVE_MODEL'),
        isActive: z.boolean().default(true),
        isDefault: z.boolean().default(false),
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to create models in this project
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: input.projectId,
          userId: ctx.session.user.id,
          role: { in: ['ADMIN'] },
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            "You don't have permission to create models in this project",
        })
      }

      // If this is set as default, unset all other defaults
      if (input.isDefault) {
        await ctx.db.projectModel.updateMany({
          where: {
            projectId: input.projectId,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        })
      }

      const model = await ctx.db.projectModel.create({
        data: {
          name: input.name,
          provider: input.provider,
          modelName: input.modelName,
          apiKey: input.apiKey, // TODO: Encrypt this before storing
          url: input.url || undefined,
          type: input.type,
          isActive: input.isActive,
          isDefault: input.isDefault,
          projectId: input.projectId,
          createdById: ctx.session.user.id,
        },
      })

      return model
    }),

  // Get all models for a project
  getByProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user has access to this project
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: input.projectId,
          userId: ctx.session.user.id,
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this project",
        })
      }

      const models = await ctx.db.projectModel.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          files: {
            take: 1,
            orderBy: {
              createdAt: 'desc',
            },
          },
          _count: {
            select: {
              agents: true,
            },
          },
        },
        orderBy: [
          { isDefault: 'desc' },
          { isActive: 'desc' },
          { createdAt: 'desc' },
        ],
      })

      return models
    }),

  // Get a single model by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const model = await ctx.db.projectModel.findUnique({
        where: { id: input.id },
        include: {
          files: true,
          project: true,
          _count: {
            select: {
              agents: true,
            },
          },
        },
      })

      if (!model) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Model not found',
        })
      }

      // Check if user has access to this project
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: model.projectId,
          userId: ctx.session.user.id,
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this project",
        })
      }

      return model
    }),

  // Update a model
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        provider: z.string().min(1).max(50).optional(),
        modelName: z.string().min(1).max(100).optional(),
        apiKey: z.string().min(1).optional(),
        url: z.string().url().optional().or(z.literal('')),
        type: z.string().optional(),
        isActive: z.boolean().optional(),
        isDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      // Get the model to check permissions
      const existingModel = await ctx.db.projectModel.findUnique({
        where: { id },
      })

      if (!existingModel) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Model not found',
        })
      }

      // Check if user has permission to update models in this project
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: existingModel.projectId,
          userId: ctx.session.user.id,
          role: { in: ['ADMIN'] },
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have permission to update this model",
        })
      }

      // If this is set as default, unset all other defaults
      if (input.isDefault) {
        await ctx.db.projectModel.updateMany({
          where: {
            projectId: existingModel.projectId,
            isDefault: true,
            id: { not: id },
          },
          data: {
            isDefault: false,
          },
        })
      }

      const updatedModel = await ctx.db.projectModel.update({
        where: { id },
        data: {
          ...data,
          // TODO: Encrypt apiKey if provided
        },
      })

      return updatedModel
    }),

  // Delete a model
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get the model to check permissions
      const model = await ctx.db.projectModel.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              agents: true,
            },
          },
        },
      })

      if (!model) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Model not found',
        })
      }

      // Check if user has permission to delete models in this project
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: model.projectId,
          userId: ctx.session.user.id,
          role: { in: ['ADMIN'] },
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have permission to delete this model",
        })
      }

      // Check if model is in use by agents
      if (model._count.agents > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot delete model that is being used by ${model._count.agents} agent(s)`,
        })
      }

      await ctx.db.projectModel.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
