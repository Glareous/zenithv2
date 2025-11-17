import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@src/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { randomBytes, createHash } from "crypto";

export const apiKeysRouter = createTRPCRouter({
  // List user's API keys (or only global API keys if SUPERADMIN)
  list: protectedProcedure.query(async ({ ctx }) => {
    const isSuperAdmin = ctx.session.user.role === 'SUPERADMIN'

    // First, get all API keys without the user relation
    const apiKeys = await ctx.db.userApiKey.findMany({
      where: isSuperAdmin
        ? {
            isGlobal: true, // SUPERADMIN only sees global API keys
          }
        : {
            userId: ctx.session.user.id,
          },
      select: {
        id: true,
        name: true,
        keyPreview: true,
        isActive: true,
        isGlobal: true,
        admin: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get all valid users
    const userIds = [...new Set(apiKeys.map(key => key.userId))];
    const users = await ctx.db.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    // Create a map for quick lookup
    const userMap = new Map(users.map(user => [user.id, user]));

    // Filter out orphaned API keys and attach user data
    const validApiKeys = apiKeys
      .filter(key => userMap.has(key.userId))
      .map(key => ({
        id: key.id,
        name: key.name,
        keyPreview: key.keyPreview,
        isActive: key.isActive,
        isGlobal: key.isGlobal,
        admin: key.admin,
        lastUsedAt: key.lastUsedAt,
        expiresAt: key.expiresAt,
        createdAt: key.createdAt,
        updatedAt: key.updatedAt,
        user: userMap.get(key.userId)!,
      }));

    return validApiKeys;
  }),

  // Create new API key
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(100, "Name too long"),
        expiresAt: z.date().optional(),
        isGlobal: z.boolean().optional(), // Only SUPERADMIN can set this to true
        admin: z.boolean().optional(), // Only SUPERADMIN can set this to true
      })
    )
    .mutation(async ({ ctx, input }) => {
      const isSuperAdmin = ctx.session.user.role === 'SUPERADMIN'

      // Only SUPERADMIN can create global API keys
      if (input.isGlobal && !isSuperAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only SUPERADMIN can create global API keys",
        });
      }

      // Only SUPERADMIN can create admin API keys
      if (input.admin && !isSuperAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only SUPERADMIN can create admin API keys",
        });
      }

      // Generate cryptographically secure API key
      const rawKey = "ak_" + randomBytes(32).toString("hex");

      // Hash the key for storage
      const keyHash = createHash("sha256").update(rawKey).digest("hex");

      // Create preview (first 8 characters + "...")
      const keyPreview = rawKey.substring(0, 8) + "...";

      try {
        // Auto-assign isGlobal and admin for SUPERADMIN users
        const isGlobal = isSuperAdmin ? true : (input.isGlobal || false);
        const isAdmin = isSuperAdmin ? true : (input.admin || false);

        const apiKey = await ctx.db.userApiKey.create({
          data: {
            name: input.name,
            keyHash,
            keyPreview,
            expiresAt: input.expiresAt,
            isGlobal,
            admin: isAdmin,
            userId: ctx.session.user.id,
          },
          select: {
            id: true,
            name: true,
            keyPreview: true,
            isActive: true,
            isGlobal: true,
            admin: true,
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
          isGlobal: true,
          admin: true,
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