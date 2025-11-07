import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

// Node variant types
const nodeVariantSchema = z.enum(['default', 'end', 'jump', 'branch'])

// Action schema for embedded actions in nodes
const workflowActionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  order: z.number().optional(),
  apiUrl: z.string().optional(),
  actionType: z.enum(['CUSTOM', 'AGENT', 'MCP', 'DATABASE']).optional(),
})

// FAQ schema for embedded FAQs in nodes
const workflowFaqSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
})

// Objection schema for embedded objections in nodes
const workflowObjectionSchema = z.object({
  id: z.string(),
  case: z.string(),
  instructions: z.string(),
})

// Product schema for embedded products in nodes
const workflowProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number().optional(),
  categories: z.array(z.object({
    name: z.string(),
  })).optional(),
})

// Service schema for embedded services in nodes
const workflowServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number().optional(),
  categories: z.array(z.object({
    name: z.string(),
  })).optional(),
})

// Node schema with all variants and embedded data
const workflowNodeSchema = z.object({
  id: z.string(),
  type: z.string().default('cardStep'),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.object({
    variant: nodeVariantSchema,
    label: z.string(),
    requireUserResponse: z.boolean().optional(),
    instructions: z.string().optional(),
    instructionsDetailed: z.string().optional(),
    hasInstructions: z.boolean().default(false),
    // Jump variant specific
    targetNodeId: z.string().optional(),
    // Branch variant specific
    branches: z
      .array(
        z.object({
          id: z.string(),
          label: z.string(),
          condition: z.string().optional(),
        })
      )
      .optional(),
    // Embedded arrays for each node
    actions: z.array(workflowActionSchema).default([]),
    faqs: z.array(workflowFaqSchema).default([]),
    objections: z.array(workflowObjectionSchema).default([]),
    products: z.array(workflowProductSchema).default([]),
    services: z.array(workflowServiceSchema).default([]),
  }),
})

// Edge schema with styling and animation properties
const workflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  type: z.string().optional(),
  animated: z.boolean().default(true),
  style: z
    .object({
      stroke: z.string().optional(),
      strokeWidth: z.number().optional(),
    })
    .optional(),
  label: z.string().optional(),
  labelStyle: z
    .object({
      fill: z.string().optional(),
      fontWeight: z.number().optional(),
    })
    .optional(),
})

// Global settings schemas
const globalActionsSchema = z.array(workflowActionSchema).default([])
const globalFaqsSchema = z.array(workflowFaqSchema).default([])
const globalObjectionsSchema = z.array(workflowObjectionSchema).default([])

// Complete workflow schema
const workflowSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  globalActions: globalActionsSchema,
  globalFaqs: globalFaqsSchema,
  globalObjections: globalObjectionsSchema,
  nodes: z.array(workflowNodeSchema),
  edges: z.array(workflowEdgeSchema),
  positionX: z.number().default(250),
  positionY: z.number().default(25),
})

// Workflow upsert input schema
const workflowUpsertSchema = z.object({
  agentId: z.string(),
  workflow: workflowSchema,
})

export const projectAgentWorkflowRouter = createTRPCRouter({
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

      const workflow = await ctx.db.projectAgentWorkflow.findUnique({
        where: {
          agentId: input.agentId,
        },
      })

      if (!workflow) {
        // Return default empty workflow structure with project ID
        return {
          id: null,
          agentId: input.agentId,
          projectId: agent.projectId,
          name: null,
          description: null,
          instructions: null,
          globalActions: [],
          globalFaqs: [],
          globalObjections: [],
          nodes: [],
          edges: [],
          positionX: 250,
          positionY: 25,
          createdAt: null,
          updatedAt: null,
        }
      }

      return {
        id: workflow.id,
        agentId: workflow.agentId,
        projectId: agent.projectId,
        name: workflow.name,
        description: workflow.description,
        instructions: workflow.instructions,
        globalActions: workflow.globalActions || [],
        globalFaqs: workflow.globalFaqs || [],
        globalObjections: workflow.globalObjections || [],
        nodes: workflow.nodes || [],
        edges: workflow.edges || [],
        positionX: workflow.positionX,
        positionY: workflow.positionY,
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt,
      }
    }),

  upsert: protectedProcedure
    .input(workflowUpsertSchema)
    .mutation(async ({ ctx, input }) => {
      const { agentId, workflow } = input

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

      const upsertedWorkflow = await ctx.db.projectAgentWorkflow.upsert({
        where: {
          agentId,
        },
        update: {
          name: workflow.name,
          description: workflow.description,
          instructions: workflow.instructions,
          globalActions: workflow.globalActions,
          globalFaqs: workflow.globalFaqs,
          globalObjections: workflow.globalObjections,
          nodes: workflow.nodes,
          edges: workflow.edges,
          positionX: workflow.positionX,
          positionY: workflow.positionY,
        },
        create: {
          agentId,
          name: workflow.name,
          description: workflow.description,
          instructions: workflow.instructions,
          globalActions: workflow.globalActions,
          globalFaqs: workflow.globalFaqs,
          globalObjections: workflow.globalObjections,
          nodes: workflow.nodes,
          edges: workflow.edges,
          positionX: workflow.positionX,
          positionY: workflow.positionY,
        },
      })

      return upsertedWorkflow
    }),
})

// Export types for frontend use
export type WorkflowNode = z.infer<typeof workflowNodeSchema>
export type WorkflowEdge = z.infer<typeof workflowEdgeSchema>
export type WorkflowAction = z.infer<typeof workflowActionSchema>
export type WorkflowFaq = z.infer<typeof workflowFaqSchema>
export type WorkflowObjection = z.infer<typeof workflowObjectionSchema>
export type WorkflowProduct = z.infer<typeof workflowProductSchema>
export type WorkflowService = z.infer<typeof workflowServiceSchema>
export type Workflow = z.infer<typeof workflowSchema>
export type NodeVariant = z.infer<typeof nodeVariantSchema>
