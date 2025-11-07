import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '../trpc'

export const projectIntegrationRouter = createTRPCRouter({
  // Crear integración para un proyecto
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string().min(1, 'Name is required'),
        type: z.enum(['WHATSAPP', 'TELEGRAM', 'EMAIL', 'SMS']),
        config: z.any().optional().default({}), // Flexible config object
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { projectId, name, type, config } = input

      // Verificar que el usuario tenga permisos en el proyecto
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId,
          userId: ctx.session.user.id,
          role: { in: ['ADMIN'] },
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            'You do not have permission to create integrations in this project',
        })
      }

      // Verificar que no exista ya una integración del mismo tipo para este proyecto
      const existingIntegration = await ctx.db.projectIntegration.findFirst({
        where: {
          projectId,
          type: type as 'WHATSAPP' | 'TELEGRAM' | 'EMAIL' | 'SMS',
        },
      })

      if (existingIntegration) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `A ${type.toLowerCase()} integration already exists for this project`,
        })
      }

      // Crear la integración
      const integration = await ctx.db.projectIntegration.create({
        data: {
          name,
          type: type as 'WHATSAPP' | 'TELEGRAM' | 'EMAIL' | 'SMS',
          isActive: true,
          config,
          projectId,
          createdById: ctx.session.user.id,
        },
      })

      return integration
    }),

  // Obtener integración de un proyecto
  getByProjectId: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { projectId } = input

      // Verificar que el usuario tenga acceso al proyecto
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId,
          userId: ctx.session.user.id,
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this project',
        })
      }

      const integration = await ctx.db.projectIntegration.findFirst({
        where: {
          projectId,
        },
      })

      return integration
    }),

  // Obtener todas las integraciones de un proyecto
  getAllByProjectId: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { projectId } = input

      // Verificar que el usuario tenga acceso al proyecto
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId,
          userId: ctx.session.user.id,
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this project',
        })
      }

      const integrations = await ctx.db.projectIntegration.findMany({
        where: {
          projectId,
        },
      })

      return integrations
    }),

  // Actualizar integración
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, 'Name is required').optional(),
        config: z.any().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, config, isActive } = input

      // Verificar que la integración existe y obtener datos actuales
      const existingIntegration = await ctx.db.projectIntegration.findUnique({
        where: { id },
        include: { project: true },
      })

      if (!existingIntegration) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Integration not found',
        })
      }

      // Verificar permisos (solo admin del proyecto)
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: existingIntegration.projectId,
          userId: ctx.session.user.id,
          role: { in: ['ADMIN'] },
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this integration',
        })
      }

      // Preparar datos de actualización
      const updateData: {
        name?: string
        isActive?: boolean
        config?: Record<string, any>
      } = {}

      if (name !== undefined) updateData.name = name
      if (isActive !== undefined) updateData.isActive = isActive
      if (config !== undefined) updateData.config = config

      const updatedIntegration = await ctx.db.projectIntegration.update({
        where: { id },
        data: updateData,
      })

      return updatedIntegration
    }),

  // Eliminar integración
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input

      // Verificar que la integración existe
      const existingIntegration = await ctx.db.projectIntegration.findUnique({
        where: { id },
        include: { project: true },
      })

      if (!existingIntegration) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Integration not found',
        })
      }

      // Verificar permisos (solo admin del proyecto)
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: existingIntegration.projectId,
          userId: ctx.session.user.id,
          role: { in: ['ADMIN'] },
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this integration',
        })
      }

      // Eliminar la integración
      await ctx.db.projectIntegration.delete({
        where: { id },
      })

      return { success: true }
    }),

  // Obtener configuración específica de WhatsApp
  getWhatsAppConfig: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { projectId } = input

      // Verificar que el usuario tenga acceso al proyecto
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId,
          userId: ctx.session.user.id,
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this project',
        })
      }

      const integration = await ctx.db.projectIntegration.findFirst({
        where: {
          projectId,
          type: 'WHATSAPP',
        },
        select: {
          id: true,
          name: true,
          isActive: true,
          config: true,
        },
      })

      return integration
    }),
})
