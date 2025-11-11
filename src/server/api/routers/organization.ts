import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '@src/env'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

// Initialize S3 client
const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_API_KEY,
    secretAccessKey: env.AWS_SECRET_ACCESS_API_KEY,
  },
})

export const organizationRouter = createTRPCRouter({
  // Get all organizations (SUPERADMIN only - Modelo 1: Platform Administrator)
  getAll: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is SUPERADMIN
    if (ctx.session.user.role !== 'SUPERADMIN') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only super admins can view all organizations',
      })
    }

    const organizations = await ctx.db.organization.findMany({
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                email: true,
              },
            },
          },
        },
        projects: {
          where: { name: 'Initial Project' },
          select: {
            id: true,
            agents: {
              where: { sourceAgentId: { not: null } },
              select: {
                sourceAgentId: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            projects: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Transform to include assignedAgentIds from cloned agents
    return organizations.map((org) => {
      const initialProject = org.projects?.[0]
      const assignedAgentIds = initialProject?.agents.map((a) => a.sourceAgentId).filter((id): id is string => id !== null) || []

      return {
        ...org,
        assignedAgents: assignedAgentIds.map(id => ({ agentId: id })), // Maintain compatibility with frontend
        projects: undefined, // Remove projects from response
      }
    })
  }),

  // Get a single organization by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user has access to this organization
      const isSuperAdmin = ctx.session.user.role === 'SUPERADMIN'
      const isOrgMember = await ctx.db.organizationMember.findFirst({
        where: {
          organizationId: input.id,
          userId: ctx.session.user.id,
        },
      })

      if (!isSuperAdmin && !isOrgMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this organization",
        })
      }

      const organization = await ctx.db.organization.findUnique({
        where: { id: input.id },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              projects: true,
            },
          },
        },
      })

      if (!organization) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        })
      }

      return organization
    }),

  // Create a new organization (SUPERADMIN only)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        logoUrl: z.string().optional(),
        slug: z
          .string()
          .min(1)
          .max(50)
          .regex(
            /^[a-z0-9-]+$/,
            'Slug must be lowercase alphanumeric with hyphens'
          ),
        allowedPages: z.array(z.string()).default([]),
        assignedAgentIds: z.array(z.string()).default([]),
        custom: z.boolean().default(true),
        administrators: z
          .array(
            z.object({
              firstName: z.string().min(1),
              lastName: z.string().min(1),
              username: z.string().min(1),
              email: z.string().email(),
              password: z.string().min(6),
            })
          )
          .min(1, 'At least one administrator is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is SUPERADMIN
      if (ctx.session.user.role !== 'SUPERADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only super admins can create organizations',
        })
      }

      // Verify slug is unique
      const existingOrg = await ctx.db.organization.findUnique({
        where: { slug: input.slug },
      })

      if (existingOrg) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'This slug is already in use',
        })
      }

      // Import bcrypt for password hashing
      const bcrypt = await import('bcryptjs')

      // Create first administrator (will be the owner)
      const firstAdmin = input.administrators[0]
      const hashedPassword = await bcrypt.hash(firstAdmin.password, 12)

      const ownerUser = await ctx.db.user.create({
        data: {
          firstName: firstAdmin.firstName,
          lastName: firstAdmin.lastName,
          username: firstAdmin.username,
          email: firstAdmin.email,
          password: hashedPassword,
          role: 'USER',
          isVerified: true,
          emailVerified: new Date(),
        },
      })

      // Create organization with first admin as owner
      const organization = await ctx.db.organization.create({
        data: {
          name: input.name,
          description: input.description,
          logoUrl: input.logoUrl,
          slug: input.slug,
          allowedPages: input.allowedPages,
          custom: input.custom,
          ownerId: ownerUser.id,
          members: {
            create: {
              userId: ownerUser.id,
              role: 'OWNER',
            },
          },
        },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              members: true,
              projects: true,
            },
          },
        },
      })

      // Create remaining administrators (as ADMIN role)
      const adminUserIds: string[] = []
      for (let i = 1; i < input.administrators.length; i++) {
        const admin = input.administrators[i]
        const adminHashedPassword = await bcrypt.hash(admin.password, 12)

        const adminUser = await ctx.db.user.create({
          data: {
            firstName: admin.firstName,
            lastName: admin.lastName,
            username: admin.username,
            email: admin.email,
            password: adminHashedPassword,
            role: 'USER',
            isVerified: true,
            emailVerified: new Date(),
          },
        })

        // Add as organization member with ADMIN role
        await ctx.db.organizationMember.create({
          data: {
            userId: adminUser.id,
            organizationId: organization.id,
            role: 'ADMIN',
          },
        })

        // Store admin user ID to add to project later
        adminUserIds.push(adminUser.id)
      }

      // Create a default initial project for the new organization
      await ctx.db.$transaction(
        async (tx) => {
          // Create the project
          const project = await tx.project.create({
            data: {
              name: 'Initial Project',
              description: 'Default project created automatically',
              organizationId: organization.id,
              createdById: ownerUser.id,
              status: 'CREATED',
            },
          })

          // Add owner as admin member of the project
          await tx.projectMember.create({
            data: {
              projectId: project.id,
              userId: ownerUser.id,
              role: 'ADMIN',
            },
          })

          // Add all organization admins as project members
          for (const adminUserId of adminUserIds) {
            await tx.projectMember.create({
              data: {
                projectId: project.id,
                userId: adminUserId,
                role: 'ADMIN',
              },
            })
          }

          // Create default categories for products and services
          await tx.projectCategory.create({
            data: {
              name: 'General',
              description: 'Default category for products',
              type: 'PRODUCT',
              isDefault: true,
              projectId: project.id,
              createdById: ownerUser.id,
            },
          })

          await tx.projectCategory.create({
            data: {
              name: 'General Services',
              description: 'Default category for services',
              type: 'SERVICE',
              isDefault: true,
              projectId: project.id,
              createdById: ownerUser.id,
            },
          })

          // Create default warehouse "a001"
          await tx.projectProductWarehouse.create({
            data: {
              warehouseId: 'a001',
              name: 'DEFAULT',
              isDefault: true,
              projectId: project.id,
              createdById: ownerUser.id,
            },
          })

          // Auto-generate API Key for database actions
          const { generateApiKey, hashApiKey } = await import('@src/utils/generateDatabaseActions')
          const apiKeyValue = generateApiKey()
          const apiKeyHash = hashApiKey(apiKeyValue)
          const apiKeyPreview = `${apiKeyValue.substring(0, 12)}...`

          await tx.userApiKey.create({
            data: {
              userId: ownerUser.id,
              name: '__internal_system_api_key__',
              keyHash: apiKeyHash,
              keyPreview: apiKeyPreview,
              isActive: true,
              admin: false,
            },
          })

          // Create all DATABASE actions using createMany for performance
          const { DATABASE_ACTIONS_TEMPLATES } = await import('@src/config/databaseActionsTemplate')
          const { buildEndpointUrl, buildVariables, buildResults, buildHeaders } = await import('@src/utils/generateDatabaseActions')

          const databaseActions = DATABASE_ACTIONS_TEMPLATES.map((template) => ({
            name: template.name,
            description: template.description,
            actionType: 'DATABASE' as const,
            apiUrl: template.method,
            endpointUrl: buildEndpointUrl(template, project.id),
            timeout: 30000,
            headers: buildHeaders(),
            authorizationNeeded: true,
            authenticationKey: 'Authorization',
            authenticationValue: `Bearer ${apiKeyValue}`,
            variables: buildVariables(template),
            results: buildResults(template),
            projectId: project.id,
            createdById: ownerUser.id,
          }))

          await tx.projectAction.createMany({
            data: databaseActions,
          })

          // Clone assigned agents to this project
          if (input.assignedAgentIds && input.assignedAgentIds.length > 0) {
            for (const agentId of input.assignedAgentIds) {
              // Get the template agent
              const templateAgent = await tx.projectAgent.findUnique({
                where: { id: agentId },
                include: {
                  workflow: true,
                  actions: true,
                },
              })

              if (!templateAgent) continue

              // Clone the agent with projectId
              const clonedAgent = await tx.projectAgent.create({
                data: {
                  name: templateAgent.name,
                  type: templateAgent.type,
                  systemInstructions: templateAgent.systemInstructions,
                  isActive: templateAgent.isActive,
                  isGlobal: false, // Clones are never global
                  projectId: project.id, // ← Assign to Initial Project
                  modelId: templateAgent.modelId,
                  sourceAgentId: templateAgent.id, // ← Track the template
                },
              })

              // Clone workflow if exists
              if (templateAgent.workflow) {
                await tx.projectAgentWorkflow.create({
                  data: {
                    agentId: clonedAgent.id,
                    name: templateAgent.workflow.name,
                    description: templateAgent.workflow.description,
                    instructions: templateAgent.workflow.instructions,
                    globalActions: templateAgent.workflow.globalActions as any,
                    globalFaqs: templateAgent.workflow.globalFaqs as any,
                    globalObjections: templateAgent.workflow.globalObjections as any,
                    nodes: templateAgent.workflow.nodes as any,
                    edges: templateAgent.workflow.edges as any,
                    positionX: templateAgent.workflow.positionX,
                    positionY: templateAgent.workflow.positionY,
                  },
                })
              }

              // Clone actions if exists
              if (templateAgent.actions) {
                await tx.projectAgentActions.create({
                  data: {
                    agentId: clonedAgent.id,
                    afterCallActions: templateAgent.actions.afterCallActions as any,
                  },
                })
              }
            }
          }
        },
        {
          timeout: 60000, // 60 seconds timeout for creating project + API key + actions + cloning agents
        }
      )

      return organization
    }),

  // Update an organization (SUPERADMIN or OWNER only)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        logoUrl: z.string().optional(),
        slug: z.string().optional(),
        allowedPages: z.array(z.string()).optional(),
        assignedAgentIds: z.array(z.string()).optional(),
        administratorsToAdd: z.array(
          z.object({
            firstName: z.string(),
            lastName: z.string(),
            username: z.string(),
            email: z.string().email(),
            password: z.string(),
          })
        ).optional(),
        administratorsToRemove: z.array(z.string()).optional(), // Array of membershipIds
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is SUPERADMIN or organization OWNER
      const isSuperAdmin = ctx.session.user.role === 'SUPERADMIN'
      const organization = await ctx.db.organization.findUnique({
        where: { id: input.id },
        include: {
          members: {
            where: {
              userId: ctx.session.user.id,
              role: 'OWNER',
            },
          },
        },
      })

      if (!organization) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        })
      }

      const isOwner = organization.members.length > 0

      if (!isSuperAdmin && !isOwner) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            "You don't have permission to update this organization. Only super admins and organization owners can update organizations.",
        })
      }

      const { id, administratorsToAdd, administratorsToRemove, assignedAgentIds, ...updateData } = input

      // Import bcrypt for password hashing
      const bcrypt = await import('bcryptjs')

      // Handle removing administrators
      if (administratorsToRemove && administratorsToRemove.length > 0) {
        await ctx.db.organizationMember.deleteMany({
          where: {
            id: { in: administratorsToRemove },
            organizationId: id,
            role: { not: 'OWNER' }, // Cannot remove owner
          },
        })
      }

      // Handle adding new administrators
      if (administratorsToAdd && administratorsToAdd.length > 0) {
        for (const admin of administratorsToAdd) {
          const hashedPassword = await bcrypt.hash(admin.password, 12)

          const newAdminUser = await ctx.db.user.create({
            data: {
              firstName: admin.firstName,
              lastName: admin.lastName,
              username: admin.username,
              email: admin.email,
              password: hashedPassword,
              role: 'USER',
              isVerified: true,
              emailVerified: new Date(),
            },
          })

          await ctx.db.organizationMember.create({
            data: {
              userId: newAdminUser.id,
              organizationId: id,
              role: 'ADMIN',
            },
          })
        }
      }

      // Handle updating assigned agents if provided
      if (input.assignedAgentIds !== undefined) {
        // Get the organization's Initial Project
        const initialProject = await ctx.db.project.findFirst({
          where: {
            organizationId: id,
            name: 'Initial Project',
          },
        })

        if (!initialProject) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Initial project not found for this organization',
          })
        }

        // Get currently cloned agents for this organization
        const currentClonedAgents = await ctx.db.projectAgent.findMany({
          where: {
            projectId: initialProject.id,
            sourceAgentId: { not: null },
          },
          select: { id: true, sourceAgentId: true },
        })

        const currentTemplateIds = currentClonedAgents
          .map((a) => a.sourceAgentId)
          .filter((id): id is string => id !== null)

        // Determine which agents to add and which to remove
        const assignedIds = input.assignedAgentIds || []
        const agentsToAdd = assignedIds.filter(
          (id) => !currentTemplateIds.includes(id)
        )
        const agentsToRemove = currentClonedAgents.filter(
          (agent) =>
            agent.sourceAgentId &&
            !assignedIds.includes(agent.sourceAgentId)
        )

        // Remove agents that are no longer assigned
        if (agentsToRemove.length > 0) {
          await ctx.db.projectAgent.deleteMany({
            where: {
              id: { in: agentsToRemove.map((a) => a.id) },
            },
          })
        }

        // Clone new agents
        if (agentsToAdd.length > 0) {
          for (const agentId of agentsToAdd) {
            const templateAgent = await ctx.db.projectAgent.findUnique({
              where: { id: agentId },
              include: {
                workflow: true,
                actions: true,
              },
            })

            if (!templateAgent) continue

            // Clone the agent
            const clonedAgent = await ctx.db.projectAgent.create({
              data: {
                name: templateAgent.name,
                type: templateAgent.type,
                systemInstructions: templateAgent.systemInstructions,
                isActive: templateAgent.isActive,
                isGlobal: false,
                projectId: initialProject.id,
                modelId: templateAgent.modelId,
                sourceAgentId: templateAgent.id,
              },
            })

            // Clone workflow if exists
            if (templateAgent.workflow) {
              await ctx.db.projectAgentWorkflow.create({
                data: {
                  agentId: clonedAgent.id,
                  name: templateAgent.workflow.name,
                  description: templateAgent.workflow.description,
                  instructions: templateAgent.workflow.instructions,
                  globalActions: templateAgent.workflow.globalActions as any,
                  globalFaqs: templateAgent.workflow.globalFaqs as any,
                  globalObjections: templateAgent.workflow.globalObjections as any,
                  nodes: templateAgent.workflow.nodes as any,
                  edges: templateAgent.workflow.edges as any,
                  positionX: templateAgent.workflow.positionX,
                  positionY: templateAgent.workflow.positionY,
                },
              })
            }

            // Clone actions if exists
            if (templateAgent.actions) {
              await ctx.db.projectAgentActions.create({
                data: {
                  agentId: clonedAgent.id,
                  afterCallActions: templateAgent.actions.afterCallActions as any,
                },
              })
            }
          }
        }
      }

      // Update organization basic data
      return await ctx.db.organization.update({
        where: { id },
        data: updateData,
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  username: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              members: true,
              projects: true,
            },
          },
        },
      })
    }),

  // Delete an organization (SUPERADMIN only)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is SUPERADMIN
      if (ctx.session.user.role !== 'SUPERADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only super admins can delete organizations',
        })
      }

      // Check if organization exists
      const organization = await ctx.db.organization.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              projects: true,
            },
          },
        },
      })

      if (!organization) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        })
      }

      // Delete organization (cascade will handle related data)
      await ctx.db.organization.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // Get user's organizations
  getMyOrganizations: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.organization.findMany({
      where: {
        members: {
          some: {
            userId: ctx.session.user.id,
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        members: {
          where: {
            userId: ctx.session.user.id,
          },
          select: {
            role: true,
          },
        },
        _count: {
          select: {
            projects: true,
            members: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }),

  // Check if slug is available
  checkSlugAvailability: protectedProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const existingOrg = await ctx.db.organization.findUnique({
        where: { slug: input.slug },
      })

      return {
        available: !existingOrg,
        slug: input.slug,
      }
    }),

  // Get organization by slug (public endpoint for login pages)
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const organization = await ctx.db.organization.findUnique({
        where: { slug: input.slug },
        select: {
          id: true,
          name: true,
          description: true,
          logoUrl: true,
          slug: true,
        },
      })

      if (!organization) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        })
      }

      return organization
    }),

  // Check if user is member of organization
  checkMembership: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const member = await ctx.db.organizationMember.findFirst({
        where: {
          organizationId: input.organizationId,
          userId: input.userId,
        },
      })

      return {
        isMember: !!member,
        role: member?.role,
      }
    }),

  // Get current user's organization (for menu restrictions and branding)
  getUserOrganization: protectedProcedure.query(async ({ ctx }) => {
    // Find the first organization where user is a member
    const membership = await ctx.db.organizationMember.findFirst({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            description: true,
            logoUrl: true,
            slug: true,
            allowedPages: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'asc', // Get the first organization they joined
      },
    })

    if (!membership) {
      return null
    }

    return membership.organization
  }),

  // Get presigned URL for uploading organization logo
  getLogoUploadUrl: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
        organizationId: z.string().optional(), // Optional for new organizations
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is SUPERADMIN
      if (ctx.session.user.role !== 'SUPERADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only super admins can upload organization logos',
        })
      }

      // If organizationId provided, verify it exists (for updates)
      if (input.organizationId) {
        const organization = await ctx.db.organization.findUnique({
          where: { id: input.organizationId },
        })

        if (!organization) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Organization not found',
          })
        }
      }

      // Generate unique file name
      const fileExtension = input.fileName.split('.').pop()
      const uniqueFileName = `${uuidv4()}.${fileExtension}`
      const s3Key = input.organizationId
        ? `organizations/${input.organizationId}/logo/${uniqueFileName}`
        : `organizations/temp/${uniqueFileName}`

      try {
        // Generate presigned URL for upload
        const command = new PutObjectCommand({
          Bucket: env.S3_BUCKET_NAME,
          Key: s3Key,
          ContentType: input.fileType,
          ContentLength: input.fileSize,
        })

        const uploadUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        }) // 1 hour

        const s3Url = `https://${env.S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${s3Key}`

        return {
          uploadUrl,
          s3Key,
          s3Url,
          fileName: uniqueFileName,
        }
      } catch (error) {
        console.error('S3 logo upload URL generation error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate upload URL for logo',
        })
      }
    }),

  // Get my role in an organization (for permissions)
  getMyRole: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const membership = await ctx.db.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: input.organizationId,
            userId: ctx.session.user.id,
          },
        },
      })

      return membership
    }),
})
