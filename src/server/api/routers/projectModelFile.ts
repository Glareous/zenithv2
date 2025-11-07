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

export const projectModelFileRouter = createTRPCRouter({
  // Get presigned URL for uploading
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        modelId: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this model
      const model = await ctx.db.projectModel.findFirst({
        where: {
          id: input.modelId,
          project: {
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
        },
      })

      if (!model) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this model",
        })
      }

      // Generate unique file name
      const fileExtension = input.fileName.split('.').pop()
      const uniqueFileName = `${uuidv4()}.${fileExtension}`
      const s3Key = `models/${input.modelId}/icons/${uniqueFileName}`

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

        return {
          uploadUrl,
          s3Key,
          fileName: uniqueFileName,
        }
      } catch (error) {
        console.error('S3 upload URL generation error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate upload URL',
        })
      }
    }),

  // Create file record after successful upload
  create: protectedProcedure
    .input(
      z.object({
        modelId: z.string(),
        name: z.string(),
        fileName: z.string(),
        fileType: z.enum(['DOCUMENT', 'IMAGE', 'VIDEO', 'AUDIO', 'OTHER']),
        mimeType: z.string(),
        fileSize: z.number(),
        s3Key: z.string(),
        description: z.string().optional(),
        isPublic: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this model
      const model = await ctx.db.projectModel.findFirst({
        where: {
          id: input.modelId,
          project: {
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
        },
      })

      if (!model) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this model",
        })
      }

      const s3Url = `https://${env.S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${input.s3Key}`

      const file = await ctx.db.projectModelFile.create({
        data: {
          name: input.name,
          fileName: input.fileName,
          fileType: input.fileType,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
          s3Key: input.s3Key,
          s3Bucket: env.S3_BUCKET_NAME,
          s3Url: s3Url,
          description: input.description,
          isPublic: input.isPublic,
          modelId: input.modelId,
          uploadedById: ctx.session.user.id,
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      })

      return file
    }),

  // Delete file
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.db.projectModelFile.findFirst({
        where: {
          id: input.id,
          model: {
            project: {
              OR: [
                // User is a project member with admin role
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
          },
        },
      })

      if (!file) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "File not found or you don't have permission to delete it",
        })
      }

      try {
        // Delete file from S3
        const deleteCommand = new DeleteObjectCommand({
          Bucket: file.s3Bucket,
          Key: file.s3Key,
        })

        await s3Client.send(deleteCommand)

        // Delete file record from database
        await ctx.db.projectModelFile.delete({
          where: { id: input.id },
        })

        return { success: true }
      } catch (error) {
        console.error('S3 file deletion error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete file',
        })
      }
    }),
})
