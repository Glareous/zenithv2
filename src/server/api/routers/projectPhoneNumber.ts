import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '../trpc'

export const projectPhoneNumberRouter = createTRPCRouter({
  // Assign phone numbers to a project (ADMIN or OWNER)
  assignToProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        phoneNumberIds: z.array(z.string()), // Array of phone number IDs to assign
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { projectId, phoneNumberIds } = input

      // Get project with organization
      const project = await ctx.db.project.findUnique({
        where: { id: projectId },
        include: { organization: true },
      })

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        })
      }

      // Verify user has admin permissions (OWNER or project ADMIN)
      const isOwner = project.organization.ownerId === ctx.session.user.id
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId,
          userId: ctx.session.user.id,
          role: 'ADMIN',
        },
      })

      if (!isOwner && !projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only organization owners or project admins can assign phone numbers',
        })
      }

      // Verify all phone numbers belong to the same organization
      const phoneNumbers = await ctx.db.phoneNumber.findMany({
        where: {
          id: { in: phoneNumberIds },
          organizationId: project.organizationId,
        },
      })

      if (phoneNumbers.length !== phoneNumberIds.length) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Some phone numbers do not belong to this organization',
        })
      }

      // Remove all existing assignments for this project
      await ctx.db.projectPhoneNumber.deleteMany({
        where: { projectId },
      })

      // Create new assignments
      const assignments = await ctx.db.projectPhoneNumber.createMany({
        data: phoneNumberIds.map((phoneNumberId) => ({
          projectId,
          phoneNumberId,
          isActiveInProject: true,
        })),
      })

      return { success: true, count: assignments.count }
    }),

  // Get assigned phone numbers for a project
  getByProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { projectId } = input

      // Verify user has access to the project
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId,
          userId: ctx.session.user.id,
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this project',
        })
      }

      const assignments = await ctx.db.projectPhoneNumber.findMany({
        where: { projectId },
        include: {
          phoneNumber: {
            include: {
              createdBy: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return assignments
    }),

  // Get affected agents when deactivating a phone number
  getAffectedAgents: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        phoneNumberId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { projectId, phoneNumberId } = input

      // Verify user has access to the project
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId,
          userId: ctx.session.user.id,
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this project',
        })
      }

      // Find the ProjectPhoneNumber assignment with its active triggers
      const projectPhoneNumber = await ctx.db.projectPhoneNumber.findUnique({
        where: {
          projectId_phoneNumberId: {
            projectId,
            phoneNumberId,
          },
        },
        include: {
          agentTriggers: {
            where: {
              isActive: true,
            },
            include: {
              agentActions: {
                include: {
                  agent: {
                    select: {
                      id: true,
                      name: true,
                      type: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      if (!projectPhoneNumber) {
        return []
      }

      // Map to simplified format
      const affectedAgents = projectPhoneNumber.agentTriggers.map((trigger) => ({
        agentId: trigger.agentActions.agent.id,
        agentName: trigger.agentActions.agent.name,
        agentType: trigger.agentActions.agent.type,
        triggerType: trigger.type,
        triggerId: trigger.id,
      }))

      return affectedAgents
    }),

  // Toggle active status of a phone number in a project
  toggleActiveInProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        phoneNumberId: z.string(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { projectId, phoneNumberId, isActive } = input

      // Get project with organization
      const project = await ctx.db.project.findUnique({
        where: { id: projectId },
        include: { organization: true },
      })

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        })
      }

      // Verify user has admin permissions
      const isOwner = project.organization.ownerId === ctx.session.user.id
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId,
          userId: ctx.session.user.id,
          role: 'ADMIN',
        },
      })

      if (!isOwner && !projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only organization owners or project admins can manage phone numbers',
        })
      }

      // Find the ProjectPhoneNumber to get its triggers
      const projectPhoneNumber = await ctx.db.projectPhoneNumber.findUnique({
        where: {
          projectId_phoneNumberId: {
            projectId,
            phoneNumberId,
          },
        },
        include: {
          agentTriggers: {
            where: {
              isActive: true,
            },
          },
        },
      })

      if (!projectPhoneNumber) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Phone number assignment not found',
        })
      }

      // If deactivating, deactivate all related triggers
      let deactivatedTriggersCount = 0
      if (!isActive && projectPhoneNumber.agentTriggers.length > 0) {
        const result = await ctx.db.projectAgentTrigger.updateMany({
          where: {
            projectPhoneNumberId: projectPhoneNumber.id,
            isActive: true,
          },
          data: {
            isActive: false,
          },
        })
        deactivatedTriggersCount = result.count
      }

      // Update the assignment
      await ctx.db.projectPhoneNumber.update({
        where: {
          id: projectPhoneNumber.id,
        },
        data: {
          isActiveInProject: isActive,
        },
      })

      return { success: true, deactivatedTriggersCount }
    }),

  // Remove phone number from project
  removeFromProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        phoneNumberId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { projectId, phoneNumberId } = input

      // Get project with organization
      const project = await ctx.db.project.findUnique({
        where: { id: projectId },
        include: { organization: true },
      })

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        })
      }

      // Verify user has admin permissions
      const isOwner = project.organization.ownerId === ctx.session.user.id
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId,
          userId: ctx.session.user.id,
          role: 'ADMIN',
        },
      })

      if (!isOwner && !projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only organization owners or project admins can manage phone numbers',
        })
      }

      // Delete the assignment
      await ctx.db.projectPhoneNumber.deleteMany({
        where: {
          projectId,
          phoneNumberId,
        },
      })

      return { success: true }
    }),

  // Get available phone numbers for a project (not yet assigned)
  getAvailableForProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { projectId } = input

      // Get project with organization
      const project = await ctx.db.project.findUnique({
        where: { id: projectId },
        include: { organization: true },
      })

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        })
      }

      // Verify user has access to the project
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId,
          userId: ctx.session.user.id,
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this project',
        })
      }

      // Get all phone numbers from the organization
      const allPhoneNumbers = await ctx.db.phoneNumber.findMany({
        where: {
          organizationId: project.organizationId,
          isActive: true,
        },
        include: {
          projectAssignments: {
            where: { projectId },
          },
        },
      })

      return allPhoneNumbers
    }),
})