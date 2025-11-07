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

export const projectContactFileRouter = createTRPCRouter({
  // Get presigned URL for uploading contact images
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        contactId: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log('🔍 getUploadUrl called for contact file:', {
        contactId: input.contactId,
        fileName: input.fileName,
        fileType: input.fileType,
        fileSize: input.fileSize,
        userId: ctx.session.user.id,
      })

      // Check if user has access to this contact
      const contact = await ctx.db.projectContact.findFirst({
        where: {
          id: input.contactId,
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

      if (!contact) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this contact",
        })
      }

      // Generate unique file name
      const fileExtension = input.fileName.split('.').pop()
      const uniqueFileName = `${uuidv4()}.${fileExtension}`
      const s3Key = `contacts/${input.contactId}/files/${uniqueFileName}`

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
        contactId: z.string(),
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
      console.log('🔍 create called for contact file:', {
        contactId: input.contactId,
        fileName: input.fileName,
        userId: ctx.session.user.id,
      })

      // Check if user has access to this contact
      const contact = await ctx.db.projectContact.findFirst({
        where: {
          id: input.contactId,
          project: {
            members: {
              some: {
                userId: ctx.session.user.id,
              },
            },
          },
        },
      })

      if (!contact) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this contact",
        })
      }

      // Verificar que la variable de entorno esté definida
      if (!env.S3_BUCKET_NAME) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'S3 bucket name is not configured',
        })
      }

      // Create file record with auto-generated s3Bucket and s3Url
      const file = await ctx.db.projectContactFile.create({
        data: {
          contactId: input.contactId,
          name: input.name,
          fileName: input.fileName,
          fileType: input.fileType,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
          s3Key: input.s3Key,
          s3Bucket: env.S3_BUCKET_NAME,
          s3Url: `https://${env.S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${input.s3Key}`,
          description: input.description,
          isPublic: input.isPublic,
          uploadedById: ctx.session.user.id,
        },
      })

      return file
    }),

  // Delete file from S3 and database
  delete: protectedProcedure
    .input(
      z.object({
        fileId: z.string(),
        contactId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log('🔍 delete called for contact file:', {
        fileId: input.fileId,
        contactId: input.contactId,
        userId: ctx.session.user.id,
      })

      // Check if user has access to this contact
      const contact = await ctx.db.projectContact.findFirst({
        where: {
          id: input.contactId,
          project: {
            members: {
              some: {
                userId: ctx.session.user.id,
              },
            },
          },
        },
      })

      if (!contact) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this contact",
        })
      }

      // Get file record
      const file = await ctx.db.projectContactFile.findFirst({
        where: {
          id: input.fileId,
          contactId: input.contactId,
        },
      })

      if (!file) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found',
        })
      }

      // Delete from S3
      try {
        const deleteObjectCommand = new DeleteObjectCommand({
          Bucket: file.s3Bucket,
          Key: file.s3Key,
        })

        await s3Client.send(deleteObjectCommand)
        console.log('✅ File deleted from S3:', file.s3Key)
      } catch (error) {
        console.error('❌ Error deleting file from S3:', error)
        // Continue with database deletion even if S3 deletion fails
      }

      // Delete from database
      await ctx.db.projectContactFile.delete({
        where: {
          id: input.fileId,
        },
      })

      return { success: true }
    }),
})
