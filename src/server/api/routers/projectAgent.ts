import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const projectAgentRouter = createTRPCRouter({
  // Create a new project agent
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        projectId: z.string().optional(), // Optional if isGlobal = true
        type: z
          .enum(['INBOUND', 'OUTBOUND', 'PROCESS', 'RPA'])
          .default('INBOUND'),
        systemInstructions: z.string().optional(),
        isActive: z.boolean().default(true),
        isGlobal: z.boolean().default(false), // Only SUPERADMIN can set to true
      })
    )
    .mutation(async ({ ctx, input }) => {
      // If creating a global agent, only SUPERADMIN can do it
      if (input.isGlobal && ctx.session.user.role !== 'SUPERADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only SUPERADMIN can create global agents',
        })
      }

      // If not global and not SUPERADMIN, projectId is required
      // SUPERADMIN can create specific agents without projectId to assign to organizations later
      if (
        !input.isGlobal &&
        !input.projectId &&
        ctx.session.user.role !== 'SUPERADMIN'
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'projectId is required for non-global agents',
        })
      }

      // Check permissions if creating a project-specific agent (with projectId)
      if (
        !input.isGlobal &&
        input.projectId &&
        ctx.session.user.role !== 'SUPERADMIN'
      ) {
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
            message:
              "You don't have permission to create agents in this project",
          })
        }
      }

      // Create agent and default workflow in a transaction
      const result = await ctx.db.$transaction(async (tx) => {
        // Create the agent
        const agent = await tx.projectAgent.create({
          data: {
            name: input.name,
            projectId: input.isGlobal ? null : input.projectId, // Explicitly set null for global agents
            type: input.type,
            systemInstructions: input.systemInstructions,
            isActive: input.isActive,
            isGlobal: input.isGlobal,
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
        type: z.enum(['INBOUND', 'OUTBOUND', 'PROCESS', 'RPA']).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user has access to this project and get organization
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
        include: {
          organization: {
            select: { id: true },
          },
        },
      })

      if (!project) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this project",
        })
      }

      // Get organization to filter global agents
      const organization = await ctx.db.organization.findUnique({
        where: { id: project.organization.id },
        select: {
          agentPqrId: true,
          agentRrhhId: true,
          agentForecastingId: true,
          agentRrhhChatId: true,
          agentAdvisorChatId: true,
          agentAdvisorId: true,
          agentLeadsId: true,
          agentBoxClasificationId: true,
        },
      })

      // Build list of allowed global agent IDs from organization
      const allowedGlobalAgentIds = [
        organization?.agentPqrId,
        organization?.agentRrhhId,
        organization?.agentForecastingId,
        organization?.agentRrhhChatId,
        organization?.agentAdvisorChatId,
        organization?.agentAdvisorId,
        organization?.agentLeadsId,
        organization?.agentBoxClasificationId,
      ].filter((id): id is string => id !== null && id !== undefined)

      const agents = await ctx.db.projectAgent.findMany({
        where: {
          OR: [
            // Project-specific agents (cloned agents)
            { projectId: input.projectId },
            // Global agents assigned to the organization
            ...(allowedGlobalAgentIds.length > 0
              ? [{ id: { in: allowedGlobalAgentIds }, isGlobal: true }]
              : []),
          ],
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
          { isGlobal: 'desc' }, // Global agents first
          { createdAt: 'asc' },
        ],
      })

      return agents
    }),

  // Get agent by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // SUPERADMIN can access any agent
      if (ctx.session.user.role === 'SUPERADMIN') {
        const agent = await ctx.db.projectAgent.findUnique({
          where: { id: input.id },
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
              take: 10,
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
            message: 'Agent not found',
          })
        }

        return agent
      }

      // Regular users - check if user has access to this agent
      // First, get user's organization to check for assigned global agents
      const userOrganization = await ctx.db.organizationMember.findFirst({
        where: {
          userId: ctx.session.user.id,
        },
        select: {
          organization: {
            select: {
              id: true,
              agentPqrId: true,
              agentRrhhId: true,
              agentForecastingId: true,
              agentRrhhChatId: true,
              agentAdvisorChatId: true,
              agentAdvisorId: true,
              agentLeadsId: true,
              agentBoxClasificationId: true,
            },
          },
        },
      })

      // Check if this agent is assigned to user's organization
      const isAssignedGlobalAgent =
        userOrganization &&
        (userOrganization.organization.agentPqrId === input.id ||
          userOrganization.organization.agentRrhhId === input.id ||
          userOrganization.organization.agentForecastingId === input.id ||
          userOrganization.organization.agentRrhhChatId === input.id ||
          userOrganization.organization.agentAdvisorChatId === input.id ||
          userOrganization.organization.agentAdvisorId === input.id ||
          userOrganization.organization.agentLeadsId === input.id ||
          userOrganization.organization.agentBoxClasificationId === input.id)

      // Build where conditions
      const whereConditions: any[] = []

      // If it's a global agent assigned to user's org, allow access
      if (isAssignedGlobalAgent) {
        whereConditions.push({
          isGlobal: true,
          projectId: null,
        })
      } else {
        // Only check project membership if it's not a global agent
        whereConditions.push({
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
        })
      }

      const agent = await ctx.db.projectAgent.findFirst({
        where: {
          id: input.id,
          OR: whereConditions,
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
        type: z.enum(['INBOUND', 'OUTBOUND', 'PROCESS', 'RPA']).optional(),
        systemInstructions: z.string().optional(),
        isActive: z.boolean().optional(),
        modelId: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // SUPERADMIN can update any agent
      if (ctx.session.user.role === 'SUPERADMIN') {
        const agent = await ctx.db.projectAgent.findUnique({
          where: { id: input.id },
          select: { id: true, sourceAgentId: true },
        })

        if (!agent) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Agent not found',
          })
        }

        // Prepare update data
        const updateData = {
          ...(input.name && { name: input.name }),
          ...(input.type && { type: input.type }),
          ...(input.systemInstructions !== undefined && {
            systemInstructions: input.systemInstructions,
          }),
          ...(input.isActive !== undefined && { isActive: input.isActive }),
          ...(input.modelId !== undefined && { modelId: input.modelId }),
        }

        // Update the agent
        const updated = await ctx.db.projectAgent.update({
          where: { id: input.id },
          data: updateData,
          include: {
            _count: {
              select: {
                chats: true,
                files: true,
              },
            },
          },
        })

        // If this is a template (no sourceAgentId), update all clones
        if (!agent.sourceAgentId) {
          await ctx.db.projectAgent.updateMany({
            where: { sourceAgentId: input.id },
            data: updateData,
          })
        }

        return updated
      }

      // Regular users - check if user has permission to update this agent
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
      // SUPERADMIN can delete any agent
      if (ctx.session.user.role === 'SUPERADMIN') {
        const agent = await ctx.db.projectAgent.findUnique({
          where: { id: input.id },
          select: {
            id: true,
            sourceAgentId: true,
            files: true,
            chats: true,
          },
        })

        if (!agent) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Agent not found',
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

        // Check if this global agent is being used by any organizations
        const organizationsUsing = await ctx.db.organization.count({
          where: {
            OR: [
              { agentPqrId: input.id },
              { agentRrhhId: input.id },
              { agentForecastingId: input.id },
              { agentRrhhChatId: input.id },
              { agentAdvisorChatId: input.id },
              { agentAdvisorId: input.id },
              { agentLeadsId: input.id },
              { agentBoxClasificationId: input.id },
            ],
          },
        })

        if (organizationsUsing > 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Cannot delete agent. It is being used by ${organizationsUsing} organization(s). Please remove it from those organizations first.`,
          })
        }

        // If this is a template (no sourceAgentId), delete all clones first
        if (!agent.sourceAgentId) {
          await ctx.db.projectAgent.deleteMany({
            where: { sourceAgentId: input.id },
          })
        }

        // Delete the agent (cascade will handle related records)
        await ctx.db.projectAgent.delete({
          where: { id: input.id },
        })

        return { success: true, message: 'Agent deleted successfully' }
      }

      // Regular users - check if user has permission to delete this agent
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

      // Check if agent is configured in any organization
      const organizationUsing = await ctx.db.organization.findFirst({
        where: {
          OR: [
            { agentPqrId: input.id },
            { agentRrhhId: input.id },
            { agentForecastingId: input.id },
            { agentRrhhChatId: input.id },
            { agentAdvisorChatId: input.id },
            { agentAdvisorId: input.id },
            { agentLeadsId: input.id },
            { agentBoxClasificationId: input.id },
          ],
        },
      })

      if (organizationUsing) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Cannot delete agent. This agent is configured for an organization. Please remove it from the organization first.',
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

  // Get all agents (SUPERADMIN only - for admin pages)
  getAll: protectedProcedure
    .input(
      z.object({
        type: z.enum(['INBOUND', 'OUTBOUND', 'PROCESS', 'RPA']).optional(),
        isActive: z.boolean().optional(),
        isGlobal: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Only SUPERADMIN can access all agents
      if (ctx.session.user.role !== 'SUPERADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only SUPERADMIN can access all agents',
        })
      }

      // Get all agents and filter out clones (those with sourceAgentId)
      const allAgents = await ctx.db.projectAgent.findMany({
        where: {
          ...(input.type && { type: input.type }),
          ...(input.isActive !== undefined && { isActive: input.isActive }),
          ...(input.isGlobal !== undefined && { isGlobal: input.isGlobal }),
        },
        include: {
          _count: {
            select: {
              chats: true,
              files: true,
              organizationAgents: true,
            },
          },
        },
        orderBy: [
          { isGlobal: 'desc' }, // Global agents first
          { createdAt: 'desc' },
        ],
      })

      // Filter out clones (agents with sourceAgentId or projectId)
      // Only return templates (no sourceAgentId and no projectId)
      const agents = allAgents.filter(
        (agent) => !agent.sourceAgentId && !agent.projectId
      )

      return agents
    }),

  // Assign agent to organizations (SUPERADMIN only)
  assignToOrganizations: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        organizationIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only SUPERADMIN can assign agents to organizations
      if (ctx.session.user.role !== 'SUPERADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only SUPERADMIN can assign agents to organizations',
        })
      }

      // Check if agent exists and is not global
      const agent = await ctx.db.projectAgent.findUnique({
        where: { id: input.agentId },
      })

      if (!agent) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Agent not found',
        })
      }

      if (agent.isGlobal) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Cannot assign global agents to specific organizations. Global agents are visible to all organizations automatically.',
        })
      }

      // Delete existing assignments and create new ones
      await ctx.db.$transaction(async (tx) => {
        // Delete all existing assignments
        await tx.organizationAgent.deleteMany({
          where: { agentId: input.agentId },
        })

        // Create new assignments
        if (input.organizationIds.length > 0) {
          for (const orgId of input.organizationIds) {
            await tx.organizationAgent.create({
              data: {
                agentId: input.agentId,
                organizationId: orgId,
              },
            })
          }
        }
      })

      return { success: true }
    }),

  // Get organizations assigned to an agent (SUPERADMIN only)
  getAssignedOrganizations: protectedProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Only SUPERADMIN can view assignments
      if (ctx.session.user.role !== 'SUPERADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only SUPERADMIN can view agent assignments',
        })
      }

      const assignments = await ctx.db.organizationAgent.findMany({
        where: { agentId: input.agentId },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      })

      return assignments.map((a) => a.organization)
    }),
})
