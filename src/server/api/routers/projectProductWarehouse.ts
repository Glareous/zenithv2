import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const projectProductWarehouseRouter = createTRPCRouter({
  // Create a new warehouse with auto-increment warehouseId
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        isActive: z.boolean().default(true),
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to create warehouses in this project
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
            "You don't have permission to create warehouses in this project",
        })
      }

      // Get the highest warehouseId for this project to auto-increment
      const lastWarehouse = await ctx.db.projectProductWarehouse.findFirst({
        where: { projectId: input.projectId },
        orderBy: { warehouseId: 'desc' },
        select: { warehouseId: true },
      })

      // Generate next warehouseId (a001, a002, a003, etc.)
      let nextWarehouseId = 'a001'
      if (lastWarehouse) {
        const lastNumber = parseInt(lastWarehouse.warehouseId.substring(1))
        const nextNumber = lastNumber + 1
        nextWarehouseId = `a${nextNumber.toString().padStart(3, '0')}`
      }

      const warehouse = await ctx.db.projectProductWarehouse.create({
        data: {
          warehouseId: nextWarehouseId,
          name: input.name,
          description: input.description,
          isActive: input.isActive,
          projectId: input.projectId,
          createdById: ctx.session.user.id,
        },
      })

      return warehouse
    }),

  // Get all warehouses for a project
  getAll: protectedProcedure
    .input(z.object({ projectId: z.string() }))
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

      const warehouses = await ctx.db.projectProductWarehouse.findMany({
        where: { projectId: input.projectId },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: { warehouseId: 'asc' },
      })

      return warehouses
    }),

  // Get warehouse by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const warehouse = await ctx.db.projectProductWarehouse.findFirst({
        where: {
          id: input.id,
          project: {
            members: {
              some: {
                userId: ctx.session.user.id,
              },
            },
          },
        },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      })

      if (!warehouse) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Warehouse not found or you do not have access to it',
        })
      }

      return warehouse
    }),

  // Update warehouse
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to update this warehouse
      const warehouse = await ctx.db.projectProductWarehouse.findFirst({
        where: {
          id: input.id,
          project: {
            members: {
              some: {
                userId: ctx.session.user.id,
                role: { in: ['ADMIN'] },
              },
            },
          },
        },
      })

      if (!warehouse) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have permission to update this warehouse",
        })
      }

      const updatedWarehouse = await ctx.db.projectProductWarehouse.update({
        where: { id: input.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.description !== undefined && {
            description: input.description,
          }),
          ...(input.isActive !== undefined && { isActive: input.isActive }),
        },
      })

      return updatedWarehouse
    }),

  // Delete warehouse
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to delete this warehouse
      const warehouse = await ctx.db.projectProductWarehouse.findFirst({
        where: {
          id: input.id,
          project: {
            members: {
              some: {
                userId: ctx.session.user.id,
                role: { in: ['ADMIN'] },
              },
            },
          },
        },
      })

      if (!warehouse) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have permission to delete this warehouse",
        })
      }

      // Prevent deletion of default warehouses
      if (warehouse.isDefault) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete default warehouses',
        })
      }

      // Check if warehouse has products
      const productsCount = await ctx.db.productWarehouse.count({
        where: { warehouseId: input.id },
      })

      if (productsCount > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Cannot delete warehouse that has products. Please remove all products first.',
        })
      }

      await ctx.db.projectProductWarehouse.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
