import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { scheduleAgentCronJob, cancelAgentCronJob } from '@/server/services/agenda'

// Trigger type enum
const triggerTypeSchema = z.enum(['WHATSAPP_MESSAGE', 'WHATSAPP_CALL', 'PHONE_CALL', 'WEBHOOK', 'CRON_JOB', 'MCP_PROTOCOL'])

// Webhook variable schema
const webhookVariableSchema = z.object({
  id: z.string(),
  key: z.string(),
  type: z.enum(['STRING', 'NUMBER', 'BOOLEAN']),
  value: z.string(),
})

// Webhook config schema
const webhookConfigSchema = z.object({
  requestBody: z.string(),
  variables: z.array(webhookVariableSchema),
})

// Upsert trigger input schema
const upsertTriggerSchema = z.object({
  agentId: z.string(),
  type: triggerTypeSchema,
  projectPhoneNumberId: z.string().optional(), // Optional - only for phone-based triggers
  cronExpression: z.string().optional(), // For CRON_JOB triggers
  cronTimezone: z.string().optional(), // Timezone for CRON_JOB triggers
  webhookConfig: webhookConfigSchema.optional(), // For WEBHOOK triggers
})

// Delete trigger input schema
const deleteTriggerSchema = z.object({
  agentId: z.string(),
  type: triggerTypeSchema,
})

// Get triggers by agent input schema
const getByAgentSchema = z.object({
  agentId: z.string(),
})

