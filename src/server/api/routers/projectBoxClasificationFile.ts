import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const projectBoxClasificationFileRouter = createTRPCRouter({
  // Get all files for a box clasification
  getByBoxClasification: protectedProcedure
    .input(z.object({ boxClasificationId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check access
      const boxClasification = await ctx.db.projectBoxClasification.findFirst({
        where: {
          id: input.boxClasificationId,
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
      })

      if (!boxClasification) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this box clasification",
        })
      }

      return await ctx.db.projectBoxClasificationFile.findMany({
        where: { boxClasificationId: input.boxClasificationId },
        orderBy: { createdAt: 'desc' },
      })
    }),

  // Create a new file
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        mimeType: z.string(),
        fileSize: z.number(),
        s3Key: z.string(),
        s3Bucket: z.string(),
        s3Url: z.string(),
        description: z.string().optional(),
        isProcessed: z.boolean().default(false),
        boxClasificationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check access
      const boxClasification = await ctx.db.projectBoxClasification.findFirst({
        where: {
          id: input.boxClasificationId,
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
          message: "You don't have permission to upload files to this box clasification",
        })
      }

      return await ctx.db.projectBoxClasificationFile.create({
        data: {
          ...input,
          uploadedById: ctx.session.user.id,
        },
      })
    }),

  // Delete a file
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check access
      const file = await ctx.db.projectBoxClasificationFile.findFirst({
        where: {
          id: input.id,
          boxClasification: {
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
        },
      })

      if (!file) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "File not found or you don't have permission to delete it",
        })
      }

      return await ctx.db.projectBoxClasificationFile.delete({
        where: { id: input.id },
      })
    }),
})
