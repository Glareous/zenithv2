import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@src/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { randomBytes, createHash } from "crypto";

export const apiKeysRouter = createTRPCRouter({
  // List user's API keysaaaa
  list: protectedProcedure.query(async ({ ctx }) => {
    const apiKeys = await ctx.db.userApiKey.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      select: {
        id: true,
        name: true,
        keyPreview: true,
        isActive: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return apiKeys;
  }),

  // Create new API key
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(100, "Name too long"),
        expiresAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate cryptographically secure API key
      const rawKey = "ak_" + randomBytes(32).toString("hex");
      
      // Hash the key for storage
      const keyHash = createHash("sha256").update(rawKey).digest("hex");
      
      // Create preview (first 8 characters + "...")
      const keyPreview = rawKey.substring(0, 8) + "...";

      try {
        const apiKey = await ctx.db.userApiKey.create({
          data: {
            name: input.name,
            keyHash,
            keyPreview,
            expiresAt: input.expiresAt,
            userId: ctx.session.user.id,
          },
          select: {
            id: true,
            name: true,
            keyPreview: true,
            isActive: true,
            lastUsedAt: true,
            expiresAt: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        // Return the full key only once during creation
        return {
          ...apiKey,
          rawKey, // This will only be returned once
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create API key",
        });
      }
    }),

  // Delete API key
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify the API key belongs to the user
      const apiKey = await ctx.db.userApiKey.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!apiKey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "API key not found",
        });
      }

      await ctx.db.userApiKey.delete({
        where: {
          id: input.id,
        },
      });

      return { success: true };
    }),

  // Toggle API key active status
  toggle: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the API key belongs to the user
      const apiKey = await ctx.db.userApiKey.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!apiKey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "API key not found",
        });
      }

      const updatedApiKey = await ctx.db.userApiKey.update({
        where: {
          id: input.id,
        },
        data: {
          isActive: input.isActive,
        },
        select: {
          id: true,
          name: true,
          keyPreview: true,
          isActive: true,
          lastUsedAt: true,
          expiresAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return updatedApiKey;
    }),

  // Update last used timestamp (internal procedure)
  updateLastUsed: protectedProcedure
    .input(z.object({ keyHash: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.userApiKey.update({
        where: {
          keyHash: input.keyHash,
        },
        data: {
          lastUsedAt: new Date(),
        },
      });

      return { success: true };
    }),
});