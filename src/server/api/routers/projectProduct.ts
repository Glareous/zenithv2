import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { env } from '@src/env'
import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

// Initialize S3 client
const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_API_KEY,
    secretAccessKey: env.AWS_SECRET_ACCESS_API_KEY,
  },
})

const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be greater than or equal to 0'),
  imageUrl: z.string().optional(),
  projectId: z.string().min(1, 'ProjectId es requerido'),
  categoryIds: z.array(z.string()).min(1, 'At least one category is required'),
  warehouseIds: z
    .array(z.string())
    .min(1, 'At least one warehouse is required'),
  stockByWarehouse: z
    .array(
      z.object({
        warehouseId: z.string(),
        stock: z.number().min(0, 'Stock must be greater than or equal to 0'),
      })
    )
    .min(1, 'Stock per warehouse is required'),
  isActive: z.boolean().default(true),
})

const updateProductSchema = createProductSchema.extend({
  id: z.string().min(1, 'ID es requerido'),
})

export const projectProductRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createProductSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        projectId,
        categoryIds,
        warehouseIds,
        stockByWarehouse,
        ...productData
      } = input

      const membership = await ctx.db.projectMember.findFirst({
        where: {
          userId: ctx.session.user.id,
          projectId,
        },
      })

      if (!membership) {
        throw new Error(
          'You do not have permission to create products in this project'
        )
      }

      const product = await ctx.db.$transaction(async (tx) => {
        // Create the product
        const newProduct = await tx.projectProduct.create({
          data: {
            ...productData,
            isActive: productData.isActive,
            projectId,
            createdById: ctx.session.user.id,
            categories: {
              create: categoryIds.map((categoryId) => ({
                categoryId,
              })),
            },
            warehouses: {
              create: stockByWarehouse.map(({ warehouseId, stock }) => ({
                warehouse: {
                  connect: { id: warehouseId },
                },
                stock,
              })),
            },
          },
          include: {
            categories: {
              include: {
                category: true,
              },
            },
            warehouses: {
              include: {
                warehouse: true,
              },
            },
          },
        })

        for (const { warehouseId, stock } of stockByWarehouse) {
          if (stock > 0) {
            // Generate movementId (m001, m002, etc.)
            const lastMovement = await tx.projectProductStockMovement.findFirst(
              {
                where: { productId: newProduct.id },
                orderBy: { createdAt: 'desc' },
                select: { movementId: true },
              }
            )

            let nextMovementId = 'm001'
            if (lastMovement?.movementId) {
              const lastNumber = parseInt(lastMovement.movementId.substring(1))
              const nextNumber = lastNumber + 1
              nextMovementId = `m${nextNumber.toString().padStart(3, '0')}`
            }

            // Create stock movement record
            await tx.projectProductStockMovement.create({
              data: {
                movementId: nextMovementId,
                productId: newProduct.id,
                warehouseId,
                movementType: 'PRODUCT_CREATE',
                quantity: stock,
                previousStock: 0,
                newStock: stock,
                orderId: null,
              },
            })
          }
        }

        return newProduct
      })

      return product
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, 'ProjectId es requerido'),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        categories: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const {
        projectId,
        page,
        limit,
        search,
        categories,
        isActive,
        minPrice,
        maxPrice,
      } = input
      const skip = (page - 1) * limit

      const membership = await ctx.db.projectMember.findFirst({
        where: {
          userId: ctx.session.user.id,
          projectId,
        },
      })

      if (!membership) {
        throw new Error(
          'You do not have permission to view products in this project'
        )
      }

      const where: any = { projectId }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      }

      if (categories && categories.length > 0) {
        where.categories = {
          some: {
            category: {
              name: { in: categories, mode: 'insensitive' },
            },
          },
        }
      }

      if (isActive !== undefined) {
        where.isActive = isActive
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {}
        if (minPrice !== undefined) {
          where.price.gte = minPrice
        }
        if (maxPrice !== undefined) {
          where.price.lte = maxPrice
        }
      }

      const [products, totalCount] = await Promise.all([
        ctx.db.projectProduct.findMany({
          where,
          include: {
            categories: {
              include: {
                category: true,
              },
            },
            warehouses: {
              include: {
                warehouse: true,
              },
            },
            files: true,
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        ctx.db.projectProduct.count({ where }),
      ])

      return {
        products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPrevPage: page > 1,
        },
      }
    }),

  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, 'ID es requerido'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id } = input

      const product = await ctx.db.projectProduct.findUnique({
        where: { id },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
          warehouses: {
            include: {
              warehouse: true,
            },
          },
          files: true,
        },
      })

      if (!product) {
        throw new Error('Product not found')
      }

      const membership = await ctx.db.projectMember.findFirst({
        where: {
          userId: ctx.session.user.id,
          projectId: product.projectId,
        },
      })

      if (!membership) {
        throw new Error('You do not have permission to view this product')
      }

      return product
    }),

  update: protectedProcedure
    .input(updateProductSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        projectId,
        categoryIds,
        warehouseIds,
        stockByWarehouse,
        ...productData
      } = input

      const existingProduct = await ctx.db.projectProduct.findUnique({
        where: { id },
        include: {
          categories: true,
          warehouses: true,
        },
      })

      if (!existingProduct) {
        throw new Error('Product not found')
      }

      const membership = await ctx.db.projectMember.findFirst({
        where: {
          userId: ctx.session.user.id,
          projectId: existingProduct.projectId,
        },
      })

      if (!membership) {
        throw new Error('You do not have permission to update this product')
      }

      const existingWarehouseIds = existingProduct.warehouses.map(
        (w) => w.warehouseId
      )
      const newWarehouseIds = stockByWarehouse.map((w) => w.warehouseId)
      const warehousesToRemove = existingWarehouseIds.filter(
        (id) => !newWarehouseIds.includes(id)
      )

      if (warehousesToRemove.length > 0) {
        const activeOrderItems = await ctx.db.projectOrdersItems.findMany({
          where: {
            productId: id,
            warehouseId: { in: warehousesToRemove },
            order: {
              status: { in: ['NEW', 'PENDING', 'SHIPPING'] },
            },
          },
          include: {
            order: {
              select: {
                orderId: true,
                status: true,
              },
            },
            warehouse: {
              select: {
                warehouseId: true,
                name: true,
              },
            },
          },
        })

        if (activeOrderItems.length > 0) {
          const affectedWarehouses = [
            ...new Set(
              activeOrderItems.map(
                (item) =>
                  `${item.warehouse.name} (${item.warehouse.warehouseId})`
              )
            ),
          ].join(', ')

          const orderIds = [
            ...new Set(activeOrderItems.map((item) => item.order.orderId)),
          ].join(', ')

          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Cannot remove warehouse(s): ${affectedWarehouses}. These warehouses have active orders (${orderIds}) and their stock is needed. Complete or cancel these orders first.`,
          })
        }
      }

      const updatedProduct = await ctx.db.$transaction(async (tx) => {
        const previousStock = await tx.productWarehouse.findMany({
          where: { productId: id },
          select: { warehouseId: true, stock: true },
        })

        for (const warehouseId of warehousesToRemove) {
          const previousStockRecord = previousStock.find(
            (p) => p.warehouseId === warehouseId
          )

          if (previousStockRecord && previousStockRecord.stock > 0) {
            // Generar movementId
            const lastMovement = await tx.projectProductStockMovement.findFirst(
              {
                where: { productId: id },
                orderBy: { createdAt: 'desc' },
                select: { movementId: true },
              }
            )

            let nextMovementId = 'm001'
            if (lastMovement?.movementId) {
              const lastNumber = parseInt(lastMovement.movementId.substring(1))
              const nextNumber = lastNumber + 1
              nextMovementId = `m${nextNumber.toString().padStart(3, '0')}`
            }

            await tx.projectProductStockMovement.create({
              data: {
                movementId: nextMovementId,
                productId: id,
                warehouseId,
                movementType: 'PRODUCT_UPDATE',
                quantity: -previousStockRecord.stock,
                previousStock: previousStockRecord.stock,
                newStock: 0,
                orderId: null,
              },
            })
          }
        }

        await tx.projectProductCategory.deleteMany({
          where: { productId: id },
        })
        await tx.productWarehouse.deleteMany({
          where: { productId: id },
        })

        const result = await tx.projectProduct.update({
          where: { id },
          data: {
            ...productData,
            isActive: productData.isActive,
            categories: {
              create: categoryIds.map((categoryId) => ({
                categoryId,
              })),
            },
            warehouses: {
              create: stockByWarehouse.map(({ warehouseId, stock }) => ({
                warehouse: { connect: { id: warehouseId } },
                stock,
              })),
            },
          },
          include: {
            categories: { include: { category: true } },
            warehouses: { include: { warehouse: true } },
          },
        })

        for (const { warehouseId, stock } of stockByWarehouse) {
          const previousStockRecord = previousStock.find(
            (p) => p.warehouseId === warehouseId
          )
          const previousStockValue = previousStockRecord?.stock || 0

          if (stock !== previousStockValue) {
            // Generar movementId
            const lastMovement = await tx.projectProductStockMovement.findFirst(
              {
                where: { productId: id },
                orderBy: { createdAt: 'desc' },
                select: { movementId: true },
              }
            )

            let nextMovementId = 'm001'
            if (lastMovement?.movementId) {
              const lastNumber = parseInt(lastMovement.movementId.substring(1))
              const nextNumber = lastNumber + 1
              nextMovementId = `m${nextNumber.toString().padStart(3, '0')}`
            }

            // Crear movimiento de stock
            await tx.projectProductStockMovement.create({
              data: {
                movementId: nextMovementId,
                productId: id,
                warehouseId,
                movementType: 'PRODUCT_UPDATE',
                quantity: stock - previousStockValue,
                previousStock: previousStockValue,
                newStock: stock,
                orderId: null,
              },
            })
          }
        }

        return result
      })

      return updatedProduct
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, 'ID es requerido'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input

      const existingProduct = await ctx.db.projectProduct.findUnique({
        where: { id },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      })

      if (!existingProduct) {
        throw new Error('Product not found')
      }

      const membership = await ctx.db.projectMember.findFirst({
        where: {
          userId: ctx.session.user.id,
          projectId: existingProduct.projectId,
        },
      })

      if (!membership) {
        throw new Error('You do not have permission to delete this product')
      }

      const activeOrderItems = await ctx.db.projectOrdersItems.findMany({
        where: {
          productId: id,
          order: {
            status: { in: ['NEW', 'PENDING', 'SHIPPING'] },
          },
        },
        include: {
          order: {
            select: {
              orderId: true,
              status: true,
            },
          },
        },
      })

      if (activeOrderItems.length > 0) {
        const orderIds = [
          ...new Set(activeOrderItems.map((item) => item.order.orderId)),
        ].join(', ')

        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot delete product. There are ${activeOrderItems.length} active order items in orders: ${orderIds}. Complete or cancel these orders first.`,
        })
      }

      // Check if product is used in any agent workflows
      const workflowsUsingProduct = await ctx.db.projectAgentWorkflow.findMany({
        where: {
          agent: {
            projectId: existingProduct.projectId,
          },
        },
        include: {
          agent: {
            select: {
              name: true,
            },
          },
        },
      })

      const affectedAgents: string[] = []
      for (const workflow of workflowsUsingProduct) {
        const nodes = (workflow.nodes as any[]) || []
        const hasProduct = nodes.some((node: any) => {
          const products = node.data?.products || []
          return products.some((p: any) => p.id === id)
        })

        if (hasProduct) {
          affectedAgents.push(workflow.agent.name || 'Unnamed Agent')
        }
      }

      if (affectedAgents.length > 0) {
        const agentNames = affectedAgents.join(', ')
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot delete product. It is being used in ${affectedAgents.length} agent workflow(s): ${agentNames}. Remove the product from these workflows first.`,
        })
      }

      await ctx.db.$transaction(async (tx) => {
        if (existingProduct.imageUrl) {
          console.log('️ Product has imageUrl:', existingProduct.imageUrl)

          // extract information from the url to search for specific files
          // The url usually has a format like: https://bucket.s3.region.amazonaws.com/categories/categoryId/files/fileId.ext

          // search for files that match the product url
          const files = await tx.projectProductFile.findMany({
            where: {
              s3Url: existingProduct.imageUrl,
            },
          })

          console.log(
            `📁 Found ${files.length} files matching product imageUrl`
          )

          // delete found files
          for (const file of files) {
            try {
              // delete from S3
              await s3Client.send(
                new DeleteObjectCommand({
                  Bucket: file.s3Bucket,
                  Key: file.s3Key,
                })
              )
              console.log(`✅ Deleted file from S3: ${file.s3Key}`)
            } catch (s3Error) {
              console.error('⚠️ Error deleting file from S3:', s3Error)
            }

            // delete from database
            await tx.projectProductFile.delete({
              where: { id: file.id },
            })
            console.log(`✅ Deleted file record from DB: ${file.id}`)
          }
        }

        await tx.projectProductStockMovement.deleteMany({
          where: { productId: id },
        })

        // delete product
        await tx.projectProduct.delete({
          where: { id },
        })
      })

      return { success: true }
    }),
})
