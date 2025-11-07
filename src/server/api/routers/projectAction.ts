import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import qs from 'query-string'
import { z } from 'zod'

const createActionSchema = z.object({
  name: z.string().min(1, 'Action name is required'),
  description: z.string().optional(),
  apiUrl: z.string().min(1, 'API URL is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  actionType: z.enum(['CUSTOM', 'AGENT', 'MCP', 'DATABASE', 'WEBHOOK']).default('CUSTOM'),
  agentId: z.string().optional(),
})

const updateActionSchema = z.object({
  id: z.string().min(1, 'Action ID is required'),
  name: z.string().min(1, 'Action name is required').optional(),
  description: z.string().optional(),
  apiUrl: z.string().min(1, 'API URL is required').optional(),
  endpointUrl: z.string().optional(),
  headers: z
    .array(
      z
        .object({
          key: z.string().min(1, 'Header key is required'),
          value: z.string().min(1, 'Header value is required'),
        })
        .optional()
    )
    .default([])
    .optional(),
  timeout: z.number().optional(),
  authorizationNeeded: z.boolean().optional(),
  authenticationKey: z.string().optional(),
  authenticationValue: z.string().optional(),
  actionType: z.enum(['CUSTOM', 'AGENT', 'MCP', 'DATABASE', 'WEBHOOK']).optional(),
  actionCallType: z.enum(['BEFORE_CALL', 'DURING_CALL']).optional(),
  agentId: z.string().optional(),
  requestBody: z.string().optional(),

  // New JSON columns for direct array storage
  variables: z
    .array(
      z.object({
        key: z.string().min(1, 'Variable key is required'),
        value: z.string().min(1, 'Variable value is required'),
        actionCallType: z.enum(['BEFORE_CALL', 'DURING_CALL']),
        type: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
        variable_id: z.string().min(1, 'Variable id required'),
        required: z.boolean().optional(),
      })
    )
    .optional(),

  queryParameters: z
    .array(
      z.object({
        key: z.string().min(1, 'Query param key is required'),
        value: z.string().min(1, 'Query param value is required'),
      })
    )
    .optional(),

  results: z
    .array(
      z.object({
        key: z.string().min(1, 'Result key is required'),
      })
    )
    .optional(),

  // Step 5 message fields
  agentSpeakNaturally: z.boolean().optional(),
  startMessage: z.string().optional(),
  delayMessage: z.string().optional(),
  delayThreshold: z.number().min(1).optional(),
  failureMessage: z.string().optional(),

  isActive: z.boolean().optional(),
})

// Schema for webhook action upsert
const upsertWebhookActionSchema = z.object({
  agentId: z.string().min(1, 'Agent ID is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  variables: z.array(
    z.object({
      id: z.string(),
      key: z.string(),
      type: z.enum(['STRING', 'NUMBER', 'BOOLEAN']),
      value: z.string(),
    })
  ),
})

export const projectActionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createActionSchema)
    .mutation(async ({ ctx, input }) => {
      const membership = await ctx.db.projectMember.findFirst({
        where: {
          userId: ctx.session.user.id,
          projectId: input.projectId,
        },
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            'You do not have permission to create actions in this project',
        })
      }

      const existingAction = await ctx.db.projectAction.findFirst({
        where: {
          name: input.name,
          projectId: input.projectId,
        },
      })

      if (existingAction) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'An action with this name already exists in this project',
        })
      }

      const action = await ctx.db.projectAction.create({
        data: {
          name: input.name,
          description: input.description,
          apiUrl: input.apiUrl,
          projectId: input.projectId,
          createdById: ctx.session.user.id,
          actionType: input.actionType,
          ...(input.agentId && { agentId: input.agentId }),
        },
        include: {
          project: true,
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          agent: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      })

      return action
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, 'Project ID is required'),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { projectId, page, limit, search } = input
      const skip = (page - 1) * limit

      const membership = await ctx.db.projectMember.findFirst({
        where: {
          userId: ctx.session.user.id,
          projectId,
        },
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view actions in this project',
        })
      }

      const where: any = { projectId }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      }

      const [actions, totalCount] = await Promise.all([
        ctx.db.projectAction.findMany({
          where,
          include: {
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            agent: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.db.projectAction.count({ where }),
      ])

      return {
        actions,
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

  getAllActive: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, 'Project ID is required'),
      })
    )
    .query(async ({ ctx, input }) => {
      const membership = await ctx.db.projectMember.findFirst({
        where: {
          userId: ctx.session.user.id,
          projectId: input.projectId,
        },
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view actions in this project',
        })
      }
      console.log({ inputProjectId: input.projectId })
      const actions = await ctx.db.projectAction.findMany({
        where: {
          projectId: input.projectId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          requestBody: true,
          variables: true,
          results: true,
          queryParameters: true,
          apiUrl: true,
          actionType: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      console.log('getAllActiveActions', actions)
      return actions
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const action = await ctx.db.projectAction.findFirst({
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
          project: true,
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          agent: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      })

      if (!action) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Action not found or you do not have permission to view it',
        })
      }

      return action
    }),

  update: protectedProcedure
    .input(updateActionSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, variables, queryParameters, results, ...updateData } = input

      const action = await ctx.db.projectAction.findFirst({
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

      if (!action) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            'Action not found or you do not have permission to update it',
        })
      }

      // Update action with new JSON columns
      const updatedAction = await ctx.db.projectAction.update({
        where: { id },
        data: {
          ...updateData,
          headers: updateData.headers as any,
          // Store arrays directly as JSON (not stringified)
          variables: variables || undefined,
          queryParameters: queryParameters || undefined,
          results: results || undefined,
        },
        include: {
          project: true,
          createdBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      })

      return updatedAction
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const action = await ctx.db.projectAction.findFirst({
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
      })

      if (!action) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            'Action not found or you do not have permission to delete it',
        })
      }

      await ctx.db.projectAction.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  testApiCall: protectedProcedure
    .input(
      z.object({
        actionId: z.string().min(1, 'Action ID is required'),
        data: z.any(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const action = await ctx.db.projectAction.findFirst({
        where: {
          id: input.actionId,
          project: {
            members: {
              some: {
                userId: ctx.session.user.id,
              },
            },
          },
        },
      })

      if (!action) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Action not found or you do not have permission to test it',
        })
      }

      if (!action.endpointUrl || !action.apiUrl) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Action must have endpoint URL and method configured',
        })
      }

      try {
        const processedBody = input.data ? JSON.stringify(input.data) : '{}'

        let headers: Record<string, string> = {}

        if (action.headers) {
          try {
            const headersArray = JSON.parse(action.headers as any) as Array<{
              key: string
              value: string
            }>

            headers = headersArray.reduce(
              (acc, header) => {
                const trimmedKey = header.key?.toString().trim()
                const trimmedValue = header.value?.toString().trim()

                if (trimmedKey && trimmedValue) {
                  if (/^[a-zA-Z0-9\-_]+$/.test(trimmedKey)) {
                    acc[trimmedKey] = trimmedValue
                  } else {
                  }
                }
                return acc
              },
              {} as Record<string, string>
            )
          } catch (error) {}
        }

        if (
          action.authorizationNeeded &&
          action.authenticationKey &&
          action.authenticationValue
        ) {
          headers[action.authenticationKey] = action.authenticationValue
        }

        const requestOptions: RequestInit = {
          method: action.apiUrl,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          signal: AbortSignal.timeout(action.timeout || 30000),
        }

        if (['POST', 'PUT', 'PATCH'].includes(action.apiUrl) && processedBody) {
          requestOptions.body = processedBody
        }

        const queryParams =
          action.apiUrl == 'GET' && processedBody
            ? '?' + qs.stringify(JSON.parse(processedBody))
            : ''

        console.log({ queryParams })
        const response = await fetch(
          action.endpointUrl + queryParams,
          requestOptions
        )
        const responseText = await response.text()

        let responseData
        try {
          responseData = JSON.parse(responseText)
        } catch {
          responseData = responseText
        }

        const extractedFields = parseResponseFields(responseData)

        return {
          success: true,
          response: {
            status: response.status,
            statusText: response.statusText,
            data: responseData,
            rawResponse: responseText,
          },
          extractedFields,
          processedRequestBody: processedBody,
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          throw new TRPCError({
            code: 'TIMEOUT',
            message: 'API call timed out',
          })
        }

        if (error.cause?.code === 'ENOTFOUND') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid URL or host not found',
          })
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `API call failed: ${error.message}`,
        })
      }
    }),

  // Upsert webhook action - creates or updates a ProjectAction for webhook variables
  upsertWebhookAction: protectedProcedure
    .input(upsertWebhookActionSchema)
    .mutation(async ({ ctx, input }) => {
      const { agentId, projectId, variables } = input

      // Verify user has access to the project
      const membership = await ctx.db.projectMember.findFirst({
        where: {
          userId: ctx.session.user.id,
          projectId: projectId,
        },
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to manage actions in this project',
        })
      }

      // Verify agent exists and belongs to this project
      const agent = await ctx.db.projectAgent.findFirst({
        where: {
          id: agentId,
          projectId: projectId,
        },
      })

      if (!agent) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Agent not found in this project',
        })
      }

      // Transform variables to variables format for RichTextEditor (use { trigger)
      const webhookVariables = variables.map((v) => ({
        key: v.key,
        variable_id: v.id,
        value: v.value,
        type: v.type,
        actionCallType: 'BEFORE_CALL',
        required: false,
      }))

      // Check if webhook action already exists for this agent
      const existingAction = await ctx.db.projectAction.findFirst({
        where: {
          projectId: projectId,
          actionType: 'WEBHOOK',
          agentId: agentId,
        },
      })

      if (existingAction) {
        // Update existing webhook action
        const updatedAction = await ctx.db.projectAction.update({
          where: { id: existingAction.id },
          data: {
            name: 'webhook',
            description: `Webhook variables for ${agent.name}`,
            variables: webhookVariables,
            updatedAt: new Date(),
          },
        })

        return updatedAction
      } else {
        // Create new webhook action
        const newAction = await ctx.db.projectAction.create({
          data: {
            name: 'webhook',
            description: `Webhook variables for ${agent.name}`,
            apiUrl: 'POST', // Default method, not used for webhook type
            projectId: projectId,
            actionType: 'WEBHOOK',
            agentId: agentId,
            variables: webhookVariables,
            isActive: true,
            createdById: ctx.session.user.id,
          },
        })

        return newAction
      }
    }),
})

