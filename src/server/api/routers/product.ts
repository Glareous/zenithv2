import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const productRouter = createTRPCRouter({
  // Create a new product with category and warehouse relations
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        price: z.number().min(0).optional(),
        imageUrl: z.string().optional(),
        isActive: z.boolean().default(true), // Cambiar de status a isActive
        projectId: z.string(),
        categoryIds: z.array(z.string()).min(1), // At least one category required
        warehouses: z
          .array(
            z.object({
              warehouseId: z.string(),
              stock: z.number().min(0).default(0),
            })
          )
          .min(1), // At least one warehouse required
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to create products in this project
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
            "You don't have permission to create products in this project",
        })
      }

      // Verify all categories exist and belong to this project
      const categories = await ctx.db.projectCategory.findMany({
        where: {
          id: { in: input.categoryIds },
          projectId: input.projectId,
          type: 'PRODUCT',
        },
      })

      if (categories.length !== input.categoryIds.length) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'One or more categories do not exist or do not belong to this project',
        })
      }

      // Verify all warehouses exist and belong to this project
      const warehouses = await ctx.db.projectProductWarehouse.findMany({
        where: {
          id: { in: input.warehouses.map((w) => w.warehouseId) },
          projectId: input.projectId,
        },
      })

      if (warehouses.length !== input.warehouses.length) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'One or more warehouses do not exist or do not belong to this project',
        })
      }

      // Create product with relations in a transaction
      const product = await ctx.db.$transaction(async (tx) => {
        // Create the product
        const newProduct = await tx.projectProduct.create({
          data: {
            name: input.name,
            description: input.description,
            price: input.price,
            imageUrl: input.imageUrl,
            isActive: input.isActive, // Usar isActive en lugar de status
            projectId: input.projectId,
            createdById: ctx.session.user.id,
          },
        })

        // Create category relations
        const categoryRelations = input.categoryIds.map((categoryId) => ({
          productId: newProduct.id,
          categoryId,
        }))

        await tx.projectProductCategory.createMany({
          data: categoryRelations,
        })

        // Create warehouse relations with stock
        const warehouseRelations = input.warehouses.map((warehouse) => ({
          productId: newProduct.id,
          warehouseId: warehouse.warehouseId,
          stock: warehouse.stock,
        }))

        await tx.productWarehouse.createMany({
          data: warehouseRelations,
        })

        return newProduct
      })

      return product
    }),

  // Get all products for a project with includes
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

      const products = await ctx.db.projectProduct.findMany({
        where: { projectId: input.projectId },
        include: {
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
          warehouses: {
            include: {
              warehouse: {
                select: {
                  id: true,
                  warehouseId: true,
                  name: true,
                },
              },
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return products
    }),

  // Get product by ID with complete relations
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.projectProduct.findFirst({
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
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
          warehouses: {
            include: {
              warehouse: {
                select: {
                  id: true,
                  warehouseId: true,
                  name: true,
                },
              },
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      })

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found or you do not have access to it',
        })
      }

      return product
    }),

  // Update product with category and warehouse updates
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        price: z.number().min(0).optional(),
        imageUrl: z.string().optional(),
        isActive: z.boolean().optional(),
        categoryIds: z.array(z.string()).optional(),
        warehouses: z
          .array(
            z.object({
              warehouseId: z.string(),
              stock: z.number().min(0),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to update this product
      const product = await ctx.db.projectProduct.findFirst({
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
        include: {
          project: true,
        },
      })

      if (!product) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have permission to update this product",
        })
      }

      // Update product with relations in a transaction
      const updatedProduct = await ctx.db.$transaction(async (tx) => {
        // Update basic product fields
        const updatedProduct = await tx.projectProduct.update({
          where: { id: input.id },
          data: {
            ...(input.name && { name: input.name }),
            ...(input.description !== undefined && {
              description: input.description,
            }),
            ...(input.price !== undefined && { price: input.price }),
            ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
            ...(input.isActive !== undefined && { isActive: input.isActive }),
          },
        })

        // Update categories if provided
        if (input.categoryIds) {
          // Delete existing category relations
          await tx.projectProductCategory.deleteMany({
            where: { productId: input.id },
          })

          // Create new category relations
          if (input.categoryIds.length > 0) {
            const categoryRelations = input.categoryIds.map((categoryId) => ({
              productId: input.id,
              categoryId,
            }))

            await tx.projectProductCategory.createMany({
              data: categoryRelations,
            })
          }
        }

        // Update warehouses if provided
        if (input.warehouses) {
          // Delete existing warehouse relations
          await tx.productWarehouse.deleteMany({
            where: { productId: input.id },
          })

          // Create new warehouse relations
          if (input.warehouses.length > 0) {
            const warehouseRelations = input.warehouses.map((warehouse) => ({
              productId: input.id,
              warehouseId: warehouse.warehouseId,
              stock: warehouse.stock,
            }))

            await tx.productWarehouse.createMany({
              data: warehouseRelations,
            })
          }
        }

        return updatedProduct
      })

      return updatedProduct
    }),

  // Delete product with cascade deletion
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to delete this product
      const product = await ctx.db.projectProduct.findFirst({
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

      if (!product) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have permission to delete this product",
        })
      }

      // Delete product (cascade will handle related records)
      await ctx.db.projectProduct.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
