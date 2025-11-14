import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

const createChatSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  agentId: z.string().min(1, 'Agent ID is required'),
  employeeId: z.string().optional(),
  metadata: z.any().optional(),
})

const updateChatSchema = z.object({
  id: z.string().min(1, 'Chat ID is required'),
  status: z.enum(['ACTIVE', 'CLOSED', 'ARCHIVED']).optional(),
  metadata: z.any().optional(),
  endedAt: z.date().optional(),
})

export const projectChatRouter = createTRPCRouter({
  // Create new chat
  create: protectedProcedure
    .input(createChatSchema)
    .mutation(async ({ ctx, input }) => {
      const { agentId, userId, employeeId, metadata } = input

      // Verify agent exists and user has access
      const agent = await ctx.db.projectAgent.findFirst({
        where: {
          id: agentId,
          OR: [
            // User is member of the project
            {
              project: {
                members: {
                  some: {
                    userId: ctx.session.user.id,
                  },
                },
              },
            },
            // Agent is global
            { isGlobal: true },
          ],
        },
        include: {
          project: {
            select: {
              id: true,
              organizationId: true,
            },
          },
        },
      })

      if (!agent) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Agent not found or you do not have access to it',
        })
      }

      // Verify employeeId exists if provided
      if (employeeId) {
        const employee = await ctx.db.projectEmployee.findUnique({
          where: { id: employeeId },
        })

        if (!employee) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Employee not found',
          })
        }
      }

      const chat = await ctx.db.chat.create({
        data: {
          userId,
          agentId,
          employeeId,
          status: 'ACTIVE',
          metadata: metadata || {},
        },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      })

      return chat
    }),

  // Get chat by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const chat = await ctx.db.chat.findFirst({
        where: {
          id: input.id,
          agent: {
            OR: [
              // User is member of the project
              {
                project: {
                  members: {
                    some: {
                      userId: ctx.session.user.id,
                    },
                  },
                },
              },
              // Agent is global
              { isGlobal: true },
            ],
          },
        },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              type: true,
              files: {
                where: {
                  fileType: 'IMAGE',
                },
                orderBy: {
                  createdAt: 'asc',
                },
                take: 1,
                select: {
                  id: true,
                  s3Url: true,
                },
              },
            },
          },
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              image: true,
            },
          },
          messages: {
            orderBy: {
              timestamp: 'asc',
            },
          },
        },
      })

      if (!chat) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Chat not found or you do not have access to it',
        })
      }

      return chat
    }),

  // Get chats by user ID
  getByUserId: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        agentId: z.string().optional(),
        status: z.enum(['ACTIVE', 'CLOSED', 'ARCHIVED']).optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId, agentId, status, page, limit } = input
      const skip = (page - 1) * limit

      const where: any = {
        userId,
        agent: {
          OR: [
            // User is member of the project
            {
              project: {
                members: {
                  some: {
                    userId: ctx.session.user.id,
                  },
                },
              },
            },
            // Agent is global
            { isGlobal: true },
          ],
        },
      }

      if (agentId) {
        where.agentId = agentId
      }

      if (status) {
        where.status = status
      }

      const [chats, totalCount] = await Promise.all([
        ctx.db.chat.findMany({
          where,
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
            _count: {
              select: {
                messages: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: {
            updatedAt: 'desc',
          },
        }),
        ctx.db.chat.count({ where }),
      ])

      return {
        chats,
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

  // Get chats by employee ID
  getByEmployeeId: protectedProcedure
    .input(
      z.object({
        employeeId: z.string(),
        status: z.enum(['ACTIVE', 'CLOSED', 'ARCHIVED']).optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { employeeId, status, page, limit } = input
      const skip = (page - 1) * limit

      // Verify employee exists and user has access to the project
      const employee = await ctx.db.projectEmployee.findFirst({
        where: {
          id: employeeId,
          project: {
            members: {
              some: {
                userId: ctx.session.user.id,
              },
            },
          },
        },
      })

      if (!employee) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Employee not found or you do not have access to it',
        })
      }

      const where: any = {
        employeeId,
      }

      if (status) {
        where.status = status
      }

      const [chats, totalCount] = await Promise.all([
        ctx.db.chat.findMany({
          where,
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                image: true,
                email: true,
              },
            },
            _count: {
              select: {
                messages: {
                  where: {
                    type: 'AGENT',
                    isRead: false,
                  },
                },
              },
            },
            messages: {
              orderBy: {
                timestamp: 'desc',
              },
              take: 1,
            },
          },
          skip,
          take: limit,
          orderBy: {
            updatedAt: 'desc',
          },
        }),
        ctx.db.chat.count({ where }),
      ])

      return {
        chats,
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

  // Get chats by agent ID
  getByAgent: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        status: z.enum(['ACTIVE', 'CLOSED', 'ARCHIVED']).optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { agentId, status, page, limit } = input
      const skip = (page - 1) * limit

      // Verify access to agent
      const agent = await ctx.db.projectAgent.findFirst({
        where: {
          id: agentId,
          OR: [
            {
              project: {
                members: {
                  some: {
                    userId: ctx.session.user.id,
                  },
                },
              },
            },
            { isGlobal: true },
          ],
        },
      })

      if (!agent) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Agent not found or you do not have access to it',
        })
      }

      const where: any = {
        agentId,
      }

      if (status) {
        where.status = status
      }

      const [chats, totalCount] = await Promise.all([
        ctx.db.chat.findMany({
          where,
          include: {
            _count: {
              select: {
                messages: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: {
            updatedAt: 'desc',
          },
        }),
        ctx.db.chat.count({ where }),
      ])

      return {
        chats,
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

  // Update chat (status, metadata, endedAt)
  update: protectedProcedure
    .input(updateChatSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Verify chat exists and user has access
      const chat = await ctx.db.chat.findFirst({
        where: {
          id,
          agent: {
            OR: [
              {
                project: {
                  members: {
                    some: {
                      userId: ctx.session.user.id,
                    },
                  },
                },
              },
              { isGlobal: true },
            ],
          },
        },
      })

      if (!chat) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Chat not found or you do not have access to it',
        })
      }

      const updatedChat = await ctx.db.chat.update({
        where: { id },
        data: updateData,
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      })

      return updatedChat
    }),

  // Delete chat
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify chat exists and user has access
      const chat = await ctx.db.chat.findFirst({
        where: {
          id: input.id,
          agent: {
            OR: [
              {
                project: {
                  members: {
                    some: {
                      userId: ctx.session.user.id,
                    },
                  },
                },
              },
              { isGlobal: true },
            ],
          },
        },
      })

      if (!chat) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Chat not found or you do not have access to it',
        })
      }

      await ctx.db.chat.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
