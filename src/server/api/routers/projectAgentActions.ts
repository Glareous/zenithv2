import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

// Information Extractor action schemas
const yesNoQuestionSchema = z.object({
  type: z.literal('YES_NO_QUESTION'),
  input: z.string().min(1, 'Input is required'),
  description: z.string(),
})

const singleChoiceSchema = z.object({
  type: z.literal('SINGLE_CHOICE'),
  input: z.string().min(1, 'Input is required'),
  description: z.string(),
  choices: z.array(z.object({
    id: z.string(),
    text: z.string().min(1, 'Choice text is required'),
  })).min(1, 'At least one choice is required'),
})

const openQuestionSchema = z.object({
  type: z.literal('OPEN_QUESTION'),
  input: z.string().min(1, 'Input is required'),
  description: z.string(),
  outputExamples: z.array(z.object({
    id: z.string(),
    text: z.string().min(1, 'Output example text is required'),
  })).optional(),
})

const browseTemplatesSchema = z.object({
  type: z.literal('BROWSE_TEMPLATES'),
  input: z.string().min(1, 'Input is required'),
  description: z.string(),
  templateData: z.object({
    input: z.string(),
    description: z.string(),
    choices: z.array(z.object({
      id: z.string(),
      text: z.string(),
    })).optional(),
    outputExamples: z.array(z.object({
      id: z.string(),
      text: z.string(),
    })).optional(),
  }).optional(),
})

// Information Extractor main schema
const informationExtractorActionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
  data: z.discriminatedUnion('type', [
    yesNoQuestionSchema,
    singleChoiceSchema,
    openQuestionSchema,
    browseTemplatesSchema,
  ]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

// Custom Evaluation category schemas
const numericCategorySchema = z.object({
  category: z.literal('NUMERIC'),
  name: z.string().min(1, 'Name is required'),
  prompt: z.string().min(1, 'Prompt is required'),
  categoryConfig: z.object({
    expectedResult: z.number().optional(),
  }),
})

const descriptiveCategorySchema = z.object({
  category: z.literal('DESCRIPTIVE'),
  name: z.string().min(1, 'Name is required'),
  prompt: z.string().min(1, 'Prompt is required'),
  categoryConfig: z.object({
    expectedResult: z.string().optional(),
  }),
})

const successEvalRubricCategorySchema = z.object({
  category: z.literal('SUCCESS_EVAL_RUBRIC'),
  name: z.string().min(1, 'Name is required'),
  prompt: z.string().min(1, 'Prompt is required'),
  categoryConfig: z.object({
    expectedResult: z.string().optional(),
  }),
})

const passFailCategorySchema = z.object({
  category: z.literal('PASS_FAIL'),
  name: z.string().min(1, 'Name is required'),
  prompt: z.string().min(1, 'Prompt is required'),
  categoryConfig: z.object({
    expectedResult: z.string().optional(),
  }),
})

// Custom Evaluation main schema
const customEvaluationActionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
  data: z.discriminatedUnion('category', [
    numericCategorySchema,
    descriptiveCategorySchema,
    successEvalRubricCategorySchema,
    passFailCategorySchema,
  ]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

// After Call Actions schema
const afterCallActionsSchema = z.object({
  informationExtractor: z.array(informationExtractorActionSchema).default([]),
  customEvaluation: z.array(customEvaluationActionSchema).default([]),
})

// Main ProjectAgentActions schema
const projectAgentActionsSchema = z.object({
  id: z.string().optional(),
  agentId: z.string(),
  afterCallActions: afterCallActionsSchema.optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

// Upsert input schema
const actionsUpsertSchema = z.object({
  agentId: z.string(),
  actions: z.object({
    afterCallActions: afterCallActionsSchema.optional(),
  }),
})

export const projectAgentActionsRouter = createTRPCRouter({
  getByAgentId: protectedProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ ctx, input }) => {
      // First get the agent to verify access and get project ID
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
          name: true,
        },
      })

      if (!agent) {
        throw new Error('Agent not found or access denied')
      }

      const actions = await ctx.db.projectAgentActions.findUnique({
        where: {
          agentId: input.agentId,
        },
      })

      if (!actions) {
        // Return default empty actions structure
        return {
          id: null,
          agentId: input.agentId,
          projectId: agent.projectId,
          afterCallActions: {
            informationExtractor: [],
            customEvaluation: [],
          },
          createdAt: null,
          updatedAt: null,
        }
      }

      return {
        id: actions.id,
        agentId: actions.agentId,
        projectId: agent.projectId,
        afterCallActions: actions.afterCallActions || {
          informationExtractor: [],
          customEvaluation: [],
        },
        createdAt: actions.createdAt,
        updatedAt: actions.updatedAt,
      }
    }),

  upsert: protectedProcedure
    .input(actionsUpsertSchema)
    .mutation(async ({ ctx, input }) => {
      const { agentId, actions } = input

      // Verify that the agent exists and user has access to it
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

      const upsertedActions = await ctx.db.projectAgentActions.upsert({
        where: {
          agentId,
        },
        update: {
          afterCallActions: actions.afterCallActions,
        },
        create: {
          agentId,
          afterCallActions: actions.afterCallActions,
        },
      })

      return upsertedActions
    }),

  // Future procedure for updating specific action phases
  updateAfterCallActions: protectedProcedure
    .input(z.object({
      agentId: z.string(),
      afterCallActions: afterCallActionsSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify agent access
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
      })

      if (!agent) {
        throw new Error('Agent not found or access denied')
      }

      const updatedActions = await ctx.db.projectAgentActions.upsert({
        where: {
          agentId: input.agentId,
        },
        update: {
          afterCallActions: input.afterCallActions,
        },
        create: {
          agentId: input.agentId,
          afterCallActions: input.afterCallActions,
        },
      })

      return updatedActions
    }),
})

// Export types for frontend use
export type InformationExtractorAction = z.infer<typeof informationExtractorActionSchema>
export type CustomEvaluationAction = z.infer<typeof customEvaluationActionSchema>
export type AfterCallActions = z.infer<typeof afterCallActionsSchema>
export type ProjectAgentActions = z.infer<typeof projectAgentActionsSchema>
export type ActionsUpsert = z.infer<typeof actionsUpsertSchema>