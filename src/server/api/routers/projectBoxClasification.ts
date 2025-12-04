import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '@src/env'
import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
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

export const projectBoxClasificationRouter = createTRPCRouter({
  // Get all box clasifications for a project
  getByProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user has access to this project
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: input.projectId,
          userId: ctx.session.user.id,
        },
      })

      const organizationMember = await ctx.db.organizationMember.findFirst({
        where: {
          organization: {
            projects: {
              some: {
                id: input.projectId,
              },
            },
          },
          userId: ctx.session.user.id,
          role: { in: ['OWNER', 'ADMIN'] },
        },
      })

      if (!projectMember && !organizationMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this project",
        })
      }

      return await ctx.db.projectBoxClasification.findMany({
        where: { projectId: input.projectId },
        orderBy: { createdAt: 'desc' },
      })
    }),

  // Get a single box clasification by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const boxClasification = await ctx.db.projectBoxClasification.findFirst({
        where: {
          id: input.id,
          project: {
            OR: [
              {
                members: {
                  some: {
                    userId: ctx.session.user.id,
                  },
                },
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
        },
        include: {
          files: true,
        },
      })

      if (!boxClasification) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Box clasification not found',
        })
      }

      return boxClasification
    }),

  // Create a new box clasification
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        description: z.string().min(1),
        video: z.string().optional(), // S3 URL
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has admin access to create box clasifications
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: input.projectId,
          userId: ctx.session.user.id,
          role: { in: ['ADMIN'] },
        },
      })

      const organizationMember = await ctx.db.organizationMember.findFirst({
        where: {
          organization: {
            projects: {
              some: {
                id: input.projectId,
              },
            },
          },
          userId: ctx.session.user.id,
          role: { in: ['OWNER', 'ADMIN'] },
        },
      })

      if (!projectMember && !organizationMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have permission to create box clasifications in this project",
        })
      }

      const { projectId, ...data } = input

      return await ctx.db.projectBoxClasification.create({
        data: {
          ...data,
          projectId,
          processedVideo: data.video, // Initially, processed video is the same as uploaded video
        },
      })
    }),

  // Update a box clasification
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(200).optional(),
        description: z.string().min(1).optional(),
        video: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has admin access
      const boxClasification = await ctx.db.projectBoxClasification.findFirst({
        where: {
          id: input.id,
          project: {
            OR: [
              {
                members: {
                  some: {
                    userId: ctx.session.user.id,
                    role: 'ADMIN',
                  },
                },
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
        },
      })

      if (!boxClasification) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Box clasification not found or you don't have permission to update it",
        })
      }

      const { id, ...updateData } = input

      // If video is being updated, also update processedVideo
      const dataToUpdate: any = { ...updateData }
      if (updateData.video) {
        dataToUpdate.processedVideo = updateData.video
      }

      return await ctx.db.projectBoxClasification.update({
        where: { id },
        data: dataToUpdate,
      })
    }),

  // Delete a box clasification
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has admin access
      const boxClasification = await ctx.db.projectBoxClasification.findFirst({
        where: {
          id: input.id,
          project: {
            OR: [
              {
                members: {
                  some: {
                    userId: ctx.session.user.id,
                    role: 'ADMIN',
                  },
                },
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
        },
      })

      if (!boxClasification) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Box clasification not found or you don't have permission to delete it",
        })
      }

      return await ctx.db.projectBoxClasification.delete({
        where: { id: input.id },
      })
    }),

  // Get presigned URL for video upload
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this project
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: input.projectId,
          userId: ctx.session.user.id,
        },
      })

      const organizationMember = await ctx.db.organizationMember.findFirst({
        where: {
          organization: {
            projects: {
              some: {
                id: input.projectId,
              },
            },
          },
          userId: ctx.session.user.id,
          role: { in: ['OWNER', 'ADMIN'] },
        },
      })

      if (!projectMember && !organizationMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this project",
        })
      }

      // Generate unique file name
      const fileExtension = input.fileName.split('.').pop()
      const uniqueFileName = `${uuidv4()}.${fileExtension}`
      const s3Key = `projects/${input.projectId}/box-clasification/${uniqueFileName}`

      try {
        // Generate presigned URL for upload
        const command = new PutObjectCommand({
          Bucket: env.S3_BUCKET_NAME,
          Key: s3Key,
          ContentType: input.fileType,
          ContentLength: input.fileSize,
        })

        const uploadUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600, // 1 hour
        })

        const s3Url = `https://${env.S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${s3Key}`

        return {
          uploadUrl,
          s3Key,
          s3Url,
          fileName: uniqueFileName,
        }
      } catch (error) {
        console.error('Error generating upload URL:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate upload URL',
        })
      }
    }),
})