export const projectAgentTriggerRouter = createTRPCRouter({
  // Get all triggers for an agent
  getByAgentId: protectedProcedure
    .input(getByAgentSchema)
    .query(async ({ ctx, input }) => {
      // First verify the agent exists and user has access
      const agent = await ctx.db.projectAgent.findFirst({
        where: {
          id: input.agentId,
          project: {
            OR: [
              { createdById: ctx.session.user.id },
              {
                members: {
                  some: {
                    userId: ctx.session.user.id,
                  },
                },
              },
            ],
          },
        },
        select: {
          id: true,
          projectId: true,
        },
      })

      if (!agent) {
        throw new Error('Agent not found or access denied')
      }

      // Get or create agent actions
      const agentActions = await ctx.db.projectAgentActions.findUnique({
        where: { agentId: input.agentId },
        include: {
          triggers: {
            include: {
              projectPhoneNumber: {
                select: {
                  id: true,
                  phoneNumber: {
                    select: {
                      id: true,
                      phoneNumber: true,
                      countryCode: true,
                      friendlyName: true,
                      provider: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      // If no actions exist, return empty triggers
      if (!agentActions) {
        return []
      }

      return agentActions.triggers
    }),

  // Upsert trigger (create or update)
  upsert: protectedProcedure
    .input(upsertTriggerSchema)
    .mutation(async ({ ctx, input }) => {
      const { agentId, type, projectPhoneNumberId, cronExpression, cronTimezone, webhookConfig } = input

      // Validate required fields based on trigger type
      if ((type === 'WHATSAPP_MESSAGE' || type === 'WHATSAPP_CALL' || type === 'PHONE_CALL') && !projectPhoneNumberId) {
        throw new Error('Phone number is required for phone-based triggers')
      }
      if (type === 'CRON_JOB' && !cronExpression) {
        throw new Error('Cron expression is required for CRON_JOB triggers')
      }
      if (type === 'WEBHOOK' && !webhookConfig) {
        throw new Error('Webhook configuration is required for WEBHOOK triggers')
      }

      // Verify agent exists and user has access
      const agent = await ctx.db.projectAgent.findFirst({
        where: {
          id: agentId,
          project: {
            OR: [
              { createdById: ctx.session.user.id },
              {
                members: {
                  some: {
                    userId: ctx.session.user.id,
                  },
                },
              },
            ],
          },
        },
        select: {
          id: true,
          projectId: true,
        },
      })

      if (!agent) {
        throw new Error('Agent not found or access denied')
      }

      // Verify ProjectPhoneNumber exists for phone-based triggers
      let projectPhoneNumber = null
      if (type === 'WHATSAPP_MESSAGE' || type === 'WHATSAPP_CALL' || type === 'PHONE_CALL') {
        projectPhoneNumber = await ctx.db.projectPhoneNumber.findFirst({
          where: {
            id: projectPhoneNumberId,
            projectId: agent.projectId,
            isActiveInProject: true,
          },
        })

        if (!projectPhoneNumber) {
          throw new Error('Phone number not found or not active in this project')
        }
      }

      // Get or create agent actions
      let agentActions = await ctx.db.projectAgentActions.findUnique({
        where: { agentId },
      })

      if (!agentActions) {
        agentActions = await ctx.db.projectAgentActions.create({
          data: {
            agentId,
          },
        })
      }

      // Upsert the trigger
      const trigger = await ctx.db.projectAgentTrigger.upsert({
        where: {
          agentActionsId_type: {
            agentActionsId: agentActions.id,
            type,
          },
        },
        update: {
          projectPhoneNumberId,
          ...(cronExpression && { cronExpression }),
          ...(cronTimezone && { cronTimezone }),
          ...(webhookConfig && { webhookConfig }),
          isActive: true,
        },
        create: {
          agentActionsId: agentActions.id,
          type,
          projectPhoneNumberId,
          ...(cronExpression && { cronExpression }),
          ...(cronTimezone && { cronTimezone }),
          ...(webhookConfig && { webhookConfig }),
          isActive: true,
        },
        include: {
          projectPhoneNumber: {
            select: {
              id: true,
              phoneNumber: {
                select: {
                  id: true,
                  phoneNumber: true,
                  countryCode: true,
                  friendlyName: true,
                  provider: true,
                },
              },
            },
          },
        },
      })

      // If CRON_JOB, schedule it with Agenda
      if (type === 'CRON_JOB' && cronExpression && trigger.isActive) {
        await scheduleAgentCronJob(
          agentId,
          trigger.id,
          cronExpression,
          cronTimezone || 'UTC'
        )
      }

      return trigger
    }),

  // Delete trigger
  delete: protectedProcedure
    .input(deleteTriggerSchema)
    .mutation(async ({ ctx, input }) => {
      const { agentId, type } = input

      // Verify agent exists and user has access
      const agent = await ctx.db.projectAgent.findFirst({
        where: {
          id: agentId,
          project: {
            OR: [
              { createdById: ctx.session.user.id },
              {
                members: {
                  some: {
                    userId: ctx.session.user.id,
                  },
                },
              },
            ],
          },
        },
      })

      if (!agent) {
        throw new Error('Agent not found or access denied')
      }

      // Get agent actions
      const agentActions = await ctx.db.projectAgentActions.findUnique({
        where: { agentId },
      })

      if (!agentActions) {
        throw new Error('Agent actions not found')
      }

      // Get trigger to cancel CRON job if needed
      const trigger = await ctx.db.projectAgentTrigger.findUnique({
        where: {
          agentActionsId_type: {
            agentActionsId: agentActions.id,
            type,
          },
        },
      })

      // Delete the trigger
      await ctx.db.projectAgentTrigger.deleteMany({
        where: {
          agentActionsId: agentActions.id,
          type,
        },
      })

      // If CRON_JOB, cancel it from Agenda
      if (type === 'CRON_JOB' && trigger) {
        await cancelAgentCronJob(trigger.id)
      }

      // If WEBHOOK, delete the associated ProjectAction
      if (type === 'WEBHOOK') {
        await ctx.db.projectAction.deleteMany({
          where: {
            agentId: agentId,
            actionType: 'WEBHOOK',
          },
        })
      }

      return { success: true }
    }),

  // Toggle trigger active status
  toggleActive: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        type: triggerTypeSchema,
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { agentId, type, isActive } = input

      // Verify agent exists and user has access
      const agent = await ctx.db.projectAgent.findFirst({
        where: {
          id: agentId,
          project: {
            OR: [
              { createdById: ctx.session.user.id },
              {
                members: {
                  some: {
                    userId: ctx.session.user.id,
                  },
                },
              },
            ],
          },
        },
      })

      if (!agent) {
        throw new Error('Agent not found or access denied')
      }

      // Get agent actions
      const agentActions = await ctx.db.projectAgentActions.findUnique({
        where: { agentId },
      })

      if (!agentActions) {
        throw new Error('Agent actions not found')
      }

      // Update the trigger
      const trigger = await ctx.db.projectAgentTrigger.updateMany({
        where: {
          agentActionsId: agentActions.id,
          type,
        },
        data: {
          isActive,
        },
      })

      return { success: true }
    }),
})

// Export types for frontend use
export type TriggerType = z.infer<typeof triggerTypeSchema>
export type UpsertTriggerInput = z.infer<typeof upsertTriggerSchema>
export type DeleteTriggerInput = z.infer<typeof deleteTriggerSchema>
