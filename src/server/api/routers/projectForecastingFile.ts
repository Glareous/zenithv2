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
import Papa from 'papaparse'
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

export const projectForecastingFileRouter = createTRPCRouter({
  // Get presigned URL for uploading
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        forecastingId: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this forecasting
      const forecasting = await ctx.db.projectForecasting.findFirst({
        where: {
          id: input.forecastingId,
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

      if (!forecasting) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this forecasting",
        })
      }

      // Generate unique file name
      const fileExtension = input.fileName.split('.').pop()
      const uniqueFileName = `${uuidv4()}.${fileExtension}`
      const s3Key = `forecasting/${input.forecastingId}/files/${uniqueFileName}`

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
        forecastingId: z.string(),
        name: z.string(),
        fileName: z.string(),
        fileType: z.string().default('CSV'),
        mimeType: z.string(),
        fileSize: z.number(),
        s3Key: z.string(),
        description: z.string().optional(),
        isPublic: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this forecasting
      const forecasting = await ctx.db.projectForecasting.findFirst({
        where: {
          id: input.forecastingId,
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

      if (!forecasting) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this forecasting",
        })
      }

      const s3Url = `https://${env.S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${input.s3Key}`

      // First, validate CSV before creating database record
      try {
        // Download CSV from S3
        const getCommand = new GetObjectCommand({
          Bucket: env.S3_BUCKET_NAME,
          Key: input.s3Key,
        })

        const response = await s3Client.send(getCommand)
        const csvContent = await response.Body?.transformToString()

        if (!csvContent) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'CSV file is empty or cannot be read',
          })
        }

        // Parse CSV using papaparse
        const parseResult = await new Promise<Papa.ParseResult<string[]>>(
          (resolve, reject) => {
            Papa.parse(csvContent, {
              complete: resolve,
              error: reject,
              skipEmptyLines: true,
            })
          }
        )

        // Validate CSV structure
        if (!parseResult.data || parseResult.data.length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'CSV_INVALID_FORMAT',
          })
        }

        // Skip first row if it looks like headers (non-numeric second column)
        let dataRows = parseResult.data
        if (dataRows.length > 0) {
          const firstRow = dataRows[0]
          if (firstRow && firstRow.length >= 2) {
            const secondColValue = firstRow[1]
            // If second column is not a number, assume it's a header row
            if (secondColValue && isNaN(parseFloat(secondColValue))) {
              dataRows = dataRows.slice(1)
            }
          }
        }

        // Check if we have at least one data row with 2 columns
        if (dataRows.length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'CSV_INVALID_FORMAT',
          })
        }

        // REGEX pattern for timestamp format: mm/dd/yyyy hh:mm:ss (American format)
        const timestampRegex = /^\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}:\d{2}$/

        // Helper function to parse mm/dd/yyyy hh:mm:ss to Date (American format)
        const parseTimestamp = (timestamp: string): Date | null => {
          // JavaScript's Date constructor natively supports mm/dd/yyyy format
          const date = new Date(timestamp)
          return isNaN(date.getTime()) ? null : date
        }

        // Extract and validate first two columns (timestamp and value)
        const parsedData = dataRows
          .filter((row) => row.length >= 2) // Only include rows with at least 2 columns
          .map((row) => {
            const timestamp = row[0]?.trim() ?? ''
            const value = row[1]?.trim() ?? ''

            // Validate timestamp format with REGEX
            if (!timestampRegex.test(timestamp)) {
              return null
            }

            // Parse timestamp to Date object
            const date = parseTimestamp(timestamp)
            if (!date) {
              return null
            }

            // Validate that value is numeric
            const numericValue = parseFloat(value)
            if (isNaN(numericValue)) {
              return null
            }

            return {
              timestamp,
              value,
              date, // Store parsed date for interval validation
            }
          })
          .filter((item): item is { timestamp: string; value: string; date: Date } => item !== null) // Remove invalid rows and fix TypeScript type

        // Must have at least one valid data row
        if (parsedData.length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'CSV_INVALID_FORMAT',
          })
        }

        // Get forecasting configuration for interval validation
        const forecastingConfig = await ctx.db.projectForecasting.findUnique({
          where: { id: input.forecastingId },
          select: { timeInterval: true, timeUnit: true },
        })

        if (!forecastingConfig) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Forecasting configuration not found',
          })
        }

        // Validate time intervals between consecutive rows
        for (let i = 1; i < parsedData.length; i++) {
          const prev = parsedData[i - 1]!
          const curr = parsedData[i]!

          const diffMs = curr.date.getTime() - prev.date.getTime()

          // Calculate expected difference in milliseconds
          let expectedDiffMs = 0
          switch (forecastingConfig.timeUnit) {
            case 'SECONDS':
              expectedDiffMs = forecastingConfig.timeInterval * 1000
              break
            case 'MINUTES':
              expectedDiffMs = forecastingConfig.timeInterval * 60 * 1000
              break
            case 'HOURS':
              expectedDiffMs = forecastingConfig.timeInterval * 60 * 60 * 1000
              break
            case 'DAYS':
              expectedDiffMs = forecastingConfig.timeInterval * 24 * 60 * 60 * 1000
              break
            case 'MONTHS':
              // For months, use a more flexible validation (28-31 days)
              const monthsDiff =
                (curr.date.getFullYear() - prev.date.getFullYear()) * 12 +
                (curr.date.getMonth() - prev.date.getMonth())
              if (monthsDiff !== forecastingConfig.timeInterval) {
                throw new TRPCError({
                  code: 'BAD_REQUEST',
                  message: 'CSV_INVALID_INTERVAL',
                })
              }
              continue // Skip millisecond comparison for months
            case 'YEARS':
              const yearsDiff = curr.date.getFullYear() - prev.date.getFullYear()
              if (yearsDiff !== forecastingConfig.timeInterval) {
                throw new TRPCError({
                  code: 'BAD_REQUEST',
                  message: 'CSV_INVALID_INTERVAL',
                })
              }
              continue // Skip millisecond comparison for years
          }

          // Check if difference matches expected interval (with small tolerance for rounding)
          if (Math.abs(diffMs - expectedDiffMs) > 1000) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'CSV_INVALID_INTERVAL',
            })
          }
        }

        // Remove date object before storing (keep only timestamp and value strings)
        const finalParsedData = parsedData.map(({ timestamp, value }) => ({
          timestamp,
          value,
        }))

        // CSV is valid, create file record
        const file = await ctx.db.projectForecastingFile.create({
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
            forecastingId: input.forecastingId,
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

        // Get existing series count to determine order
        const existingSeriesCount = await ctx.db.projectForecastingSeries.count({
          where: { forecastingId: input.forecastingId },
        })

        // Create ProjectForecastingSeries record with parsed data
        await ctx.db.projectForecastingSeries.create({
          data: {
            name: 'data', // Default name for all series
            csvFileName: input.fileName,
            values: finalParsedData, // Store as JSON
            order: existingSeriesCount, // Auto-increment order based on existing series
            forecastingId: input.forecastingId,
            createdById: ctx.session.user.id,
          },
        })

        return file
      } catch (error) {
        // Delete the file from S3 since validation failed
        try {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: env.S3_BUCKET_NAME,
            Key: input.s3Key,
          })
          await s3Client.send(deleteCommand)
        } catch (deleteError) {
          console.error('Failed to delete invalid file from S3:', deleteError)
        }

        // Re-throw the error
        if (error instanceof TRPCError) {
          throw error
        }

        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'CSV_INVALID_FORMAT',
        })
      }
    }),

  // Delete file
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.db.projectForecastingFile.findFirst({
        where: {
          id: input.id,
          forecasting: {
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

        // Delete associated series record
        await ctx.db.projectForecastingSeries.deleteMany({
          where: {
            forecastingId: file.forecastingId,
            csvFileName: file.fileName,
          },
        })

        // Delete file record from database
        await ctx.db.projectForecastingFile.delete({
          where: { id: input.id },
        })

        // Check if there are any remaining series
        const remainingSeriesCount = await ctx.db.projectForecastingSeries.count({
          where: { forecastingId: file.forecastingId },
        })

        // If no series left, set status back to PROCESSING
        if (remainingSeriesCount === 0) {
          await ctx.db.projectForecasting.update({
            where: { id: file.forecastingId },
            data: {
              status: 'PROCESSING',
            },
          })
        }

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
