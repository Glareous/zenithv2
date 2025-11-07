import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { env } from '@src/env'
import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { z } from 'zod'

// Initialize S3 client
const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_API_KEY,
    secretAccessKey: env.AWS_SECRET_ACCESS_API_KEY,
  },
})

const createServiceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be greater than or equal to 0'),
  pricingType: z.enum(['HOURLY', 'FIXED', 'MONTHLY', 'SQUARE_METER']).default('FIXED'),
  imageUrl: z.string().optional(),
  projectId: z.string().min(1, 'ProjectId is required'),
  categoryIds: z.array(z.string()).min(1, 'At least one category is required'),
  isActive: z.boolean().default(true),
})

const updateServiceSchema = createServiceSchema.extend({
  id: z.string().min(1, 'ID is required'),
})

export const projectServiceRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createServiceSchema)
    .mutation(async ({ ctx, input }) => {
      const { projectId, categoryIds, ...serviceData } = input

      const membership = await ctx.db.projectMember.findFirst({
        where: {
          userId: ctx.session.user.id,
          projectId,
        },
      })

      if (!membership) {
        throw new Error(
          'You do not have permission to create services in this project'
        )
      }

      const service = await ctx.db.projectService.create({
        data: {
          ...serviceData,
          isActive: serviceData.isActive,
          projectId,
          createdById: ctx.session.user.id,
          categories: {
            create: categoryIds.map((categoryId) => ({
              categoryId,
            })),
          },
        },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
          files: true,
        },
      })

      return service
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, 'ProjectId is required'),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        categories: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const {
        projectId,
        page,
        limit,
        search,
        categories,
        isActive,
        minPrice,
        maxPrice,
      } = input
      const skip = (page - 1) * limit

      const membership = await ctx.db.projectMember.findFirst({
        where: {
          userId: ctx.session.user.id,
          projectId,
        },
      })

      if (!membership) {
        throw new Error(
          'You do not have permission to view services in this project'
        )
      }

      const where: any = { projectId }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      }

      if (categories && categories.length > 0) {
        where.categories = {
          some: {
            category: {
              name: { in: categories, mode: 'insensitive' },
            },
          },
        }
      }

      if (isActive !== undefined) {
        where.isActive = isActive
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {}
        if (minPrice !== undefined) {
          where.price.gte = minPrice
        }
        if (maxPrice !== undefined) {
          where.price.lte = maxPrice
        }
      }

      const [services, totalCount] = await Promise.all([
        ctx.db.projectService.findMany({
          where,
          include: {
            categories: {
              include: {
                category: true,
              },
            },
            files: true,
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        ctx.db.projectService.count({ where }),
      ])

      return {
        services,
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

  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, 'ID is required'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id } = input

      const service = await ctx.db.projectService.findUnique({
        where: { id },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
          files: true,
        },
      })

      if (!service) {
        throw new Error('Service not found')
      }

      const membership = await ctx.db.projectMember.findFirst({
        where: {
          userId: ctx.session.user.id,
          projectId: service.projectId,
        },
      })

      if (!membership) {
        throw new Error('You do not have permission to view this service')
      }

      return service
    }),

  update: protectedProcedure
    .input(updateServiceSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, projectId, categoryIds, ...serviceData } = input

      const existingService = await ctx.db.projectService.findUnique({
        where: { id },
        include: {
          categories: true,
        },
      })

      if (!existingService) {
        throw new Error('Service not found')
      }

      const membership = await ctx.db.projectMember.findFirst({
        where: {
          userId: ctx.session.user.id,
          projectId: existingService.projectId,
        },
      })

      if (!membership) {
        throw new Error('You do not have permission to update this service')
      }

      const updatedService = await ctx.db.$transaction(async (tx) => {
        await tx.projectServiceCategory.deleteMany({
          where: { serviceId: id },
        })

        const result = await tx.projectService.update({
          where: { id },
          data: {
            ...serviceData,
            isActive: serviceData.isActive,
            categories: {
              create: categoryIds.map((categoryId) => ({
                categoryId,
              })),
            },
          },
          include: {
            categories: { include: { category: true } },
            files: true,
          },
        })

        return result
      })

      return updatedService
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, 'ID is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input

      const existingService = await ctx.db.projectService.findUnique({
        where: { id },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      })

      if (!existingService) {
        throw new Error('Service not found')
      }

      const membership = await ctx.db.projectMember.findFirst({
        where: {
          userId: ctx.session.user.id,
          projectId: existingService.projectId,
        },
      })

      if (!membership) {
        throw new Error('You do not have permission to delete this service')
      }

      // Check if service has active order items
      const activeOrderServices = await ctx.db.projectOrdersServices.findMany({
        where: {
          serviceId: id,
          order: {
            status: { in: ['NEW', 'PENDING', 'SHIPPING'] },
          },
        },
        include: {
          order: {
            select: {
              orderId: true,
              status: true,
            },
          },
        },
      })

      if (activeOrderServices.length > 0) {
        const orderIds = [
          ...new Set(activeOrderServices.map((item) => item.order.orderId)),
        ].join(', ')

        throw new Error(
          `Cannot delete service. There are ${activeOrderServices.length} active order items in orders: ${orderIds}. Complete or cancel these orders first.`
        )
      }

      // Check if service is used in any agent workflows
      const workflowsUsingService = await ctx.db.projectAgentWorkflow.findMany({
        where: {
          agent: {
            projectId: existingService.projectId,
          },
        },
        include: {
          agent: {
            select: {
              name: true,
            },
          },
        },
      })

      const affectedAgents: string[] = []
      for (const workflow of workflowsUsingService) {
        const nodes = (workflow.nodes as any[]) || []
        const hasService = nodes.some((node: any) => {
          const services = node.data?.services || []
          return services.some((s: any) => s.id === id)
        })

        if (hasService) {
          affectedAgents.push(workflow.agent.name || 'Unnamed Agent')
        }
      }

      if (affectedAgents.length > 0) {
        const agentNames = affectedAgents.join(', ')
        throw new Error(
          `Cannot delete service. It is being used in ${affectedAgents.length} agent workflow(s): ${agentNames}. Remove the service from these workflows first.`
        )
      }

      await ctx.db.$transaction(async (tx) => {
        if (existingService.imageUrl) {
          console.log('️ Service has imageUrl:', existingService.imageUrl)

          // Search for files that match the service url
          const files = await tx.projectServiceFile.findMany({
            where: {
              s3Url: existingService.imageUrl,
            },
          })

          console.log(
            `📁 Found ${files.length} files matching service imageUrl`
          )

          // Delete found files
          for (const file of files) {
            try {
              // Delete from S3
              await s3Client.send(
                new DeleteObjectCommand({
                  Bucket: file.s3Bucket,
                  Key: file.s3Key,
                })
              )
              console.log(`✅ Deleted file from S3: ${file.s3Key}`)
            } catch (s3Error) {
              console.error('⚠️ Error deleting file from S3:', s3Error)
            }

            // Delete from database
            await tx.projectServiceFile.delete({
              where: { id: file.id },
            })
            console.log(`✅ Deleted file record from DB: ${file.id}`)
          }
        }

        // Delete service
        await tx.projectService.delete({
          where: { id },
        })
      })

      return { success: true }
    }),
})
