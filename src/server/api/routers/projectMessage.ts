import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

const createMessageSchema = z.object({
  chatId: z.string().min(1, 'Chat ID is required'),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['AGENT', 'USER']),
  mediaType: z.enum(['TEXT', 'IMAGE', 'AUDIO', 'DOCUMENT', 'VIDEO']).default('TEXT'),
  metadata: z.any().optional(),
  mediaUrl: z.string().optional(),
  whatsappMessageId: z.string().optional(),
})

const updateMessageSchema = z.object({
  id: z.string().min(1, 'Message ID is required'),
  content: z.string().optional(),
  metadata: z.any().optional(),
  mediaUrl: z.string().optional(),
})

export const projectMessageRouter = createTRPCRouter({
  // Create new message
  create: protectedProcedure
    .input(createMessageSchema)
    .mutation(async ({ ctx, input }) => {
      const { chatId, content, type, mediaType, metadata, mediaUrl, whatsappMessageId } = input

      // Verify chat exists and user has access
      const chat = await ctx.db.chat.findFirst({
        where: {
          id: chatId,
          agent: {
            OR: [
              {
                project: {
                  members: {
                    some: {
                      userId: ctx.session.user.id,
                    },
                  },
                },
              },
              { isGlobal: true },
            ],
          },
        },
      })

      if (!chat) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Chat not found or you do not have access to it',
        })
      }

      const message = await ctx.db.message.create({
        data: {
          chatId,
          content,
          type,
          mediaType,
          metadata: metadata || {},
          mediaUrl,
          whatsappMessageId,
        },
      })

      // Update chat's updatedAt timestamp
      await ctx.db.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() },
      })

      return message
    }),

  // Get messages by chat ID
  getByChatId: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        limit: z.number().min(1).max(500).optional(),
        cursor: z.string().optional(), // For pagination
        orderBy: z.enum(['asc', 'desc']).default('asc'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { chatId, limit = 100, cursor, orderBy } = input

      // Verify chat exists and user has access
      const chat = await ctx.db.chat.findFirst({
        where: {
          id: chatId,
          agent: {
            OR: [
              {
                project: {
                  members: {
                    some: {
                      userId: ctx.session.user.id,
                    },
                  },
                },
              },
              { isGlobal: true },
            ],
          },
        },
      })

      if (!chat) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Chat not found or you do not have access to it',
        })
      }

      const messages = await ctx.db.message.findMany({
        where: {
          chatId,
          ...(cursor && {
            id: {
              lt: cursor, // Get messages before cursor
            },
          }),
        },
        take: limit + 1, // Take one extra to check if there are more
        orderBy: {
          timestamp: orderBy,
        },
      })

      let nextCursor: string | undefined = undefined
      if (messages.length > limit) {
        const nextItem = messages.pop()
        nextCursor = nextItem?.id
      }

      return {
        messages,
        nextCursor,
      }
    }),

  // Get latest messages from a chat
  getLatest: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const { chatId, limit } = input

      // Verify chat exists and user has access
      const chat = await ctx.db.chat.findFirst({
        where: {
          id: chatId,
          agent: {
            OR: [
              {
                project: {
                  members: {
                    some: {
                      userId: ctx.session.user.id,
                    },
                  },
                },
              },
              { isGlobal: true },
            ],
          },
        },
      })

      if (!chat) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Chat not found or you do not have access to it',
        })
      }

      const messages = await ctx.db.message.findMany({
        where: {
          chatId,
        },
        take: limit,
        orderBy: {
          timestamp: 'desc',
        },
      })

      // Return in ascending order (oldest first)
      return messages.reverse()
    }),

  // Update message
  update: protectedProcedure
    .input(updateMessageSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Verify message exists and user has access
      const message = await ctx.db.message.findFirst({
        where: {
          id,
          chat: {
            agent: {
              OR: [
                {
                  project: {
                    members: {
                      some: {
                        userId: ctx.session.user.id,
                      },
                    },
                  },
                },
                { isGlobal: true },
              ],
            },
          },
        },
      })

      if (!message) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Message not found or you do not have access to it',
        })
      }

      const updatedMessage = await ctx.db.message.update({
        where: { id },
        data: updateData,
      })

      return updatedMessage
    }),

  // Delete message
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify message exists and user has access
      const message = await ctx.db.message.findFirst({
        where: {
          id: input.id,
          chat: {
            agent: {
              OR: [
                {
                  project: {
                    members: {
                      some: {
                        userId: ctx.session.user.id,
                      },
                    },
                  },
                },
                { isGlobal: true },
              ],
            },
          },
        },
      })

      if (!message) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Message not found or you do not have access to it',
        })
      }

      await ctx.db.message.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // Get message statistics for a chat
  getStats: protectedProcedure
    .input(z.object({ chatId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify chat exists and user has access
      const chat = await ctx.db.chat.findFirst({
        where: {
          id: input.chatId,
          agent: {
            OR: [
              {
                project: {
                  members: {
                    some: {
                      userId: ctx.session.user.id,
                    },
                  },
                },
              },
              { isGlobal: true },
            ],
          },
        },
      })

      if (!chat) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Chat not found or you do not have access to it',
        })
      }

      const [totalMessages, userMessages, agentMessages] = await Promise.all([
        ctx.db.message.count({
          where: { chatId: input.chatId },
        }),
        ctx.db.message.count({
          where: { chatId: input.chatId, type: 'USER' },
        }),
        ctx.db.message.count({
          where: { chatId: input.chatId, type: 'AGENT' },
        }),
      ])

      return {
        totalMessages,
        userMessages,
        agentMessages,
      }
    }),
})
