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

export const projectAgentFileRouter = createTRPCRouter({
  // Get all files for an agent
  getAll: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        fileType: z
          .enum(['DOCUMENT', 'IMAGE', 'VIDEO', 'AUDIO', 'OTHER'])
          .optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user has access to this agent
      const agent = await ctx.db.projectAgent.findFirst({
        where: {
          id: input.agentId,
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

      if (!agent) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this agent",
        })
      }

      const files = await ctx.db.projectAgentFile.findMany({
        where: {
          agentId: input.agentId,
          ...(input.fileType && { fileType: input.fileType }),
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
        orderBy: {
          createdAt: 'desc',
        },
        take: input.limit,
        skip: input.offset,
      })

      return files
    }),

  // Get file by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const file = await ctx.db.projectAgentFile.findFirst({
        where: {
          id: input.id,
          agent: {
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
          agent: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      })

      if (!file) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "File not found or you don't have access to it",
        })
      }

      return file
    }),

  // Get presigned URL for uploading
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log('📤 getUploadUrl called with:', {
        agentId: input.agentId,
        fileName: input.fileName,
        fileType: input.fileType,
        fileSize: input.fileSize,
        userId: ctx.session.user.id,
      })

      // Check if user has access to this agent
      const agent = await ctx.db.projectAgent.findFirst({
        where: {
          id: input.agentId,
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

      if (!agent) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this agent",
        })
      }

      // Generate unique file name
      const fileExtension = input.fileName.split('.').pop()
      const uniqueFileName = `${uuidv4()}.${fileExtension}`
      const s3Key = `agents/${input.agentId}/files/${uniqueFileName}`

      console.log('🔑 Generated S3 details:', {
        fileExtension,
        uniqueFileName,
        s3Key,
        bucketName: env.S3_BUCKET_NAME,
      })

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

        console.log('✅ Upload URL generated successfully:', {
          uploadUrlLength: uploadUrl.length,
          s3Key,
          fileName: uniqueFileName,
        })

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
        agentId: z.string(),
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
      console.log('�� create file called with:', {
        agentId: input.agentId,
        fileName: input.fileName,
        fileType: input.fileType,
        mimeType: input.mimeType,
        fileSize: input.fileSize,
        s3Key: input.s3Key,
        userId: ctx.session.user.id,
      })

      // Check if user has access to this agent
      const agent = await ctx.db.projectAgent.findFirst({
        where: {
          id: input.agentId,
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

      if (!agent) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this agent",
        })
      }

      const s3Url = `https://${env.S3_BUCKET_NAME}.s3.us-east-2.amazonaws.com/${input.s3Key}`

      console.log('💾 Creating file record with:', {
        s3Url,
        bucketName: env.S3_BUCKET_NAME,
        userId: ctx.session.user.id,
      })

      const file = await ctx.db.projectAgentFile.create({
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
          agentId: input.agentId,
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

      console.log('✅ File record created successfully:', {
        fileId: file.id,
        fileName: file.name,
        s3Key: file.s3Key,
      })

      return file
    }),

  // Get presigned URL for downloading
  getDownloadUrl: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      console.log('📥 getDownloadUrl called with:', { fileId: input.id })

      const file = await ctx.db.projectAgentFile.findFirst({
        where: {
          id: input.id,
          agent: {
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
        },
      })

      if (!file) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "File not found or you don't have access to it",
        })
      }

      try {
        const command = new GetObjectCommand({
          Bucket: file.s3Bucket,
          Key: file.s3Key,
        })

        const downloadUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        }) // 1 hour

        return {
          downloadUrl,
          fileName: file.name,
          fileType: file.fileType,
        }
      } catch (error) {
        console.error('S3 download URL generation error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate download URL',
        })
      }
    }),

  // Update file metadata
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        isPublic: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log('✏️ update file called with:', { fileId: input.id })

      const file = await ctx.db.projectAgentFile.findFirst({
        where: {
          id: input.id,
          agent: {
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
          message: "File not found or you don't have permission to update it",
        })
      }

      const updatedFile = await ctx.db.projectAgentFile.update({
        where: { id: input.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.description !== undefined && {
            description: input.description,
          }),
          ...(input.isPublic !== undefined && { isPublic: input.isPublic }),
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

      return updatedFile
    }),

  // Delete file
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      console.log('🗑️ delete file called with:', { fileId: input.id })

      const file = await ctx.db.projectAgentFile.findFirst({
        where: {
          id: input.id,
          agent: {
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
        await ctx.db.projectAgentFile.delete({
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

  // Combined upload and create file endpoint
  uploadAndCreate: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
        description: z.string().optional(),
        isPublic: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log('🚀 uploadAndCreate called with:', {
        agentId: input.agentId,
        fileName: input.fileName,
        fileType: input.fileType,
        fileSize: input.fileSize,
        userId: ctx.session.user.id,
      })

      // Check if user has access to this agent
      const agent = await ctx.db.projectAgent.findFirst({
        where: {
          id: input.agentId,
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

      if (!agent) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this agent",
        })
      }

      // Generate unique file name
      const fileExtension = input.fileName.split('.').pop()
      const uniqueFileName = `${uuidv4()}.${fileExtension}`
      const s3Key = `agents/${input.agentId}/files/${uniqueFileName}`

      console.log('🔑 Generated S3 details:', {
        fileExtension,
        uniqueFileName,
        s3Key,
        bucketName: env.S3_BUCKET_NAME,
      })

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

        console.log('✅ Upload URL generated successfully:', {
          uploadUrlLength: uploadUrl.length,
          s3Key,
          fileName: uniqueFileName,
        })

        return {
          uploadUrl,
          s3Key,
          fileName: uniqueFileName,
          fileId: null,
        }
      } catch (error) {
        console.error('Upload and create error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to prepare file upload',
        })
      }
    }),
})
