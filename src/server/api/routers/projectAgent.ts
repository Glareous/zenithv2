import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const projectAgentRouter = createTRPCRouter({
  // Create a new project agent
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        projectId: z.string(),
        type: z
          .enum(['INBOUND', 'OUTBOUND', 'PROCESS', 'RPA'])
          .default('INBOUND'),
        systemInstructions: z.string().optional(),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to create agents in this project
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.projectId,
          OR: [
            // User is project admin
            {
              members: {
                some: {
                  userId: ctx.session.user.id,
                  role: 'ADMIN',
                },
              },
            },
            // User is organization owner/admin
            {
              organization: {
                members: {
                  some: {
                    userId: ctx.session.user.id,
                    role: { in: ['OWNER', 'ADMIN'] },
                  },
                },
              },
            },
          ],
        },
      })

      if (!project) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have permission to create agents in this project",
        })
      }

      // Create agent and default workflow in a transaction
      const result = await ctx.db.$transaction(async (tx) => {
        // Create the agent
        const agent = await tx.projectAgent.create({
          data: {
            name: input.name,
            projectId: input.projectId,
            type: input.type,
            systemInstructions: input.systemInstructions,
            isActive: input.isActive,
          },
          include: {
            _count: {
              select: {
                chats: true,
                files: true,
              },
            },
          },
        })

        // Create default workflow for this agent
        await tx.projectAgentWorkflow.create({
          data: {
            name: `${input.name} Workflow`,
            instructions:
              input.systemInstructions ||
              `Default instructions for ${input.name}`,
            globalFaqs: [],
            globalObjections: [],
            nodes: [],
            edges: [],
            agentId: agent.id,
          },
        })

        return agent
      })

      return result
    }),

  // Get all agents for a project
  getByProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        type: z
          .enum(['INBOUND', 'OUTBOUND', 'PROCESS', 'RPA'])
          .optional(),
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user has access to this project
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.projectId,
          OR: [
            // User is a project member
            {
              members: {
                some: {
                  userId: ctx.session.user.id,
                },
              },
            },
            // User is organization owner/admin
            {
              organization: {
                members: {
                  some: {
                    userId: ctx.session.user.id,
                    role: { in: ['OWNER', 'ADMIN'] },
                  },
                },
              },
            },
          ],
        },
      })

      if (!project) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this project",
        })
      }

      const agents = await ctx.db.projectAgent.findMany({
        where: {
          projectId: input.projectId,
          ...(input.type && { type: input.type }),
          ...(input.isActive !== undefined && { isActive: input.isActive }),
        },
        include: {
          _count: {
            select: {
              chats: true,
              files: true,
            },
          },
        },
        orderBy: [
          {
            createdAt: 'asc',
          },
        ],
      })

      return agents
    }),

  // Get agent by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user has access to this agent
      const agent = await ctx.db.projectAgent.findFirst({
        where: {
          id: input.id,
          project: {
            OR: [
              // User is a project member
              {
                members: {
                  some: {
                    userId: ctx.session.user.id,
                  },
                },
              },
              // User is organization owner/admin
              {
                organization: {
                  members: {
                    some: {
                      userId: ctx.session.user.id,
                      role: { in: ['OWNER', 'ADMIN'] },
                    },
                  },
                },
              },
            ],
          },
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              organization: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          files: {
            include: {
              uploadedBy: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          chats: {
            include: {
              _count: {
                select: {
                  messages: true,
                },
              },
            },
            orderBy: {
              updatedAt: 'desc',
            },
            take: 10, // Limit to recent chats
          },
          _count: {
            select: {
              chats: true,
              files: true,
            },
          },
        },
      })

      if (!agent) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "Agent not found or you don't have access to it",
        })
      }

      return agent
    }),

  // Update agent
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        type: z
          .enum(['INBOUND', 'OUTBOUND', 'PROCESS', 'RPA'])
          .optional(),
        systemInstructions: z.string().optional(),
        isActive: z.boolean().optional(),
        modelId: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to update this agent
      const agent = await ctx.db.projectAgent.findFirst({
        where: {
          id: input.id,
          project: {
            OR: [
              // User is project admin
              {
                members: {
                  some: {
                    userId: ctx.session.user.id,
                    role: 'ADMIN',
                  },
                },
              },
              // User is organization owner/admin
              {
                organization: {
                  members: {
                    some: {
                      userId: ctx.session.user.id,
                      role: { in: ['OWNER', 'ADMIN'] },
                    },
                  },
                },
              },
            ],
          },
        },
      })

      if (!agent) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have permission to update this agent",
        })
      }

      const updatedAgent = await ctx.db.projectAgent.update({
        where: { id: input.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.type && { type: input.type }),
          ...(input.systemInstructions !== undefined && {
            systemInstructions: input.systemInstructions,
          }),
          ...(input.isActive !== undefined && { isActive: input.isActive }),
          ...(input.modelId !== undefined && { modelId: input.modelId }),
        },
        include: {
          _count: {
            select: {
              chats: true,
              files: true,
            },
          },
        },
      })

      return updatedAgent
    }),

  // Delete agent
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to delete this agent
      const agent = await ctx.db.projectAgent.findFirst({
        where: {
          id: input.id,
          project: {
            OR: [
              // User is project admin
              {
                members: {
                  some: {
                    userId: ctx.session.user.id,
                    role: 'ADMIN',
                  },
                },
              },
              // User is organization owner/admin
              {
                organization: {
                  members: {
                    some: {
                      userId: ctx.session.user.id,
                      role: { in: ['OWNER', 'ADMIN'] },
                    },
                  },
                },
              },
            ],
          },
        },
        include: {
          files: true,
          chats: true,
        },
      })

      if (!agent) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have permission to delete this agent",
        })
      }

      // Check if agent has active chats
      const activeChats = await ctx.db.chat.count({
        where: {
          agentId: input.id,
          status: 'ACTIVE',
        },
      })

      if (activeChats > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Cannot delete agent with active chats. Please close all chats first.',
        })
      }

      // Check if agent is configured as PQR agent in any project
      const projectsUsingAsPQR = await ctx.db.project.findFirst({
        where: { pqrAgentId: input.id },
      })

      if (projectsUsingAsPQR) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Cannot delete agent. This agent is configured for PQR analysis. Please change the PQR agent configuration first.',
        })
      }

      // Delete the agent and all related data in a transaction
      try {
        await ctx.db.$transaction(async (tx) => {
          // Delete agent files (cascade will handle this, but we do it explicitly for logging)
          await tx.projectAgentFile.deleteMany({
            where: { agentId: input.id },
          })

          // Delete messages for all chats (cascade will handle this)
          await tx.message.deleteMany({
            where: {
              chat: {
                agentId: input.id,
              },
            },
          })

          // Delete chats
          await tx.chat.deleteMany({
            where: { agentId: input.id },
          })

          // Delete the agent
          await tx.projectAgent.delete({
            where: { id: input.id },
          })
        })

        return { success: true }
      } catch (error: any) {
        if (error?.code === 'P2003') {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message:
              'Cannot delete agent due to existing dependencies. Please remove all related data first.',
          })
        }

        if (error?.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Agent not found or has already been deleted.',
          })
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            'Failed to delete agent. Please try again or contact support.',
        })
      }
    }),

  // Toggle agent active status
  toggleActive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to update this agent
      const agent = await ctx.db.projectAgent.findFirst({
        where: {
          id: input.id,
          project: {
            OR: [
              // User is project admin
              {
                members: {
                  some: {
                    userId: ctx.session.user.id,
                    role: 'ADMIN',
                  },
                },
              },
              // User is organization owner/admin
              {
                organization: {
                  members: {
                    some: {
                      userId: ctx.session.user.id,
                      role: { in: ['OWNER', 'ADMIN'] },
                    },
                  },
                },
              },
            ],
          },
        },
      })

      if (!agent) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have permission to update this agent",
        })
      }

      const updatedAgent = await ctx.db.projectAgent.update({
        where: { id: input.id },
        data: {
          isActive: !agent.isActive,
        },
        include: {
          _count: {
            select: {
              chats: true,
              files: true,
            },
          },
        },
      })

      return updatedAgent
    }),

  // Get agent types
  getTypes: protectedProcedure.query(() => {
    return [
      { value: 'INBOUND', label: 'Inbound Agent' },
      { value: 'OUTBOUND', label: 'Outbound Agent' },
      { value: 'PROCESS', label: 'Process Agent' },
      { value: 'RPA', label: 'RPA Agent' },
    ]
  }),
})
