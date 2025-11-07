import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const projectCustomerRouter = createTRPCRouter({
  // Create a new customer
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        email: z.string().email().optional(),
        phoneNumber: z.string().optional(),
        subscriber: z.boolean().default(false),
        gender: z.string().optional(),
        location: z.string().optional(),
        role: z.string().optional(),
        website: z.string().optional(),
        isActive: z.boolean().default(true),
        origin: z.string().optional(), // Add origin field
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to create customers in this project
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
            "You don't have permission to create customers in this project",
        })
      }

      const customer = await ctx.db.projectCustomer.create({
        data: {
          name: input.name,
          email: input.email,
          phoneNumber: input.phoneNumber,
          subscriber: input.subscriber,
          gender: input.gender,
          location: input.location,
          role: input.role,
          website: input.website,
          isActive: input.isActive,
          origin: input.origin || 'FROM_CUSTOMER', // Default to FROM_CUSTOMER if not specified
          projectId: input.projectId,
          createdById: ctx.session.user.id,
        },
        include: {
          files: {
            where: {
              fileType: 'IMAGE',
            },
            take: 1,
          },
        },
      })

      return customer
    }),

  // Get all customers for a project with pagination
  getAll: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        isActive: z.boolean().optional(),
        createdAt: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { projectId, page, limit, search, isActive, createdAt } = input
      const skip = (page - 1) * limit

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

      // Construir filtros
      const where: any = { projectId }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phoneNumber: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
        ]
      }

      if (isActive !== undefined) {
        where.isActive = isActive
      }

      if (createdAt) {
        const startOfDay = new Date(createdAt)
        startOfDay.setHours(0, 0, 0, 0)
        
        const endOfDay = new Date(createdAt)
        endOfDay.setHours(23, 59, 59, 999)
        
        where.createdAt = {
          gte: startOfDay,
          lte: endOfDay,
        }
      }

      // Obtener customers paginados y contar total
      const [customers, totalCount] = await Promise.all([
        ctx.db.projectCustomer.findMany({
          where,
          include: {
            _count: {
              select: {
                orders: true,
              },
            },
            files: {
              where: {
                fileType: 'IMAGE',
              },
              take: 1,
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.db.projectCustomer.count({ where }),
      ])

      return {
        customers,
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

  // Get customer by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const customer = await ctx.db.projectCustomer.findFirst({
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
          files: {
            where: {
              fileType: 'IMAGE',
            },
          },
          _count: {
            select: {
              orders: true,
            },
          },
        },
      })

      if (!customer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Customer not found or you do not have access to it',
        })
      }

      return customer
    }),

  // Update customer
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100),
        email: z.string().email().optional(),
        phoneNumber: z.string().optional(),
        subscriber: z.boolean().default(false),
        gender: z.string().optional(),
        location: z.string().optional(),
        role: z.string().optional(),
        website: z.string().optional(),
        isActive: z.boolean().default(true),
        origin: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Check if user has permission to update this customer
      const customer = await ctx.db.projectCustomer.findFirst({
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
      })

      if (!customer) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            'Customer not found or you do not have permission to update it',
        })
      }

      const updatedCustomer = await ctx.db.projectCustomer.update({
        where: { id },
        data: updateData,
      })

      return updatedCustomer
    }),

  // Delete customer
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to delete this customer
      const customer = await ctx.db.projectCustomer.findFirst({
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
          files: true,
          orders: {
            where: {
              status: {
                in: ['NEW', 'PENDING', 'SHIPPING'],
              },
            },
          },
        },
      })

      if (!customer) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            'Customer not found or you do not have permission to delete it',
        })
      }

      if (customer.isActive) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Cannot delete an active customer. Please deactivate the customer first.',
        })
      }

      if (customer.subscriber) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Cannot delete a subscriber customer. Please remove subscription first.',
        })
      }

      if (customer.orders.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot delete customer with ${customer.orders.length} active order(s). Please wait for all orders to be delivered or cancelled.`,
        })
      }

      // Delete customer (files will be deleted in cascade, orders will be preserved with customerId = null)
      await ctx.db.projectCustomer.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
