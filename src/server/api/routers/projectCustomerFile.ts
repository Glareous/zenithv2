import {
  DeleteObjectCommand,
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

export const projectCustomerFileRouter = createTRPCRouter({
  // Get presigned URL for uploading customer profile images
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        customerId: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this customer
      const customer = await ctx.db.projectCustomer.findFirst({
        where: {
          id: input.customerId,
          project: {
            members: {
              some: {
                userId: ctx.session.user.id,
              },
            },
          },
        },
      })

      if (!customer) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this customer",
        })
      }

      // Generate unique file name
      const fileExtension = input.fileName.split('.').pop()
      const uniqueFileName = `${uuidv4()}.${fileExtension}`
      const s3Key = `customers/${input.customerId}/files/${uniqueFileName}`

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
        customerId: z.string(),
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
      // Check if user has access to this customer
      const customer = await ctx.db.projectCustomer.findFirst({
        where: {
          id: input.customerId,
          project: {
            members: {
              some: {
                userId: ctx.session.user.id,
              },
            },
          },
        },
      })

      if (!customer) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this customer",
        })
      }

      const file = await ctx.db.projectCustomerFile.create({
        data: {
          customerId: input.customerId,
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

  // Delete file (from S3 and DB)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Find file
      const file = await ctx.db.projectCustomerFile.findFirst({
        where: {
          id: input.id,
          customer: {
            project: {
              members: {
                some: {
                  userId: ctx.session.user.id,
                },
              },
            },
          },
        },
      })

      if (!file) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found or you do not have permission to delete it',
        })
      }

      // Delete from S3
      const deleteObjectCommand = new DeleteObjectCommand({
        Bucket: file.s3Bucket,
        Key: file.s3Key,
      })
      await s3Client.send(deleteObjectCommand)

      // Delete from DB
      await ctx.db.projectCustomerFile.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
