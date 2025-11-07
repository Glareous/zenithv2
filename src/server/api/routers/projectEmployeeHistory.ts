import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const projectEmployeeHistoryRouter = createTRPCRouter({
  // Create a new history entry
  create: protectedProcedure
    .input(
      z.object({
        employeeId: z.string().min(1, 'Employee ID is required'),
        title: z.string().min(1, 'Title is required'),
        description: z.string().min(1, 'Description is required'),
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
          message: "You don't have permission to add history for this employee",
        })
      }

      const history = await ctx.db.projectEmployeeHistory.create({
        data: {
          title: input.title,
          description: input.description,
          employeeId: input.employeeId,
          createdById: ctx.session.user.id,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      })

      return history
    }),

  // Get all history entries for an employee
  getByEmployeeId: protectedProcedure
    .input(
      z.object({
        employeeId: z.string().min(1, 'Employee ID is required'),
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
          message: "You don't have access to this employee's history",
        })
      }

      const histories = await ctx.db.projectEmployeeHistory.findMany({
        where: {
          employeeId: input.employeeId,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      })

      return histories
    }),

  // Update history entry
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, 'History ID is required'),
        title: z.string().min(1, 'Title is required').optional(),
        description: z.string().min(1, 'Description is required').optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      const existingHistory = await ctx.db.projectEmployeeHistory.findUnique({
        where: { id },
        include: {
          employee: {
            select: {
              projectId: true,
            },
          },
        },
      })

      if (!existingHistory) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'History entry not found',
        })
      }

      // Check if user has permission to update in this project
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: existingHistory.employee.projectId,
          userId: ctx.session.user.id,
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have permission to update this history entry",
        })
      }

      const updatedHistory = await ctx.db.projectEmployeeHistory.update({
        where: { id },
        data,
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      })

      return updatedHistory
    }),

  // Delete history entry
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, 'History ID is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const history = await ctx.db.projectEmployeeHistory.findUnique({
        where: { id: input.id },
        include: {
          employee: {
            select: {
              projectId: true,
            },
          },
        },
      })

      if (!history) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'History entry not found',
        })
      }

      // Check if user has permission to delete in this project
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: history.employee.projectId,
          userId: ctx.session.user.id,
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have permission to delete this history entry",
        })
      }

      await ctx.db.projectEmployeeHistory.delete({
        where: { id: input.id },
      })

      return { success: true, message: 'History entry deleted successfully' }
    }),
})
