import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { DATABASE_ACTIONS_TEMPLATES } from '@src/config/databaseActionsTemplate'
import { env } from '@src/env'
import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import {
  generateApiKey,
  hashApiKey,
  buildEndpointUrl,
  buildVariables,
  buildResults,
  buildHeaders,
} from '@src/utils/generateDatabaseActions'
import {
  getAvailableProjectStatuses,
  isValidProjectStatus,
} from '@src/utils/projectStatus'
import { TRPCError } from '@trpc/server'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

// Initialize S3 client
const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: env.AWS_ACCESS_API_KEY,
    secretAccessKey: env.AWS_SECRET_ACCESS_API_KEY,
  },
})

export const projectRouter = createTRPCRouter({
  // Create a new project
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        organizationId: z.string(),
        status: z.enum(['CREATED', 'ACTIVE', 'COMPLETED']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to create projects in this organization
      const organizationMember = await ctx.db.organizationMember.findFirst({
        where: {
          organizationId: input.organizationId,
          userId: ctx.session.user.id,
          role: { in: ['OWNER', 'ADMIN'] }, // Only OWNER and ADMIN can create projects
        },
      })

      if (!organizationMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            "You don't have permission to create projects in this organization",
        })
      }

      // Create project and default values in a transaction
      const result = await ctx.db.$transaction(
        async (tx) => {
          // Create the project
          const project = await tx.project.create({
            data: {
              name: input.name,
              description: input.description,
              organizationId: input.organizationId,
              createdById: ctx.session.user.id,
              status: input.status || 'CREATED',
            },
          })

          // Add creator as admin member of the project
          await tx.projectMember.create({
            data: {
              projectId: project.id,
              userId: ctx.session.user.id,
              role: 'ADMIN',
            },
          })

          // Create default categories for products and services
          await tx.projectCategory.create({
            data: {
              name: 'General',
              description: 'Default category for products',
              type: 'PRODUCT',
              isDefault: true,
              projectId: project.id,
              createdById: ctx.session.user.id,
            },
          })

          await tx.projectCategory.create({
            data: {
              name: 'General Services',
              description: 'Default category for services',
              type: 'SERVICE',
              isDefault: true,
              projectId: project.id,
              createdById: ctx.session.user.id,
            },
          })

          // Create default warehouse "a001"
          await tx.projectProductWarehouse.create({
            data: {
              warehouseId: 'a001',
              name: 'DEFAULT',
              isDefault: true,
              projectId: project.id,
              createdById: ctx.session.user.id,
            },
          })

          // NOTE: Default agents creation disabled
          // Users can create custom agents as needed using "Add New Agent" button

          // Auto-generate API Key for database actions
          const apiKeyValue = generateApiKey()
          const apiKeyHash = hashApiKey(apiKeyValue)
          const apiKeyPreview = `${apiKeyValue.substring(0, 12)}...`

          await tx.userApiKey.create({
            data: {
              userId: ctx.session.user.id,
              name: '__internal_system_api_key__',
              keyHash: apiKeyHash,
              keyPreview: apiKeyPreview,
              isActive: true,
              admin: false,
            },
          })

          // Create all DATABASE actions using createMany for performance
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
            createdById: ctx.session.user.id,
          }))

          await tx.projectAction.createMany({
            data: databaseActions,
          })

          return project
        },
        {
          timeout: 30000, // 30 seconds timeout for creating project + API key + 34 actions
        }
      )

      return result
    }),

  // Get all projects for user's organizations
  getAll: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().optional(),
        status: z.enum(['ACTIVE', 'CREATED', 'COMPLETED']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get user's organization memberships
      const organizationMemberships = await ctx.db.organizationMember.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(input.organizationId && { organizationId: input.organizationId }),
        },
      })

      // Get organizations with filtered projects
      const organizationsWithProjects = await ctx.db.organization.findMany({
        where: {
          id: {
            in: organizationMemberships.map(
              (membership) => membership.organizationId
            ),
          },
        },
        include: {
          projects: {
            where: {
              ...(input.status && { status: input.status }),
            },
            include: {
              createdBy: {
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
                  products: true,
                  agents: true,
                },
              },
            },
          },
        },
      })

      // Create a map of organization memberships for role checking
      const membershipRoles = new Map(
        organizationMemberships.map((membership) => [
          membership.organizationId,
          membership.role,
        ])
      )

      // Flatten projects from all organizations
      const projects = organizationsWithProjects.flatMap((organization) =>
        organization.projects.filter((project) => {
          // Check if user has access to this project
          const isProjectMember = project.members.some(
            (member) => member.userId === ctx.session.user.id
          )
          const membershipRole = membershipRoles.get(organization.id)
          const isOrgOwnerOrAdmin =
            membershipRole === 'OWNER' || membershipRole === 'ADMIN'

          return isProjectMember || isOrgOwnerOrAdmin
        })
      )

      return projects
    }),

  // Get project by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      console.log('🔍 getById called with:', {
        projectId: input.id,
        userId: ctx.session.user.id,
      })

      // Check if user has access to this project
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.id,
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
            select: {
              id: true,
              name: true,
            },
          },
          createdBy: {
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
          products: {
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
          agents: {
            include: {
              _count: {
                select: {
                  chats: true,
                },
              },
            },
          },
        },
      })

      console.log('📊 Project query result:', {
        found: !!project,
        projectId: project?.id || null,
      })

      if (!project) {
        console.log(
          '❌ Project not found or access denied for user:',
          ctx.session.user.id
        )

        // Let's check if the project exists at all
        const projectExists = await ctx.db.project.findUnique({
          where: { id: input.id },
          select: { id: true, name: true, organizationId: true },
        })
        console.log('🔍 Project exists check:', {
          exists: !!projectExists,
          project: projectExists,
        })

        // Let's check user's organization memberships
        const userOrgMemberships = await ctx.db.organizationMember.findMany({
          where: { userId: ctx.session.user.id },
          select: { organizationId: true, role: true },
        })
        console.log('👥 User org memberships:', userOrgMemberships)

        // Let's check user's project memberships
        const userProjectMemberships = await ctx.db.projectMember.findMany({
          where: { userId: ctx.session.user.id },
          select: { projectId: true, role: true },
        })
        console.log('📋 User project memberships:', userProjectMemberships)

        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "Project not found or you don't have access to it",
        })
      }

      console.log('✅ Project found and access granted:', {
        projectId: project.id,
        projectName: project.name,
      })
      return project
    }),

  // Update project
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(['CREATED', 'ACTIVE', 'COMPLETED']).optional(),
        logoUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to update this project
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.id,
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
          message: "You don't have permission to update this project",
        })
      }

      const updatedProject = await ctx.db.project.update({
        where: { id: input.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.description && { description: input.description }),
          ...(input.status && { status: input.status }),
          ...(input.logoUrl && { logoUrl: input.logoUrl }),
        },
      })

      return updatedProject
    }),

  // Delete project
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      console.log('🚀 PROJECT_DELETE_STARTED:', {
        projectId: input.id,
        userId: ctx.session.user.id,
        timestamp: new Date().toISOString(),
      })

      // 1. Check permissions
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.id,
          OR: [
            {
              members: { some: { userId: ctx.session.user.id, role: 'ADMIN' } },
            },
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
        console.log('❌ PROJECT_DELETE_PERMISSION_DENIED:', {
          projectId: input.id,
          userId: ctx.session.user.id,
          timestamp: new Date().toISOString(),
        })
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            "You don't have permission to delete this project. Only project admins or organization owners can delete projects.",
        })
      }

      console.log('✅ PROJECT_DELETE_PERMISSIONS_VERIFIED:', {
        projectId: project.id,
        projectName: project.name,
        userId: ctx.session.user.id,
      })

      // Check if the project is being used in other critical places
      const hasActiveDependencies = await ctx.db.project.findFirst({
        where: {
          id: input.id,
          OR: [
            { products: { some: {} } },
            // { agents: { some: {} } }, // Uncomment if you add agents in the future
          ],
        },
        include: {
          products: true,
          // agents: true, // Uncomment if you add agents in the future
        },
      })

      if (hasActiveDependencies) {
        console.log('⚠️ PROJECT_DELETE_HAS_DEPENDENCIES:', {
          projectId: input.id,
          hasProducts: hasActiveDependencies.products?.length > 0,
          // hasAgents: hasActiveDependencies.agents?.length > 0, // Uncomment if you add agents
        })

        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Cannot delete project with active products. Please remove them first.',
        })
      }

      // 2. Get all S3 files associated with the project
      const files = await ctx.db.projectFile.findMany({
        where: { projectId: input.id },
        select: { s3Bucket: true, s3Key: true },
      })

      console.log('📁 PROJECT_DELETE_FILES_FOUND:', {
        projectId: input.id,
        fileCount: files.length,
        files: files.map((f) => ({ bucket: f.s3Bucket, key: f.s3Key })),
      })

      // 3. Delete files from S3 (TEMPORARILY COMMENTED)
      /*
      try {
        console.log('📁 Found files to delete:', files.length)
        for (const file of files) {
          console.log('🗑️ Deleting file:', { bucket: file.s3Bucket, key: file.s3Key })
          if (file.s3Bucket && file.s3Key) {
            await s3Client.send(
              new DeleteObjectCommand({
                Bucket: file.s3Bucket,
                Key: file.s3Key,
              })
            )
            console.log('✅ File deleted from S3:', file.s3Key)
          }
        }
      } catch (err) {
        console.error('❌ S3 deletion error:', err)
        console.error('S3 error details:', {
          message: err?.message,
          code: err?.code,
          name: err?.name
        })
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete project files from S3. Project not deleted.',
        })
      }
      */

      // 4. Delete the project and all related data in a transaction
      try {
        await ctx.db.$transaction(async (tx) => {
          console.log('💾 PROJECT_DELETE_TRANSACTION_STARTED:', {
            projectId: input.id,
          })

          // Step 1: Get all warehouse IDs for this project
          const warehouses = await tx.projectProductWarehouse.findMany({
            where: { projectId: input.id },
            select: { id: true },
          })
          const warehouseIds = warehouses.map((w) => w.id)

          console.log('📦 Found warehouses:', warehouseIds.length)

          // Step 2: Delete stock movements (depends on warehouses)
          if (warehouseIds.length > 0) {
            const deletedStockMovements =
              await tx.projectProductStockMovement.deleteMany({
                where: { warehouseId: { in: warehouseIds } },
              })
            console.log(
              '📊 Deleted stock movements:',
              deletedStockMovements.count
            )
          }

          // Step 3: Delete order items (depends on warehouses)
          if (warehouseIds.length > 0) {
            const deletedOrderItems = await tx.projectOrdersItems.deleteMany({
              where: { warehouseId: { in: warehouseIds } },
            })
            console.log('🛒 Deleted order items:', deletedOrderItems.count)
          }

          // Step 4: Delete product warehouse relations
          if (warehouseIds.length > 0) {
            const deletedProductWarehouses = await tx.productWarehouse.deleteMany(
              {
                where: { warehouseId: { in: warehouseIds } },
              }
            )
            console.log(
              '📦 Deleted product warehouses:',
              deletedProductWarehouses.count
            )
          }

          // Step 5: Delete categories relations
          const categories = await tx.projectCategory.findMany({
            where: { projectId: input.id },
            select: { id: true },
          })
          const categoryIds = categories.map((c) => c.id)

          if (categoryIds.length > 0) {
            const deletedProductCategories =
              await tx.projectProductCategory.deleteMany({
                where: { categoryId: { in: categoryIds } },
              })
            const deletedServiceCategories =
              await tx.projectServiceCategory.deleteMany({
                where: { categoryId: { in: categoryIds } },
              })
            console.log(
              '🏷️ Deleted category relations:',
              deletedProductCategories.count + deletedServiceCategories.count
            )
          }

          // Step 6: Delete other project-related data
          const deletedFiles = await tx.projectFile.deleteMany({
            where: { projectId: input.id },
          })
          const deletedFaqs = await tx.projectFaq.deleteMany({
            where: { projectId: input.id },
          })
          const deletedMembers = await tx.projectMember.deleteMany({
            where: { projectId: input.id },
          })

          console.log('🗂️ Deleted basic data:', {
            files: deletedFiles.count,
            faqs: deletedFaqs.count,
            members: deletedMembers.count,
          })

          // Step 7: Now the project can be deleted (Cascade will handle the rest)
          await tx.project.delete({ where: { id: input.id } })
          console.log('✅ PROJECT_DELETE_COMPLETED:', {
            projectId: input.id,
            projectName: project.name,
            userId: ctx.session.user.id,
            timestamp: new Date().toISOString(),
          })
        },
        {
          timeout: 30000, // 30 seconds timeout for deleting project with all related data
        })

        return { success: true }
      } catch (error: any) {
        console.error('❌ PROJECT_DELETE_TRANSACTION_FAILED:', {
          projectId: input.id,
          error: error?.message,
          timestamp: new Date().toISOString(),
        })

        // Errores más específicos según el tipo
        if (error?.code === 'P2003') {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message:
              'Cannot delete project due to existing dependencies. Please remove all related data first.',
          })
        }

        if (error?.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Project not found or has already been deleted.',
          })
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            'Failed to delete project. Please try again or contact support.',
        })
      }
    }),

  // Add member to project
  addMember: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        userId: z.string(),
        role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to add members to this project
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
        include: {
          organization: true,
        },
      })

      if (!project) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have permission to add members to this project",
        })
      }

      // Check if the user to be added is a member of the organization
      const organizationMember = await ctx.db.organizationMember.findFirst({
        where: {
          organizationId: project.organizationId,
          userId: input.userId,
        },
      })

      if (!organizationMember) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User must be a member of the organization first',
        })
      }

      // Check if user is already a project member
      const existingMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: input.projectId,
          userId: input.userId,
        },
      })

      if (existingMember) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User is already a member of this project',
        })
      }

      const projectMember = await ctx.db.projectMember.create({
        data: {
          projectId: input.projectId,
          userId: input.userId,
          role: input.role,
        },
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
      })

      return projectMember
    }),

  // Remove member from project
  removeMember: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to remove members from this project
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
            "You don't have permission to remove members from this project",
        })
      }

      // Check if the member exists
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: input.projectId,
          userId: input.userId,
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User is not a member of this project',
        })
      }

      await ctx.db.projectMember.delete({
        where: {
          id: projectMember.id,
        },
      })

      return { success: true }
    }),

  // Update member role
  updateMemberRole: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        userId: z.string(),
        role: z.enum(['ADMIN', 'MEMBER']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to update member roles in this project
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
            "You don't have permission to update member roles in this project",
        })
      }

      // Check if the member exists
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: input.projectId,
          userId: input.userId,
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User is not a member of this project',
        })
      }

      const updatedMember = await ctx.db.projectMember.update({
        where: {
          id: projectMember.id,
        },
        data: {
          role: input.role,
        },
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
      })

      return updatedMember
    }),

  // Get available project statuses
  getStatuses: protectedProcedure.query(() => {
    return getAvailableProjectStatuses()
  }),

  // Update project status
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['CREATED', 'ACTIVE', 'COMPLETED']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to update this project
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.id,
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
          message: "You don't have permission to update this project",
        })
      }

      const updatedProject = await ctx.db.project.update({
        where: { id: input.id },
        data: {
          status: input.status,
        },
      })

      return updatedProject
    }),
})
