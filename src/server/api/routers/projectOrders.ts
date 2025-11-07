import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const projectOrdersRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        orderDate: z.date().optional(),
        deliveredDate: z.date().optional(),
        customerId: z.string(),
        type: z.enum(['PRODUCT', 'SERVICE', 'MIXED']).optional(), // MIXED added, now optional
        status: z
          .enum(['NEW', 'DELIVERED', 'PENDING', 'SHIPPING', 'CANCELLED'])
          .default('NEW'),
        payment: z.enum(['PAID', 'UNPAID', 'COD']).default('UNPAID'),
        taxPercentage: z.number().min(0).max(100).default(0),
        totalAmount: z.number().default(0),
        projectId: z.string(),
        items: z
          .array(
            z.object({
              productId: z.string(),
              warehouseId: z.string(),
              quantity: z.number().min(1),
              price: z.number().min(0),
            })
          )
          .optional(), // Product items
        services: z
          .array(
            z.object({
              serviceId: z.string(),
              quantity: z.number().min(1),
              price: z.number().min(0),
            })
          )
          .optional(), // Service items
      })
    )
    .mutation(async ({ ctx, input }) => {
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
          message: "You don't have permission to create orders in this project",
        })
      }

      // Obtener datos del cliente para preservarlos
      const customer = await ctx.db.projectCustomer.findUnique({
        where: { id: input.customerId },
        select: { name: true, email: true },
      })

      if (!customer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Customer not found',
        })
      }

      // Calculate order type automatically based on items
      const hasProducts = input.items && input.items.length > 0
      const hasServices = input.services && input.services.length > 0
      const calculatedType: 'PRODUCT' | 'SERVICE' | 'MIXED' =
        hasProducts && hasServices
          ? 'MIXED'
          : hasProducts
            ? 'PRODUCT'
            : hasServices
              ? 'SERVICE'
              : 'PRODUCT'

      // Validate stock availability for all items before creating the order
      if (input.items && input.items.length > 0) {
        for (const item of input.items) {
          const productWarehouse = await ctx.db.productWarehouse.findFirst({
            where: {
              productId: item.productId,
              warehouseId: item.warehouseId,
            },
          })

          if (!productWarehouse) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: `Product not available in the selected warehouse`,
            })
          }

          if (item.quantity > productWarehouse.stock) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: `Insufficient stock for product. Available: ${productWarehouse.stock}, Requested: ${item.quantity}`,
            })
          }
        }
      }

      const lastOrder = await ctx.db.projectOrders.findFirst({
        where: { projectId: input.projectId },
        orderBy: { orderId: 'desc' },
        select: { orderId: true },
      })

      let nextOrderId = 'o001'
      if (lastOrder) {
        const lastNumber = parseInt(lastOrder.orderId.substring(1))
        const nextNumber = lastNumber + 1
        nextOrderId = `o${nextNumber.toString().padStart(3, '0')}`
      }

      // Use transaction to create order and items atomically
      const order = await ctx.db.$transaction(
        async (tx) => {
          const newOrder = await tx.projectOrders.create({
            data: {
              orderId: nextOrderId,
              orderDate: input.orderDate || new Date(),
              deliveredDate: input.deliveredDate,
              customerId: input.customerId,
              customerName: customer.name,
              customerEmail: customer.email,
              type: calculatedType, // Use calculated type instead of input.type
              status: input.status,
              payment: input.payment,
              taxPercentage: input.taxPercentage,
              totalAmount: input.totalAmount,
              projectId: input.projectId,
              createdById: ctx.session.user.id,
              items: {
                create: input.items?.map((item) => ({
                  productId: item.productId,
                  warehouseId: item.warehouseId,
                  quantity: item.quantity,
                  price: item.price,
                  total: item.quantity * item.price,
                })),
              },
              services: {
                create: input.services?.map((service) => ({
                  serviceId: service.serviceId,
                  quantity: service.quantity,
                  price: service.price,
                  total: service.quantity * service.price,
                })),
              },
            },
            include: {
              customer: true,
              items: {
                include: {
                  product: true,
                  warehouse: true,
                },
              },
              services: {
                include: {
                  service: true,
                },
              },
            },
          })

          if (input.items && input.items.length > 0) {
            for (const item of input.items) {
              const total = item.quantity * item.price

              // Get current stock before update
              const currentProductWarehouse =
                await tx.productWarehouse.findUnique({
                  where: {
                    productId_warehouseId: {
                      productId: item.productId,
                      warehouseId: item.warehouseId,
                    },
                  },
                })

              if (!currentProductWarehouse) {
                throw new Error(`Product warehouse not found`)
              }

              const previousStock = currentProductWarehouse.stock
              const newStock = previousStock - item.quantity

              // Update stock in the specific warehouse
              await tx.productWarehouse.update({
                where: {
                  productId_warehouseId: {
                    productId: item.productId,
                    warehouseId: item.warehouseId,
                  },
                },
                data: {
                  stock: {
                    decrement: item.quantity,
                  },
                },
              })

              // Generate movementId
              const lastMovement =
                await tx.projectProductStockMovement.findFirst({
                  where: { productId: item.productId },
                  orderBy: { createdAt: 'desc' },
                  select: { movementId: true },
                })

              let nextMovementId = 'm001'
              if (lastMovement?.movementId) {
                const lastNumber = parseInt(
                  lastMovement.movementId.substring(1)
                )
                const nextNumber = lastNumber + 1
                nextMovementId = `m${nextNumber.toString().padStart(3, '0')}`
              }

              await tx.projectProductStockMovement.create({
                data: {
                  movementId: nextMovementId,
                  productId: item.productId,
                  warehouseId: item.warehouseId,
                  movementType: 'ORDER_CREATE',
                  quantity: -item.quantity,
                  previousStock,
                  newStock,
                  orderId: newOrder.id,
                },
              })
            }
          }

          return newOrder
        },
        {
          timeout: 10000, // 15 seconds timeout for large orders
        }
      )

      // Return order with items
      return await ctx.db.projectOrders.findUnique({
        where: { id: order.id },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
              warehouse: true,
            },
          },
          services: {
            include: {
              service: true,
            },
          },
        },
      })
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, 'ProjectId es requerido'),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        type: z.enum(['PRODUCT', 'SERVICE', 'MIXED']).optional(),
        status: z
          .enum(['NEW', 'DELIVERED', 'PENDING', 'SHIPPING', 'CANCELLED'])
          .optional(),
        payment: z.enum(['PAID', 'UNPAID', 'COD']).optional(),
        isPaid: z.boolean().optional(),
        isUnpaid: z.boolean().optional(),
        minAmount: z.number().optional(),
        maxAmount: z.number().optional(),
        selectedStatuses: z.array(z.string()).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const {
        projectId,
        page,
        limit,
        search,
        type,
        status,
        payment,
        isPaid,
        isUnpaid,
        minAmount,
        maxAmount,
        selectedStatuses,
      } = input
      const skip = (page - 1) * limit

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

      const where: any = { projectId }

      if (type) {
        where.type = type
      }

      if (search) {
        where.OR = [
          { orderId: { contains: search, mode: 'insensitive' } },
          { customer: { name: { contains: search, mode: 'insensitive' } } },
        ]
      }

      if (status) {
        where.status = status
      }

      if (payment) {
        where.payment = payment
      }

      if (isPaid) {
        where.payment = 'PAID'
      }
      if (isUnpaid) {
        where.payment = 'UNPAID'
      }

      if (minAmount !== undefined || maxAmount !== undefined) {
        where.totalAmount = {}
        if (minAmount !== undefined) {
          where.totalAmount.gte = minAmount
        }
        if (maxAmount !== undefined) {
          where.totalAmount.lte = maxAmount
        }
      }

      if (selectedStatuses && selectedStatuses.length > 0) {
        where.status = { in: selectedStatuses }
      }

      const [orders, totalCount] = await Promise.all([
        ctx.db.projectOrders.findMany({
          where,
          include: {
            customer: true,
            items: {
              include: {
                product: true,
                warehouse: true,
              },
            },
            services: {
              include: {
                service: true,
              },
            },
            _count: {
              select: {
                items: true,
                services: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.db.projectOrders.count({ where }),
      ])

      return {
        orders,
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
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.projectOrders.findFirst({
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
          customer: true,
          items: {
            include: {
              product: {
                include: {
                  files: true,
                },
              },
              warehouse: true,
            },
          },
          services: {
            include: {
              service: {
                include: {
                  files: true,
                },
              },
            },
          },
          _count: {
            select: {
              items: true,
              services: true,
            },
          },
        },
      })

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found or you do not have access to it',
        })
      }

      return order
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        orderDate: z.date().optional(),
        deliveredDate: z.date().nullable().optional(),
        customerId: z.string().optional(),
        type: z.enum(['PRODUCT', 'SERVICE', 'MIXED']).optional(),
        status: z
          .enum(['NEW', 'DELIVERED', 'PENDING', 'SHIPPING', 'CANCELLED'])
          .optional(),
        payment: z.enum(['PAID', 'UNPAID', 'COD']).optional(),
        taxPercentage: z.number().min(0).max(100).optional(),
        totalAmount: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Check if user has permission to update this order
      const order = await ctx.db.projectOrders.findFirst({
        where: {
          id,
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
          items: {
            include: {
              product: true,
              warehouse: true,
            },
          },
        },
      })

      if (!order) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Order not found or you do not have permission to update it',
        })
      }

      // If customerId is being updated, verify it exists
      if (updateData.customerId) {
        const customer = await ctx.db.projectCustomer.findFirst({
          where: {
            id: updateData.customerId,
            projectId: order.projectId,
          },
        })

        if (!customer) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Customer not found in this project',
          })
        }
      }

      // Use transaction to update order and handle stock changes
      const updatedOrder = await ctx.db.$transaction(async (tx) => {
        // Check if status is being changed
        const isStatusChanging =
          updateData.status && updateData.status !== order.status

        if (isStatusChanging) {
          // If changing TO CANCELLED (restore stock)
          if (
            updateData.status === 'CANCELLED' &&
            order.status !== 'CANCELLED'
          ) {
            // Validate that order can be cancelled (not delivered)
            if (order.status === 'DELIVERED') {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Cannot cancel an order that has been delivered',
              })
            }

            // Restore stock logic
            if (order.items.length > 0) {
              for (const item of order.items) {
                // Get current stock before update
                const currentProductWarehouse =
                  await tx.productWarehouse.findUnique({
                    where: {
                      productId_warehouseId: {
                        productId: item.productId,
                        warehouseId: item.warehouseId,
                      },
                    },
                  })

                if (!currentProductWarehouse) {
                  throw new Error(`Product warehouse not found`)
                }

                const previousStock = currentProductWarehouse.stock
                const newStock = previousStock + item.quantity

                await tx.productWarehouse.update({
                  where: {
                    productId_warehouseId: {
                      productId: item.productId,
                      warehouseId: item.warehouseId,
                    },
                  },
                  data: {
                    stock: {
                      increment: item.quantity,
                    },
                  },
                })

                // Generate movementId
                const lastMovement =
                  await tx.projectProductStockMovement.findFirst({
                    where: { productId: item.productId },
                    orderBy: { createdAt: 'desc' },
                    select: { movementId: true },
                  })

                let nextMovementId = 'm001'
                if (lastMovement?.movementId) {
                  const lastNumber = parseInt(
                    lastMovement.movementId.substring(1)
                  )
                  const nextNumber = lastNumber + 1
                  nextMovementId = `m${nextNumber.toString().padStart(3, '0')}`
                }

                // Create stock movement record
                await tx.projectProductStockMovement.create({
                  data: {
                    movementId: nextMovementId,
                    productId: item.productId,
                    warehouseId: item.warehouseId,
                    movementType: 'ORDER_CANCELLED',
                    quantity: item.quantity,
                    previousStock,
                    newStock,
                    orderId: order.id,
                  },
                })
              }
            }
          }

          // If changing FROM CANCELLED to other status (subtract stock)
          else if (
            order.status === 'CANCELLED' &&
            updateData.status !== 'CANCELLED'
          ) {
            // Subtract stock logic
            if (order.items.length > 0) {
              for (const item of order.items) {
                // Check if there's enough stock
                const currentStock = await tx.productWarehouse.findFirst({
                  where: {
                    productId: item.productId,
                    warehouseId: item.warehouseId,
                  },
                })

                if (!currentStock || currentStock.stock < item.quantity) {
                  throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: `Insufficient stock for product in warehouse. Available: ${currentStock?.stock || 0}, Required: ${item.quantity}`,
                  })
                }

                const previousStock = currentStock.stock
                const newStock = previousStock - item.quantity

                await tx.productWarehouse.update({
                  where: {
                    productId_warehouseId: {
                      productId: item.productId,
                      warehouseId: item.warehouseId,
                    },
                  },
                  data: {
                    stock: {
                      decrement: item.quantity,
                    },
                  },
                })

                // Generate movementId
                const lastMovement =
                  await tx.projectProductStockMovement.findFirst({
                    where: { productId: item.productId },
                    orderBy: { createdAt: 'desc' },
                    select: { movementId: true },
                  })

                let nextMovementId = 'm001'
                if (lastMovement?.movementId) {
                  const lastNumber = parseInt(
                    lastMovement.movementId.substring(1)
                  )
                  const nextNumber = lastNumber + 1
                  nextMovementId = `m${nextNumber.toString().padStart(3, '0')}`
                }

                // Create stock movement record
                await tx.projectProductStockMovement.create({
                  data: {
                    movementId: nextMovementId,
                    productId: item.productId,
                    warehouseId: item.warehouseId,
                    movementType: 'ORDER_CREATE',
                    quantity: -item.quantity,
                    previousStock,
                    newStock,
                    orderId: order.id,
                  },
                })
              }
            }
          }
        }

        // Update the order
        const updated = await tx.projectOrders.update({
          where: { id },
          data: updateData,
          include: {
            customer: true,
            items: {
              include: {
                product: {
                  include: {
                    files: true,
                  },
                },
                warehouse: true,
              },
            },
          },
        })
        return updated
      })

      return updatedOrder
    }),

  // Delete order
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to delete this order
      const order = await ctx.db.projectOrders.findFirst({
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
          items: true,
        },
      })

      if (!order) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Order not found or you do not have permission to delete it',
        })
      }

      // Use transaction to delete order and restore stock
      await ctx.db.$transaction(
        async (tx) => {
          // Restore stock if order was not cancelled (cancelled orders already have stock restored)
          if (order.status !== 'CANCELLED' && order.items.length > 0) {
            for (const item of order.items) {
              // Get current stock before update
              const currentProductWarehouse =
                await tx.productWarehouse.findUnique({
                  where: {
                    productId_warehouseId: {
                      productId: item.productId,
                      warehouseId: item.warehouseId,
                    },
                  },
                })

              if (!currentProductWarehouse) {
                throw new Error(`Product warehouse not found`)
              }

              const previousStock = currentProductWarehouse.stock
              const newStock = previousStock + item.quantity

              await tx.productWarehouse.update({
                where: {
                  productId_warehouseId: {
                    productId: item.productId,
                    warehouseId: item.warehouseId,
                  },
                },
                data: {
                  stock: {
                    increment: item.quantity,
                  },
                },
              })

              // Generate movementId
              const lastMovement =
                await tx.projectProductStockMovement.findFirst({
                  where: { productId: item.productId },
                  orderBy: { createdAt: 'desc' },
                  select: { movementId: true },
                })

              let nextMovementId = 'm001'
              if (lastMovement?.movementId) {
                const lastNumber = parseInt(
                  lastMovement.movementId.substring(1)
                )
                const nextNumber = lastNumber + 1
                nextMovementId = `m${nextNumber.toString().padStart(3, '0')}`
              }

              // Create stock movement record
              await tx.projectProductStockMovement.create({
                data: {
                  movementId: nextMovementId,
                  productId: item.productId,
                  warehouseId: item.warehouseId,
                  movementType: 'ORDER_DELETE',
                  quantity: item.quantity,
                  previousStock,
                  newStock,
                  orderId: order.id,
                },
              })
            }
          }

          // Delete order (items will be deleted in cascade)
          await tx.projectOrders.delete({
            where: { id: input.id },
          })
        },
        {
          timeout: 8000,
        }
      )

      return { success: true }
    }),
})
