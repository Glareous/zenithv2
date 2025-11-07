import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const projectOrdersServicesRouter = createTRPCRouter({
  // Create order service item
  create: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        serviceId: z.string(),
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

      // Check if service exists and belongs to this project
      const service = await ctx.db.projectService.findFirst({
        where: {
          id: input.serviceId,
          projectId: order.projectId,
          isActive: true,
        },
      })

      if (!service) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Service not found or not active in this project',
        })
      }

      // Calculate total for this service item
      const total = input.quantity * input.price

      // Create order service item
      const orderService = await ctx.db.projectOrdersServices.create({
        data: {
          orderId: input.orderId,
          serviceId: input.serviceId,
          quantity: input.quantity,
          price: input.price,
          total,
        },
        include: {
          service: true,
        },
      })

      // Update order total amount (including tax)
      const [updatedOrder, orderItems, orderServices] = await Promise.all([
        ctx.db.projectOrders.findUnique({
          where: { id: input.orderId },
          select: { taxPercentage: true },
        }),
        ctx.db.projectOrdersItems.findMany({
          where: { orderId: input.orderId },
        }),
        ctx.db.projectOrdersServices.findMany({
          where: { orderId: input.orderId },
        }),
      ])

      const subtotal =
        orderItems.reduce((sum, item) => sum + item.total, 0) +
        orderServices.reduce((sum, service) => sum + service.total, 0)
      const taxAmount = subtotal * ((updatedOrder?.taxPercentage || 0) / 100)
      const newTotalAmount = subtotal + taxAmount

      await ctx.db.projectOrders.update({
        where: { id: input.orderId },
        data: { totalAmount: newTotalAmount },
      })

      return orderService
    }),

  // Get service items by order ID
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

      const services = await ctx.db.projectOrdersServices.findMany({
        where: { orderId: input.orderId },
        include: {
          service: true,
        },
        orderBy: { createdAt: 'asc' },
      })

      return services
    }),

  // Update order service item
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        quantity: z.number().min(1).optional(),
        price: z.number().min(0).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Find order service item
      const orderService = await ctx.db.projectOrdersServices.findFirst({
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
          service: true,
        },
      })

      if (!orderService) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            'Order service item not found or you do not have permission to update it',
        })
      }

      // Calculate new total
      const newQuantity = updateData.quantity ?? orderService.quantity
      const newPrice = updateData.price ?? orderService.price
      const newTotal = newQuantity * newPrice

      // Update order service item
      const updatedOrderService = await ctx.db.projectOrdersServices.update({
        where: { id },
        data: {
          ...updateData,
          total: newTotal,
        },
        include: {
          service: true,
        },
      })

      // Update order total amount (including tax)
      const [updatedOrder, orderItems, orderServices] = await Promise.all([
        ctx.db.projectOrders.findUnique({
          where: { id: orderService.orderId },
          select: { taxPercentage: true },
        }),
        ctx.db.projectOrdersItems.findMany({
          where: { orderId: orderService.orderId },
        }),
        ctx.db.projectOrdersServices.findMany({
          where: { orderId: orderService.orderId },
        }),
      ])

      const subtotal =
        orderItems.reduce((sum, item) => sum + item.total, 0) +
        orderServices.reduce((sum, service) => sum + service.total, 0)
      const taxAmount = subtotal * ((updatedOrder?.taxPercentage || 0) / 100)
      const newTotalAmount = subtotal + taxAmount

      await ctx.db.projectOrders.update({
        where: { id: orderService.orderId },
        data: { totalAmount: newTotalAmount },
      })

      return updatedOrderService
    }),

  // Delete order service item
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Find order service item
      const orderService = await ctx.db.projectOrdersServices.findFirst({
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
      })

      if (!orderService) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            'Order service item not found or you do not have permission to delete it',
        })
      }

      // Delete order service item
      await ctx.db.projectOrdersServices.delete({
        where: { id: input.id },
      })

      // Update order total amount (including tax)
      const [updatedOrder, orderItems, orderServices] = await Promise.all([
        ctx.db.projectOrders.findUnique({
          where: { id: orderService.orderId },
          select: { taxPercentage: true },
        }),
        ctx.db.projectOrdersItems.findMany({
          where: { orderId: orderService.orderId },
        }),
        ctx.db.projectOrdersServices.findMany({
          where: { orderId: orderService.orderId },
        }),
      ])

      const subtotal =
        orderItems.reduce((sum, item) => sum + item.total, 0) +
        orderServices.reduce((sum, service) => sum + service.total, 0)
      const taxAmount = subtotal * ((updatedOrder?.taxPercentage || 0) / 100)
      const newTotalAmount = subtotal + taxAmount

      await ctx.db.projectOrders.update({
        where: { id: orderService.orderId },
        data: { totalAmount: newTotalAmount },
      })

      return { success: true }
    }),
})