function parseResponseFields(
  data: any,
  prefix = ''
): Array<{
  id: string
  name: string
  type: string
  description: string
  sampleValue: any
}> {
  const fields: Array<{
    id: string
    name: string
    type: string
    description: string
    sampleValue: any
  }> = []

  if (data === null || data === undefined) {
    return fields
  }

  if (Array.isArray(data)) {
    fields.push({
      id: prefix || 'root',
      name: prefix || 'Response (Array)',
      type: 'array',
      description: `Array with ${data.length} items`,
      sampleValue: data,
    })

    if (data.length > 0 && typeof data[0] === 'object') {
      const subFields = parseResponseFields(data[0], prefix)
      fields.push(...subFields)
    }
  } else if (typeof data === 'object') {
    Object.entries(data).forEach(([key, value]) => {
      const fieldName = prefix ? `${prefix}.${key}` : key

      if (value === null) {
        fields.push({
          id: fieldName,
          name: fieldName,
          type: 'null',
          description: 'Null value',
          sampleValue: null,
        })
      } else if (Array.isArray(value)) {
        fields.push({
          id: fieldName,
          name: fieldName,
          type: 'array',
          description: `Array with ${value.length} items`,
          sampleValue: value,
        })

        if (value.length > 0 && typeof value[0] === 'object') {
          const subFields = parseResponseFields(value[0], fieldName)
          fields.push(...subFields)
        }
      } else if (typeof value === 'object') {
        const subFields = parseResponseFields(value, fieldName)
        fields.push(...subFields)
      } else {
        fields.push({
          id: fieldName,
          name: fieldName,
          type: typeof value,
          description: `${typeof value === 'string' ? 'Text' : typeof value === 'number' ? 'Number' : typeof value === 'boolean' ? 'Boolean' : 'Value'} field`,
          sampleValue: value,
        })
      }
    })
  } else {
    fields.push({
      id: prefix || 'root',
      name: prefix || 'Response',
      type: typeof data,
      description: `${typeof data === 'string' ? 'Text' : typeof data === 'number' ? 'Number' : typeof data === 'boolean' ? 'Boolean' : 'Value'} response`,
      sampleValue: data,
    })
  }

  return fields
}
