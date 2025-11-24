import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const projectEmployeeRouter = createTRPCRouter({
  // Create a new employee
  create: protectedProcedure
    .input(
      z.object({
        employeeId: z.string().min(1, 'Employee ID is required'),
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        middleName: z.string().optional(),
        image: z.string().optional(),
        gender: z.string().optional(),
        birthDate: z.date().optional(),
        age: z.string().optional(),
        religion: z.string().optional(),
        nationality: z.string().optional(),
        email: z.string().email().optional().or(z.literal('')),
        phone: z.string().optional(),
        alternativePhone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        pinCode: z.string().optional(),
        location: z.string().optional(),
        rollNo: z.string().optional(),
        class: z.string().optional(),
        admissionDate: z.date().optional(),
        fatherName: z.string().optional(),
        motherName: z.string().optional(),
        fatherOccupation: z.string().optional(),
        parentsPhone: z.string().optional(),
        isActive: z.boolean().default(true),
        projectId: z.string().min(1, 'Project ID is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to create employees in this project
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: input.projectId,
          userId: ctx.session.user.id,
          role: { in: ['ADMIN'] },
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            "You don't have permission to create employees in this project",
        })
      }

      // Check if employeeId already exists in this project
      const existingEmployee = await ctx.db.projectEmployee.findFirst({
        where: {
          projectId: input.projectId,
          employeeId: input.employeeId,
        },
      })

      if (existingEmployee) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Employee ID already exists in this project',
        })
      }

      const employee = await ctx.db.projectEmployee.create({
        data: {
          employeeId: input.employeeId,
          firstName: input.firstName,
          lastName: input.lastName,
          middleName: input.middleName,
          image: input.image,
          gender: input.gender,
          birthDate: input.birthDate,
          age: input.age,
          religion: input.religion,
          nationality: input.nationality,
          email: input.email,
          phone: input.phone,
          alternativePhone: input.alternativePhone,
          address: input.address,
          city: input.city,
          country: input.country,
          pinCode: input.pinCode,
          location: input.location,
          rollNo: input.rollNo,
          class: input.class,
          admissionDate: input.admissionDate,
          fatherName: input.fatherName,
          motherName: input.motherName,
          fatherOccupation: input.fatherOccupation,
          parentsPhone: input.parentsPhone,
          isActive: input.isActive,
          projectId: input.projectId,
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

      return employee
    }),

  // Get all employees for a project with pagination and filters
  getAll: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, 'Project ID is required'),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(), // Search by name, email, phone
        class: z.string().optional(), // Filter by class/department
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { projectId, page, limit, search, class: classFilter, isActive } = input
      const skip = (page - 1) * limit

      // Check if user has access to this project
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: input.projectId,
          userId: ctx.session.user.id,
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this project",
        })
      }

      // Build filters
      const where: any = {
        projectId,
      }

      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { employeeId: { contains: search, mode: 'insensitive' } },
        ]
      }

      if (classFilter) {
        where.class = classFilter
      }

      if (isActive !== undefined) {
        where.isActive = isActive
      }

      // Get employees with pagination
      const [employees, total] = await Promise.all([
        ctx.db.projectEmployee.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            _count: {
              select: {
                files: true,
                histories: true,
              },
            },
          },
        }),
        ctx.db.projectEmployee.count({ where }),
      ])

      return {
        employees,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      }
    }),

  // Get employee by ID
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, 'Employee ID is required'),
      })
    )
    .query(async ({ ctx, input }) => {
      const employee = await ctx.db.projectEmployee.findUnique({
        where: { id: input.id },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          files: {
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
          },
          histories: {
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
          },
        },
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
          message: "You don't have access to this employee",
        })
      }

      return employee
    }),

  // Update employee
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, 'Employee ID is required'),
        employeeId: z.string().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        middleName: z.string().optional(),
        image: z.string().optional(),
        gender: z.string().optional(),
        birthDate: z.date().optional(),
        age: z.string().optional(),
        religion: z.string().optional(),
        nationality: z.string().optional(),
        email: z.string().email().optional().or(z.literal('')),
        phone: z.string().optional(),
        alternativePhone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        pinCode: z.string().optional(),
        location: z.string().optional(),
        rollNo: z.string().optional(),
        class: z.string().optional(),
        admissionDate: z.date().optional(),
        fatherName: z.string().optional(),
        motherName: z.string().optional(),
        fatherOccupation: z.string().optional(),
        parentsPhone: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      // Get employee to check project access
      const existingEmployee = await ctx.db.projectEmployee.findUnique({
        where: { id },
      })

      if (!existingEmployee) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Employee not found',
        })
      }

      // Check if user has permission to update employees in this project
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: existingEmployee.projectId,
          userId: ctx.session.user.id,
          role: { in: ['ADMIN'] },
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            "You don't have permission to update employees in this project",
        })
      }

      // If changing employeeId, check for duplicates
      if (data.employeeId && data.employeeId !== existingEmployee.employeeId) {
        const duplicate = await ctx.db.projectEmployee.findFirst({
          where: {
            projectId: existingEmployee.projectId,
            employeeId: data.employeeId,
            id: { not: id },
          },
        })

        if (duplicate) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Employee ID already exists in this project',
          })
        }
      }

      const updatedEmployee = await ctx.db.projectEmployee.update({
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

      return updatedEmployee
    }),

  // Delete employee
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, 'Employee ID is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get employee to check project access
      const employee = await ctx.db.projectEmployee.findUnique({
        where: { id: input.id },
      })

      if (!employee) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Employee not found',
        })
      }

      // Check if user has permission to delete employees in this project
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
            "You don't have permission to delete employees in this project",
        })
      }

      // Delete employee (cascade will delete related files and histories)
      await ctx.db.projectEmployee.delete({
        where: { id: input.id },
      })

      return { success: true, message: 'Employee deleted successfully' }
    }),

  // Get unique classes/departments for filtering
  getClasses: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, 'Project ID is required'),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user has access to this project
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: input.projectId,
          userId: ctx.session.user.id,
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this project",
        })
      }

      // Get unique classes
      const employees = await ctx.db.projectEmployee.findMany({
        where: {
          projectId: input.projectId,
          class: { not: null },
        },
        select: {
          class: true,
        },
        distinct: ['class'],
      })

      const classes = employees
        .map((e) => e.class)
        .filter((c): c is string => c !== null)
        .sort()

      return classes
    }),
})
