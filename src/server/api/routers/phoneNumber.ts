import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '../trpc'

export const phoneNumberRouter = createTRPCRouter({
  // Create phone number (OWNER only)
  create: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        provider: z.enum(['TWILIO', 'TELNYX', 'RINGCENTRAL', 'CUSTOM']),
        phoneNumber: z.string().min(1, 'Phone number is required'),
        countryCode: z.string().min(1, 'Country code is required'),
        friendlyName: z.string().optional(),
        sipDomain: z.string().optional(),
        username: z.string().optional(),
        password: z.string().optional(),
        outboundProxy: z.string().optional(),
        authUsername: z.string().optional(),
        originationUri: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { organizationId, ...data } = input

      // Get organization info
      const organization = await ctx.db.organization.findUnique({
        where: { id: organizationId },
      })

      if (!organization) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        })
      }

      // Verify user is OWNER of the organization
      if (organization.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only organization owners can create phone numbers',
        })
      }

      // Create phone number
      const phoneNumber = await ctx.db.phoneNumber.create({
        data: {
          ...data,
          organizationId,
          createdById: ctx.session.user.id,
        },
      })

      return phoneNumber
    }),

  // Get all phone numbers by organization (all organization members can view)
  getByOrganization: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { organizationId } = input

      // Verify user is member of the organization
      const organizationMember = await ctx.db.organizationMember.findFirst({
        where: {
          organizationId,
          userId: ctx.session.user.id,
        },
      })

      // Also check if user is the owner
      const organization = await ctx.db.organization.findUnique({
        where: { id: organizationId },
      })

      const isOwner = organization?.ownerId === ctx.session.user.id

      if (!organizationMember && !isOwner) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this organization',
        })
      }

      const phoneNumbers = await ctx.db.phoneNumber.findMany({
        where: { organizationId },
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
        orderBy: { createdAt: 'desc' },
      })

      return phoneNumbers
    }),

  // Get phone number by ID (all organization members can view)
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input

      const phoneNumber = await ctx.db.phoneNumber.findUnique({
        where: { id },
        include: {
          organization: true,
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      })

      if (!phoneNumber) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Phone number not found',
        })
      }

      // Verify user is member of the organization or owner
      const organizationMember = await ctx.db.organizationMember.findFirst({
        where: {
          organizationId: phoneNumber.organizationId,
          userId: ctx.session.user.id,
        },
      })

      const isOwner = phoneNumber.organization.ownerId === ctx.session.user.id

      if (!organizationMember && !isOwner) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this organization',
        })
      }

      return phoneNumber
    }),

  // Update phone number (OWNER only)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        provider: z.enum(['TWILIO', 'TELNYX', 'RINGCENTRAL', 'CUSTOM']).optional(),
        phoneNumber: z.string().min(1, 'Phone number is required').optional(),
        countryCode: z.string().min(1, 'Country code is required').optional(),
        friendlyName: z.string().optional(),
        sipDomain: z.string().optional(),
        username: z.string().optional(),
        password: z.string().optional(),
        outboundProxy: z.string().optional(),
        authUsername: z.string().optional(),
        originationUri: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      // Get phone number with organization info
      const existingPhoneNumber = await ctx.db.phoneNumber.findUnique({
        where: { id },
        include: {
          organization: true,
        },
      })

      if (!existingPhoneNumber) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Phone number not found',
        })
      }

      // Verify user is OWNER of the organization
      if (existingPhoneNumber.organization.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only organization owners can update phone numbers',
        })
      }

      // Update phone number
      const updatedPhoneNumber = await ctx.db.phoneNumber.update({
        where: { id },
        data,
      })

      return updatedPhoneNumber
    }),

  // Delete phone number (OWNER only)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input

      // Get phone number with organization info
      const existingPhoneNumber = await ctx.db.phoneNumber.findUnique({
        where: { id },
        include: {
          organization: true,
        },
      })

      if (!existingPhoneNumber) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Phone number not found',
        })
      }

      // Verify user is OWNER of the organization
      if (existingPhoneNumber.organization.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only organization owners can delete phone numbers',
        })
      }

      // Delete phone number
      await ctx.db.phoneNumber.delete({
        where: { id },
      })

      return { success: true }
    }),

  // Check if user is owner (helper for frontend)
  checkIsOwner: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { organizationId } = input

      const organization = await ctx.db.organization.findUnique({
        where: { id: organizationId },
      })

      if (!organization) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        })
      }

      const isOwner = organization.ownerId === ctx.session.user.id

      return { isOwner }
    }),

  // Get all projects and triggers using a phone number (for deletion warning)
  getUsageByPhoneNumber: protectedProcedure
    .input(z.object({ phoneNumberId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { phoneNumberId } = input

      // Verify phone number exists and user has access
      const phoneNumber = await ctx.db.phoneNumber.findUnique({
        where: { id: phoneNumberId },
        include: { organization: true },
      })

      if (!phoneNumber) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Phone number not found',
        })
      }

      // Verify user is owner
      if (phoneNumber.organization.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only organization owners can check phone number usage',
        })
      }

      // Find all project assignments with their triggers
      const projectAssignments = await ctx.db.projectPhoneNumber.findMany({
        where: {
          phoneNumberId,
          isActiveInProject: true,
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
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

      // Map to format expected by frontend
      const projectsWithTriggers = projectAssignments.map((assignment) => ({
        projectId: assignment.project.id,
        projectName: assignment.project.name,
        triggers: assignment.agentTriggers.map((trigger) => ({
          agentId: trigger.agentActions.agent.id,
          agentName: trigger.agentActions.agent.name,
          agentType: trigger.agentActions.agent.type,
          triggerType: trigger.type,
          triggerId: trigger.id,
        })),
      }))

      const totalTriggers = projectAssignments.reduce(
        (sum, assignment) => sum + assignment.agentTriggers.length,
        0
      )

      return {
        projectAssignments: projectAssignments.map((p) => ({
          projectId: p.project.id,
          projectName: p.project.name,
        })),
        projectsWithTriggers,
        totalProjects: projectAssignments.length,
        totalTriggers,
      }
    }),
})