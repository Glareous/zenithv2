import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
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

export const projectServiceFileRouter = createTRPCRouter({
  // Get presigned URL for uploading service images
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        serviceId: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log('🔍 getUploadUrl called for service file:', {
        serviceId: input.serviceId,
        fileName: input.fileName,
        fileType: input.fileType,
        fileSize: input.fileSize,
        userId: ctx.session.user.id,
      })

      // Check if user has access to this service
      const service = await ctx.db.projectService.findFirst({
        where: {
          id: input.serviceId,
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
        },
      })

      if (!service) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this service",
        })
      }

      // Generate unique file name
      const fileExtension = input.fileName.split('.').pop()
      const uniqueFileName = `${uuidv4()}.${fileExtension}`
      const s3Key = `services/${input.serviceId}/files/${uniqueFileName}`

      // Create presigned URL for upload
      const putObjectCommand = new PutObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: s3Key,
        ContentType: input.fileType,
      })

      const presignedUrl = await getSignedUrl(s3Client, putObjectCommand, {
        expiresIn: 3600, // 1 hour
      })

      return {
        uploadUrl: presignedUrl,
        s3Key,
        fileName: uniqueFileName,
      }
    }),

  // Create file record after successful upload to S3
  create: protectedProcedure
    .input(
      z.object({
        serviceId: z.string(),
        name: z.string(),
        fileName: z.string(),
        fileType: z.enum(['DOCUMENT', 'IMAGE', 'VIDEO', 'AUDIO', 'OTHER']),
        mimeType: z.string(),
        fileSize: z.number(),
        s3Key: z.string(),
        description: z.string().optional(),
        isPublic: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log('💾 create service file called with:', {
        serviceId: input.serviceId,
        fileName: input.fileName,
        fileType: input.fileType,
        mimeType: input.mimeType,
        fileSize: input.fileSize,
        s3Key: input.s3Key,
        userId: ctx.session.user.id,
      })

      // Check if user has access to this service
      const service = await ctx.db.projectService.findFirst({
        where: {
          id: input.serviceId,
          project: {
            members: {
              some: {
                userId: ctx.session.user.id,
              },
            },
          },
        },
      })

      if (!service) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this service",
        })
      }

      const s3Url = `https://${env.S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${input.s3Key}`

      console.log('💾 Creating service file record with:', {
        s3Url,
        bucketName: env.S3_BUCKET_NAME,
        userId: ctx.session.user.id,
      })

      const file = await ctx.db.projectServiceFile.create({
        data: {
          name: input.name,
          fileName: input.fileName,
          fileType: input.fileType,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
          s3Key: input.s3Key,
          s3Bucket: env.S3_BUCKET_NAME,
          s3Url,
          description: input.description,
          isPublic: input.isPublic,
          serviceId: input.serviceId,
          uploadedById: ctx.session.user.id,
        },
      })

      return file
    }),

  // Get all files for a service
  getAll: protectedProcedure
    .input(
      z.object({
        serviceId: z.string(),
        fileType: z
          .enum(['DOCUMENT', 'IMAGE', 'VIDEO', 'AUDIO', 'OTHER'])
          .optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user has access to this service
      const service = await ctx.db.projectService.findFirst({
        where: {
          id: input.serviceId,
          project: {
            members: {
              some: {
                userId: ctx.session.user.id,
              },
            },
          },
        },
      })

      if (!service) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this service",
        })
      }

      const files = await ctx.db.projectServiceFile.findMany({
        where: {
          serviceId: input.serviceId,
          ...(input.fileType && { fileType: input.fileType }),
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
        skip: input.offset,
      })

      const totalCount = await ctx.db.projectServiceFile.count({
        where: {
          serviceId: input.serviceId,
          ...(input.fileType && { fileType: input.fileType }),
        },
      })

      return {
        files,
        totalCount,
        hasMore: input.offset + input.limit < totalCount,
      }
    }),

  // Get file by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const file = await ctx.db.projectServiceFile.findFirst({
        where: {
          id: input.id,
          service: {
            project: {
              members: {
                some: {
                  userId: ctx.session.user.id,
                },
              },
            },
          },
        },

        include: {
          uploadedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      })

      if (!file) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found or you do not have access to it',
        })
      }

      return file
    }),

  // Delete file and remove from S3
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Find file and check permissions
      const file = await ctx.db.projectServiceFile.findFirst({
        where: {
          id: input.id,
          service: {
            project: {
              members: {
                some: {
                  userId: ctx.session.user.id,
                  role: { in: ['ADMIN'] },
                },
              },
            },
          },
        },
      })

      if (!file) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have permission to delete this file",
        })
      }

      // Delete from S3
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: file.s3Bucket,
            Key: file.s3Key,
          })
        )
      } catch (err) {
        // Log error but continue to delete DB record
        console.error('Error deleting file from S3:', err)
      }

      // Delete from DB
      await ctx.db.projectServiceFile.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
