import {
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

export const projectEmployeeFileRouter = createTRPCRouter({
  // Get presigned URL for uploading
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        employeeId: z.string().min(1, 'Employee ID is required'),
        fileName: z.string().min(1, 'File name is required'),
        fileType: z.string().min(1, 'File type is required'),
        fileSize: z.number().min(1, 'File size is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get employee to check project access
      const employee = await ctx.db.projectEmployee.findUnique({
        where: { id: input.employeeId },
        select: { projectId: true },
      })

      if (!employee) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Employee not found',
        })
      }

      // Check if user has permission to upload files in this project
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: employee.projectId,
          userId: ctx.session.user.id,
          role: { in: ['ADMIN'] },
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            "You don't have permission to upload files for this employee",
        })
      }

      // Generate unique file name
      const fileExtension = input.fileName.split('.').pop()
      const uniqueFileName = `${uuidv4()}.${fileExtension}`
      const s3Key = `employees/${input.employeeId}/files/${uniqueFileName}`

      try {
        // Generate presigned URL for upload
        const command = new PutObjectCommand({
          Bucket: env.S3_BUCKET_NAME,
          Key: s3Key,
          ContentType: input.fileType,
        })

        const uploadUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600, // URL expires in 1 hour
        })

        const s3Url = `https://${env.S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${s3Key}`

        return {
          uploadUrl,
          s3Key,
          s3Bucket: env.S3_BUCKET_NAME,
          s3Url,
          fileName: uniqueFileName,
        }
      } catch (error) {
        console.error('❌ Error generating presigned URL:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate upload URL',
        })
      }
    }),

  // Upload a file for an employee
  create: protectedProcedure
    .input(
      z.object({
        employeeId: z.string().min(1, 'Employee ID is required'),
        name: z.string().min(1, 'File name is required'),
        fileName: z.string().min(1, 'File name in S3 is required'),
        fileType: z.enum(['DOCUMENT', 'IMAGE', 'VIDEO', 'AUDIO', 'OTHER']),
        category: z.enum(['PASSPORT_PHOTO', 'HIGH_SCHOOL_TRANSCRIPT']),
        mimeType: z.string().min(1, 'MIME type is required'),
        fileSize: z.number().min(1, 'File size is required'),
        s3Key: z.string().min(1, 'S3 key is required'),
        s3Bucket: z.string().min(1, 'S3 bucket is required'),
        s3Url: z.string().min(1, 'S3 URL is required'),
        description: z.string().optional(),
        isPublic: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get employee to check project access
      const employee = await ctx.db.projectEmployee.findUnique({
        where: { id: input.employeeId },
        select: { projectId: true },
      })

      if (!employee) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Employee not found',
        })
      }

      // Check if user has permission to upload files in this project
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: employee.projectId,
          userId: ctx.session.user.id,
          role: { in: ['ADMIN'] },
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            "You don't have permission to upload files for this employee",
        })
      }

      const file = await ctx.db.projectEmployeeFile.create({
        data: {
          name: input.name,
          fileName: input.fileName,
          fileType: input.fileType,
          category: input.category,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
          s3Key: input.s3Key,
          s3Bucket: input.s3Bucket,
          s3Url: input.s3Url,
          description: input.description,
          isPublic: input.isPublic,
          employeeId: input.employeeId,
          uploadedById: ctx.session.user.id,
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

      return file
    }),

  // Get all files for an employee
  getByEmployeeId: protectedProcedure
    .input(
      z.object({
        employeeId: z.string().min(1, 'Employee ID is required'),
        category: z.enum(['PASSPORT_PHOTO', 'HIGH_SCHOOL_TRANSCRIPT']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get employee to check project access
      const employee = await ctx.db.projectEmployee.findUnique({
        where: { id: input.employeeId },
        select: { projectId: true },
      })

      if (!employee) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Employee not found',
        })
      }

      // Check if user has access to this project
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: employee.projectId,
          userId: ctx.session.user.id,
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this employee's files",
        })
      }

      const where: any = {
        employeeId: input.employeeId,
      }

      if (input.category) {
        where.category = input.category
      }

      const files = await ctx.db.projectEmployeeFile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
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

      return files
    }),

  // Get file by ID
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, 'File ID is required'),
      })
    )
    .query(async ({ ctx, input }) => {
      const file = await ctx.db.projectEmployeeFile.findUnique({
        where: { id: input.id },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              projectId: true,
            },
          },
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
          message: 'File not found',
        })
      }

      // Check if user has access to this project
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: file.employee.projectId,
          userId: ctx.session.user.id,
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this file",
        })
      }

      return file
    }),

  // Delete file
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, 'File ID is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.db.projectEmployeeFile.findUnique({
        where: { id: input.id },
        include: {
          employee: {
            select: {
              projectId: true,
            },
          },
        },
      })

      if (!file) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found',
        })
      }

      // Check if user has permission to delete files in this project
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: file.employee.projectId,
          userId: ctx.session.user.id,
          role: { in: ['ADMIN'] },
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have permission to delete this file",
        })
      }

      // TODO: Delete file from S3 here
      // await deleteFromS3(file.s3Key, file.s3Bucket)

      await ctx.db.projectEmployeeFile.delete({
        where: { id: input.id },
      })

      return { success: true, message: 'File deleted successfully' }
    }),
})
