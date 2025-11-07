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

export const organizationFileRouter = createTRPCRouter({
  // Get all files for an organization
  getAll: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        fileType: z
          .enum(['DOCUMENT', 'IMAGE', 'VIDEO', 'AUDIO', 'OTHER'])
          .optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is SUPERADMIN or organization member
      const isSuperAdmin = ctx.session.user.role === 'SUPERADMIN'
      const isOrgMember = await ctx.db.organizationMember.findFirst({
        where: {
          organizationId: input.organizationId,
          userId: ctx.session.user.id,
        },
      })

      if (!isSuperAdmin && !isOrgMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this organization",
        })
      }

      const files = await ctx.db.organizationFile.findMany({
        where: {
          organizationId: input.organizationId,
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

  // Get presigned URL for uploading
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is SUPERADMIN
      if (ctx.session.user.role !== 'SUPERADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only super admins can upload organization files',
        })
      }

      // Verify organization exists
      const organization = await ctx.db.organization.findUnique({
        where: { id: input.organizationId },
      })

      if (!organization) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        })
      }

      // Generate unique file name
      const fileExtension = input.fileName.split('.').pop()
      const uniqueFileName = `${uuidv4()}.${fileExtension}`
      const s3Key = `organizations/${input.organizationId}/files/${uniqueFileName}`

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
        organizationId: z.string(),
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
      // Check if user is SUPERADMIN
      if (ctx.session.user.role !== 'SUPERADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only super admins can create organization files',
        })
      }

      // Verify organization exists
      const organization = await ctx.db.organization.findUnique({
        where: { id: input.organizationId },
      })

      if (!organization) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        })
      }

      const s3Url = `https://${env.S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${input.s3Key}`

      const file = await ctx.db.organizationFile.create({
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
          organizationId: input.organizationId,
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

  // Get presigned URL for downloading
  getDownloadUrl: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.db.organizationFile.findFirst({
        where: {
          id: input.id,
        },
      })

      if (!file) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found',
        })
      }

      // Check if user is SUPERADMIN or organization member
      const isSuperAdmin = ctx.session.user.role === 'SUPERADMIN'
      const isOrgMember = await ctx.db.organizationMember.findFirst({
        where: {
          organizationId: file.organizationId,
          userId: ctx.session.user.id,
        },
      })

      if (!isSuperAdmin && !isOrgMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this file",
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

  // Delete file
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is SUPERADMIN
      if (ctx.session.user.role !== 'SUPERADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only super admins can delete organization files',
        })
      }

      const file = await ctx.db.organizationFile.findUnique({
        where: { id: input.id },
      })

      if (!file) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found',
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
        await ctx.db.organizationFile.delete({
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
