import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import qs from 'query-string'
import { z } from 'zod'

const createActionSchema = z.object({
  name: z.string().min(1, 'Action name is required'),
  description: z.string().optional(),
  apiUrl: z.string().min(1, 'API URL is required'),
  projectId: z.string().optional(),
  actionType: z
    .enum(['CUSTOM', 'AGENT', 'MCP', 'DATABASE', 'WEBHOOK'])
    .default('CUSTOM'),
  agentId: z.string().optional(),
  isGlobal: z.boolean().default(false),
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
  actionType: z
    .enum(['CUSTOM', 'AGENT', 'MCP', 'DATABASE', 'WEBHOOK'])
    .optional(),
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
  projectId: z.string().optional(), // Optional for SUPERADMIN creating global webhooks
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
      // For global actions, only SUPERADMIN can create
      if (input.isGlobal && ctx.session.user.role !== 'SUPERADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only SUPERADMIN can create global actions',
        })
      }

      // For project-specific actions, check membership
      if (!input.isGlobal && input.projectId) {
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
      }

      const existingAction = await ctx.db.projectAction.findFirst({
        where: {
          name: input.name,
          ...(input.isGlobal ? { isGlobal: true } : { projectId: input.projectId }),
        },
      })

      if (existingAction) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: input.isGlobal
            ? 'A global action with this name already exists'
            : 'An action with this name already exists in this project',
        })
      }

      const action = await ctx.db.projectAction.create({
        data: {
          name: input.name,
          description: input.description,
          apiUrl: input.apiUrl,
          projectId: input.isGlobal ? null : input.projectId,
          isGlobal: input.isGlobal,
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
        projectId: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { projectId, page, limit, search } = input
      const skip = (page - 1) * limit

      // If projectId is provided, check membership
      if (projectId) {
        const membership = await ctx.db.projectMember.findFirst({
          where: {
            userId: ctx.session.user.id,
            projectId,
          },
        })

        if (!membership && ctx.session.user.role !== 'SUPERADMIN') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to view actions in this project',
          })
        }
      }

      // Build where clause
      const where: any = {}

      // If no projectId and user is SUPERADMIN, show only global actions
      // If projectId provided, show actions for that project
      if (!projectId && ctx.session.user.role === 'SUPERADMIN') {
        where.isGlobal = true
      } else if (projectId) {
        where.OR = [
          { projectId },
          { isGlobal: true },
        ]
      }

      if (search) {
        const searchConditions = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]

        if (where.OR) {
          // Combine existing OR with search OR
          where.AND = [
            { OR: where.OR },
            { OR: searchConditions },
          ]
          delete where.OR
        } else {
          where.OR = searchConditions
        }
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
        projectId: z.string().min(1, 'Project ID is required').optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // If projectId is provided, check membership
      if (input.projectId) {
        const membership = await ctx.db.projectMember.findFirst({
          where: {
            userId: ctx.session.user.id,
            projectId: input.projectId,
          },
        })

        if (!membership && ctx.session.user.role !== 'SUPERADMIN') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message:
              'You do not have permission to view actions in this project',
          })
        }
      }

      console.log({ inputProjectId: input.projectId })

      // Get both project-specific actions AND global actions
      const actions = await ctx.db.projectAction.findMany({
        where: {
          OR: [
            // Project-specific actions (if projectId provided)
            ...(input.projectId
              ? [{ projectId: input.projectId, isActive: true }]
              : []),
            // Global actions (always included)
            { isGlobal: true, isActive: true },
          ],
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
          isGlobal: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      console.log('getAllActiveActions', actions)
      return actions
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // SUPERADMIN can access any action
      if (ctx.session.user.role === 'SUPERADMIN') {
        const action = await ctx.db.projectAction.findUnique({
          where: { id: input.id },
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
            message: 'Action not found',
          })
        }

        return action
      }

      // Regular users - check project membership
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

      // SUPERADMIN can update any action
      if (ctx.session.user.role === 'SUPERADMIN') {
        const action = await ctx.db.projectAction.findUnique({
          where: { id },
        })

        if (!action) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Action not found',
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
      }

      // Regular users - check project membership and ADMIN role
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
      // First, find the action
      const action = await ctx.db.projectAction.findUnique({
        where: { id: input.id },
      })

      if (!action) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Action not found',
        })
      }

      // Check permissions
      // If it's a global action, only SUPERADMIN can delete
      if (action.isGlobal) {
        if (ctx.session.user.role !== 'SUPERADMIN') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only SUPERADMIN can delete global actions',
          })
        }
      } else {
        // For project actions, check if user is ADMIN of the project
        const membership = await ctx.db.projectMember.findFirst({
          where: {
            userId: ctx.session.user.id,
            projectId: action.projectId!,
            role: { in: ['ADMIN'] },
          },
        })

        if (!membership) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to delete this action',
          })
        }
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
      // Check if user is SUPERADMIN
      const isSuperAdmin = ctx.session.user.role === 'SUPERADMIN'

      const action = await ctx.db.projectAction.findFirst({
        where: {
          id: input.actionId,
          ...(isSuperAdmin
            ? {}
            : {
                project: {
                  members: {
                    some: {
                      userId: ctx.session.user.id,
                    },
                  },
                },
              }),
        },
        select: {
          id: true,
          endpointUrl: true,
          apiUrl: true,
          requestBody: true,
          headers: true,
          authorizationNeeded: true,
          authenticationKey: true,
          authenticationValue: true,
          timeout: true,
          variables: true, // Include variables for proper mapping
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
        // Process body: use requestBody template and replace variable placeholders
        let processedBody = '{}'

        if (action.requestBody) {
          try {
            // Parse the requestBody (could be JSON string or Tiptap document)
            const parsedBody = typeof action.requestBody === 'string'
              ? JSON.parse(action.requestBody)
              : action.requestBody

            // Check if it's a Tiptap document structure
            if (parsedBody.type === 'doc' && parsedBody.content) {
              // Convert Tiptap document to plain text with variable substitution
              console.log('Converting Tiptap document with variables:', input.data)
              console.log('Action variables:', action.variables)
              processedBody = convertTiptapToText(
                parsedBody,
                input.data || {},
                action.variables as any
              )
              console.log('Converted body:', processedBody)
            } else {
              // It's already a plain JSON object, just replace placeholders
              let bodyTemplate = JSON.stringify(parsedBody)

              if (input.data && typeof input.data === 'object') {
                Object.entries(input.data).forEach(([key, value]) => {
                  const patterns = [
                    new RegExp(`\\{[^}]*\\.${key}\\}`, 'g'),
                    new RegExp(`\\{${key}\\}`, 'g'),
                    new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
                  ]
                  patterns.forEach(pattern => {
                    bodyTemplate = bodyTemplate.replace(pattern, String(value))
                  })
                })
              }

              processedBody = bodyTemplate
            }
          } catch (error) {
            // If parsing fails, treat as plain text template
            let bodyTemplate = action.requestBody

            if (input.data && typeof input.data === 'object') {
              Object.entries(input.data).forEach(([key, value]) => {
                const patterns = [
                  new RegExp(`\\{[^}]*\\.${key}\\}`, 'g'),
                  new RegExp(`\\{${key}\\}`, 'g'),
                  new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
                ]
                patterns.forEach(pattern => {
                  bodyTemplate = bodyTemplate.replace(pattern, String(value))
                })
              })
            }

            processedBody = bodyTemplate
          }
        } else if (input.data) {
          // Fallback: if no template, just stringify the data
          processedBody = JSON.stringify(input.data)
        }

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

        // Add body for POST, PUT, PATCH requests (case-insensitive check)
        const upperMethod = action.apiUrl.toUpperCase()
        if (['POST', 'PUT', 'PATCH'].includes(upperMethod)) {
          requestOptions.body = processedBody
        }

        const queryParams =
          upperMethod === 'GET' && processedBody
            ? '?' + qs.stringify(JSON.parse(processedBody))
            : ''

        const finalUrl = action.endpointUrl + queryParams

        console.log('API Test Call Details:', {
          url: finalUrl,
          method: requestOptions.method,
          headers: requestOptions.headers,
          body: requestOptions.body,
          hasBody: !!requestOptions.body,
          upperMethod,
          originalMethod: action.apiUrl,
        })

        const response = await fetch(finalUrl, requestOptions)
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

      const isSuperAdmin = ctx.session.user.role === 'SUPERADMIN'

      // Verify user has access to the project (skip for SUPERADMIN with global agents)
      if (!isSuperAdmin || projectId) {
        const membership = await ctx.db.projectMember.findFirst({
          where: {
            userId: ctx.session.user.id,
            projectId: projectId,
          },
        })

        if (!membership && !isSuperAdmin) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message:
              'You do not have permission to manage actions in this project',
          })
        }
      }

      // Verify agent exists
      const agent = isSuperAdmin
        ? await ctx.db.projectAgent.findUnique({
            where: { id: agentId },
          })
        : await ctx.db.projectAgent.findFirst({
            where: {
              id: agentId,
              projectId: projectId,
            },
          })

      if (!agent) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Agent not found',
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

      // Determine if this should be a global action
      const isGlobal = isSuperAdmin && !projectId

      // Check if webhook action already exists for this agent
      const existingAction = await ctx.db.projectAction.findFirst({
        where: {
          ...(isGlobal
            ? { isGlobal: true }
            : { projectId: projectId }
          ),
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
            projectId: isGlobal ? null : projectId,
            isGlobal: isGlobal,
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

// Helper function to convert Tiptap document to plain text with variable substitution
function convertTiptapToText(
  tiptapDoc: any,
  testValues: Record<string, any>,
  actionVariables?: any[]
): string {
  let result = ''

  // Build a comprehensive mapping of all possible label formats to values
  const variableMap: Record<string, any> = {}

  // If we have action variables metadata, use it to build the mapping
  if (actionVariables && Array.isArray(actionVariables)) {
    actionVariables.forEach((variable: any) => {
      const key = variable.key || variable.label
      const variableId = variable.variable_id || variable.id

      // Map by key (e.g., "name")
      if (key && testValues[key] !== undefined) {
        variableMap[key] = testValues[key]
      }

      // Map by variable_id
      if (variableId && testValues[key] !== undefined) {
        variableMap[variableId] = testValues[key]
      }
    })
  }

  // Also add direct mappings from testValues
  Object.entries(testValues).forEach(([key, value]) => {
    variableMap[key] = value
  })

  console.log('Built variable map:', variableMap)

  function processNode(node: any): string {
    if (!node) return ''

    // Handle text nodes
    if (node.type === 'text') {
      return node.text || ''
    }

    // Handle reactMention nodes (variable placeholders)
    if (node.type === 'reactMention') {
      const label = node.attrs?.label
      const id = node.attrs?.id

      console.log('Found reactMention - label:', label, 'id:', id, 'Available keys:', Object.keys(variableMap))

      // Try to find the value by various identifiers
      let value = undefined

      // 1. Try exact label match
      if (label && variableMap[label] !== undefined) {
        value = variableMap[label]
      }

      // 2. Try ID match
      if (value === undefined && id && variableMap[id] !== undefined) {
        value = variableMap[id]
      }

      // 3. Try to find by matching variable metadata
      if (value === undefined && actionVariables && Array.isArray(actionVariables)) {
        const matchingVar = actionVariables.find((v: any) =>
          v.variable_id === id ||
          v.id === id ||
          v.key === label ||
          v.label === label
        )
        if (matchingVar) {
          const key = matchingVar.key || matchingVar.label
          if (key && testValues[key] !== undefined) {
            value = testValues[key]
          }
        }
      }

      if (value !== undefined) {
        console.log('Replacing', label, 'with', value)
        return String(value)
      }

      console.log('Variable not found for label:', label, 'id:', id)
      return `{${label || id || 'unknown'}}`
    }

    // Handle container nodes (doc, paragraph, etc.)
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(processNode).join('')
    }

    return ''
  }

  // Process the entire document
  if (tiptapDoc.content && Array.isArray(tiptapDoc.content)) {
    result = tiptapDoc.content.map(processNode).join('')
  }

  // Try to parse and re-stringify to clean up any extra spaces in JSON values
  try {
    const parsed = JSON.parse(result)
    // Recursively trim all string values
    const trimmed = trimJsonValues(parsed)
    return JSON.stringify(trimmed)
  } catch (e) {
    // If not valid JSON, return as-is
    return result
  }
}

// Helper function to recursively trim all string values in an object/array
function trimJsonValues(obj: any): any {
  if (typeof obj === 'string') {
    return obj.trim()
  }
  if (Array.isArray(obj)) {
    return obj.map(trimJsonValues)
  }
  if (obj !== null && typeof obj === 'object') {
    const trimmed: any = {}
    for (const [key, value] of Object.entries(obj)) {
      trimmed[key] = trimJsonValues(value)
    }
    return trimmed
  }
  return obj
}

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
