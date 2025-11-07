import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const projectOrdersItemsRouter = createTRPCRouter({
  // Create order item
  create: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        productId: z.string(),
        warehouseId: z.string(),
        quantity: z.number().min(1),
        price: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this order
      const order = await ctx.db.projectOrders.findFirst({
        where: {
          id: input.orderId,
          project: {
            members: {
              some: {
                userId: ctx.session.user.id,
              },
            },
          },
        },
      })

      if (!order) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this order",
        })
      }

      // Check if product exists and belongs to this project
      const product = await ctx.db.projectProduct.findFirst({
        where: {
          id: input.productId,
          projectId: order.projectId,
          isActive: true,
        },
        include: {
          warehouses: {
            include: {
              warehouse: true,
            },
          },
        },
      })

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found or not active in this project',
        })
      }

      // Check if warehouse exists and has stock for this product
      const productWarehouse = await ctx.db.productWarehouse.findFirst({
        where: {
          productId: input.productId,
          warehouseId: input.warehouseId,
        },
      })

      if (!productWarehouse) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not available in this warehouse',
        })
      }

      // Validate stock availability in the specific warehouse
      if (input.quantity > productWarehouse.stock) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Insufficient stock in warehouse. Available: ${productWarehouse.stock}, Requested: ${input.quantity}`,
        })
      }

      // Calculate total for this item
      const total = input.quantity * input.price

      // Use transaction to create order item and update stock atomically
      const result = await ctx.db.$transaction(async (tx) => {
        // Get current stock before update
        const currentProductWarehouse = await tx.productWarehouse.findUnique({
          where: {
            productId_warehouseId: {
              productId: input.productId,
              warehouseId: input.warehouseId,
            },
          },
        })

        if (!currentProductWarehouse) {
          throw new Error(`Product warehouse not found`)
        }

        const previousStock = currentProductWarehouse.stock
        const newStock = previousStock - input.quantity

        // Create order item
        const orderItem = await tx.projectOrdersItems.create({
          data: {
            orderId: input.orderId,
            productId: input.productId,
            warehouseId: input.warehouseId,
            quantity: input.quantity,
            price: input.price,
            total,
          },
          include: {
            product: true,
            warehouse: true,
          },
        })

        // Update stock in the specific warehouse
        await tx.productWarehouse.update({
          where: {
            productId_warehouseId: {
              productId: input.productId,
              warehouseId: input.warehouseId,
            },
          },
          data: {
            stock: {
              decrement: input.quantity,
            },
          },
        })

        const lastMovement = await tx.projectProductStockMovement.findFirst({
          where: { productId: input.productId },
          orderBy: { createdAt: 'desc' },
          select: { movementId: true },
        })

        let nextMovementId = 'm001'
        if (lastMovement?.movementId) {
          const lastNumber = parseInt(lastMovement.movementId.substring(1))
          const nextNumber = lastNumber + 1
          nextMovementId = `m${nextNumber.toString().padStart(3, '0')}`
        }

        await tx.projectProductStockMovement.create({
          data: {
            movementId: nextMovementId,
            productId: input.productId,
            warehouseId: input.warehouseId,
            movementType: 'ORDER_UPDATE',
            quantity: -input.quantity,
            previousStock,
            newStock,
            orderId: input.orderId,
          },
        })

        return orderItem
      })

      // Update order total amount (including tax)
      const updatedOrder = await ctx.db.projectOrders.findUnique({
        where: { id: input.orderId },
        select: { taxPercentage: true },
      })

      const orderItems = await ctx.db.projectOrdersItems.findMany({
        where: { orderId: input.orderId },
      })

      const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0)
      const taxAmount = subtotal * ((updatedOrder?.taxPercentage || 0) / 100)
      const newTotalAmount = subtotal + taxAmount

      await ctx.db.projectOrders.update({
        where: { id: input.orderId },
        data: { totalAmount: newTotalAmount },
      })

      return result
    }),

  // Get items by order ID
  getByOrderId: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user has access to this order
      const order = await ctx.db.projectOrders.findFirst({
        where: {
          id: input.orderId,
          project: {
            members: {
              some: {
                userId: ctx.session.user.id,
              },
            },
          },
        },
      })

      if (!order) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this order",
        })
      }

      const items = await ctx.db.projectOrdersItems.findMany({
        where: { orderId: input.orderId },
        include: {
          product: true,
        },
        orderBy: { createdAt: 'asc' },
      })

      return items
    }),

  // Update order item
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        quantity: z.number().min(1).optional(),
        price: z.number().min(0).optional(),
        warehouseId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Find order item with current data
      const orderItem = await ctx.db.projectOrdersItems.findFirst({
        where: {
          id,
          order: {
            project: {
              members: {
                some: {
                  userId: ctx.session.user.id,
                },
              },
            },
          },
        },
        include: {
          product: true,
          warehouse: true,
        },
      })

      if (!orderItem) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            'Order item not found or you do not have permission to update it',
        })
      }

      // Determine if we need to handle stock changes
      const isQuantityChanging =
        updateData.quantity !== undefined &&
        updateData.quantity !== orderItem.quantity
      const isWarehouseChanging =
        updateData.warehouseId !== undefined &&
        updateData.warehouseId !== orderItem.warehouseId
      const needsStockUpdate = isQuantityChanging || isWarehouseChanging

      if (needsStockUpdate) {
        // Get current stock information
        const currentProductWarehouse = await ctx.db.productWarehouse.findFirst(
          {
            where: {
              productId: orderItem.productId,
              warehouseId: orderItem.warehouseId,
            },
          }
        )

        if (!currentProductWarehouse) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Current warehouse stock information not found',
          })
        }

        // Determine target warehouse
        const targetWarehouseId =
          updateData.warehouseId || orderItem.warehouseId
        const newQuantity = updateData.quantity || orderItem.quantity

        // Get target warehouse stock information
        const targetProductWarehouse = await ctx.db.productWarehouse.findFirst({
          where: {
            productId: orderItem.productId,
            warehouseId: targetWarehouseId,
          },
        })

        if (!targetProductWarehouse) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Target warehouse not found for this product',
          })
        }

        // Calculate available stock in target warehouse
        let availableStock = targetProductWarehouse.stock

        // If changing warehouse, add back the stock from the old warehouse
        if (
          isWarehouseChanging &&
          targetWarehouseId !== orderItem.warehouseId
        ) {
          availableStock += orderItem.quantity
        }

        // Validate stock availability
        if (newQuantity > availableStock) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Insufficient stock in target warehouse. Available: ${availableStock}, Requested: ${newQuantity}`,
          })
        }

        // Use transaction to update item and stock atomically
        const result = await ctx.db.$transaction(async (tx) => {
          // Get current stocks before updates
          const currentSourceWarehouse = await tx.productWarehouse.findUnique({
            where: {
              productId_warehouseId: {
                productId: orderItem.productId,
                warehouseId: orderItem.warehouseId,
              },
            },
          })

          const currentTargetWarehouse = await tx.productWarehouse.findUnique({
            where: {
              productId_warehouseId: {
                productId: orderItem.productId,
                warehouseId: targetWarehouseId,
              },
            },
          })

          if (!currentSourceWarehouse || !currentTargetWarehouse) {
            throw new Error(`Product warehouse not found`)
          }

          // Calculate new stocks
          const sourcePreviousStock = currentSourceWarehouse.stock
          const sourceNewStock = sourcePreviousStock + orderItem.quantity
          const targetPreviousStock = currentTargetWarehouse.stock
          const targetNewStock = targetPreviousStock - newQuantity

          // Restore stock from current warehouse
          await tx.productWarehouse.update({
            where: {
              productId_warehouseId: {
                productId: orderItem.productId,
                warehouseId: orderItem.warehouseId,
              },
            },
            data: {
              stock: {
                increment: orderItem.quantity,
              },
            },
          })

          // Generate movementId for restore
          const lastMovement1 = await tx.projectProductStockMovement.findFirst({
            where: { productId: orderItem.productId },
            orderBy: { createdAt: 'desc' },
            select: { movementId: true },
          })

          let nextMovementId1 = 'm001'
          if (lastMovement1?.movementId) {
            const lastNumber = parseInt(lastMovement1.movementId.substring(1))
            const nextNumber = lastNumber + 1
            nextMovementId1 = `m${nextNumber.toString().padStart(3, '0')}`
          }

          // Create stock movement record for restore
          await tx.projectProductStockMovement.create({
            data: {
              movementId: nextMovementId1,
              productId: orderItem.productId,
              warehouseId: orderItem.warehouseId,
              movementType: 'ORDER_UPDATE',
              quantity: orderItem.quantity,
              previousStock: sourcePreviousStock,
              newStock: sourceNewStock,
              orderId: orderItem.orderId,
            },
          })

          // Subtract stock from target warehouse
          await tx.productWarehouse.update({
            where: {
              productId_warehouseId: {
                productId: orderItem.productId,
                warehouseId: targetWarehouseId,
              },
            },
            data: {
              stock: {
                decrement: newQuantity,
              },
            },
          })

          // Generate movementId for subtract
          const lastMovement2 = await tx.projectProductStockMovement.findFirst({
            where: { productId: orderItem.productId },
            orderBy: { createdAt: 'desc' },
            select: { movementId: true },
          })

          let nextMovementId2 = 'm001'
          if (lastMovement2?.movementId) {
            const lastNumber = parseInt(lastMovement2.movementId.substring(1))
            const nextNumber = lastNumber + 1
            nextMovementId2 = `m${nextNumber.toString().padStart(3, '0')}`
          }

          // Create stock movement record for subtract
          await tx.projectProductStockMovement.create({
            data: {
              movementId: nextMovementId2,
              productId: orderItem.productId,
              warehouseId: targetWarehouseId,
              movementType: 'ORDER_UPDATE',
              quantity: -newQuantity,
              previousStock: targetPreviousStock,
              newStock: targetNewStock,
              orderId: orderItem.orderId,
            },
          })

          // Calculate new total
          const newTotal = newQuantity * (updateData.price || orderItem.price)

          // Update order item
          const updatedOrderItem = await tx.projectOrdersItems.update({
            where: { id },
            data: {
              ...updateData,
              warehouseId: targetWarehouseId,
              total: newTotal,
            },
            include: {
              product: true,
              warehouse: true,
            },
          })

          return updatedOrderItem
        })

        // Update order total amount (including tax)
        const updatedOrder = await ctx.db.projectOrders.findUnique({
          where: { id: orderItem.orderId },
          select: { taxPercentage: true },
        })

        const orderItems = await ctx.db.projectOrdersItems.findMany({
          where: { orderId: orderItem.orderId },
        })

        const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0)
        const taxAmount = subtotal * ((updatedOrder?.taxPercentage || 0) / 100)
        const newTotalAmount = subtotal + taxAmount

        await ctx.db.projectOrders.update({
          where: { id: orderItem.orderId },
          data: { totalAmount: newTotalAmount },
        })

        return result
      } else {
        // No stock changes needed, just update the item
        const newTotal =
          (updateData.quantity || orderItem.quantity) *
          (updateData.price || orderItem.price)

        const updatedOrderItem = await ctx.db.projectOrdersItems.update({
          where: { id },
          data: {
            ...updateData,
            total: newTotal,
          },
          include: {
            product: true,
            warehouse: true,
          },
        })

        // Update order total amount (including tax)
        const updatedOrder = await ctx.db.projectOrders.findUnique({
          where: { id: orderItem.orderId },
          select: { taxPercentage: true },
        })

        const orderItems = await ctx.db.projectOrdersItems.findMany({
          where: { orderId: orderItem.orderId },
        })

        const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0)
        const taxAmount = subtotal * ((updatedOrder?.taxPercentage || 0) / 100)
        const newTotalAmount = subtotal + taxAmount

        await ctx.db.projectOrders.update({
          where: { id: orderItem.orderId },
          data: { totalAmount: newTotalAmount },
        })

        return updatedOrderItem
      }
    }),

  // Delete order item
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Find order item with warehouse information
      const orderItem = await ctx.db.projectOrdersItems.findFirst({
        where: {
          id: input.id,
          order: {
            project: {
              members: {
                some: {
                  userId: ctx.session.user.id,
                  role: { in: ['ADMIN'] },
                },
              },
            },
          },
        },
        include: {
          product: true,
          warehouse: true,
        },
      })

      if (!orderItem) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            'Order item not found or you do not have permission to delete it',
        })
      }

      // Use transaction to delete item and restore stock atomically
      await ctx.db.$transaction(async (tx) => {
        // Get current stock before update
        const currentProductWarehouse = await tx.productWarehouse.findUnique({
          where: {
            productId_warehouseId: {
              productId: orderItem.productId,
              warehouseId: orderItem.warehouseId,
            },
          },
        })

        if (!currentProductWarehouse) {
          throw new Error(`Product warehouse not found`)
        }

        const previousStock = currentProductWarehouse.stock
        const newStock = previousStock + orderItem.quantity

        // Restore stock to the warehouse
        await tx.productWarehouse.update({
          where: {
            productId_warehouseId: {
              productId: orderItem.productId,
              warehouseId: orderItem.warehouseId,
            },
          },
          data: {
            stock: {
              increment: orderItem.quantity,
            },
          },
        })

        // Generate movementId
        const lastMovement = await tx.projectProductStockMovement.findFirst({
          where: { productId: orderItem.productId },
          orderBy: { createdAt: 'desc' },
          select: { movementId: true },
        })

        let nextMovementId = 'm001'
        if (lastMovement?.movementId) {
          const lastNumber = parseInt(lastMovement.movementId.substring(1))
          const nextNumber = lastNumber + 1
          nextMovementId = `m${nextNumber.toString().padStart(3, '0')}`
        }

        // Create stock movement record for restore
        await tx.projectProductStockMovement.create({
          data: {
            movementId: nextMovementId,
            productId: orderItem.productId,
            warehouseId: orderItem.warehouseId,
            movementType: 'ORDER_UPDATE',
            quantity: orderItem.quantity,
            previousStock: previousStock,
            newStock: newStock,
            orderId: orderItem.orderId,
          },
        })

        // Delete order item
        await tx.projectOrdersItems.delete({
          where: { id: input.id },
        })
      })

      // Update order total amount (including tax)
      const updatedOrder = await ctx.db.projectOrders.findUnique({
        where: { id: orderItem.orderId },
        select: { taxPercentage: true },
      })

      const orderItems = await ctx.db.projectOrdersItems.findMany({
        where: { orderId: orderItem.orderId },
      })

      const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0)
      const taxAmount = subtotal * ((updatedOrder?.taxPercentage || 0) / 100)
      const newTotalAmount = subtotal + taxAmount

      await ctx.db.projectOrders.update({
        where: { id: orderItem.orderId },
        data: { totalAmount: newTotalAmount },
      })

      return { success: true }
    }),
})
