import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  status: z.enum(['NEW', 'HOT', 'PENDING', 'LOST']).default('NEW'),
  projectId: z.string().min(1, 'ProjectId is required'),
  contactId: z.string().optional(),
})

const updateLeadSchema = createLeadSchema.extend({
  id: z.string().min(1, 'ID is required'),
})

export const projectLeadRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createLeadSchema)
    .mutation(async ({ ctx, input }) => {
      const { projectId, contactId, ...leadData } = input

      const membership = await ctx.db.projectMember.findFirst({
        where: {
          userId: ctx.session.user.id,
          projectId,
        },
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to create leads in this project',
        })
      }

      // Validate contactId if provided
      if (contactId) {
        const contact = await ctx.db.projectContact.findFirst({
          where: {
            id: contactId,
            projectId,
          },
        })

        if (!contact) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Contact not found',
          })
        }
      }

      const lead = await ctx.db.projectLead.create({
        data: {
          ...leadData,
          projectId,
          contactId,
          createdById: ctx.session.user.id,
        },
        include: {
          files: {
            where: {
              fileType: 'IMAGE',
            },
            take: 1,
          },
          contact: {
            select: {
              id: true,
              name: true,
              email: true,
              companyName: true,
            },
          },
        },
      })

      return lead
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, 'ProjectId is required'),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        status: z.enum(['NEW', 'HOT', 'PENDING', 'LOST']).optional(),
        selectedStatuses: z.array(z.string()).optional(),
        includeFromContact: z.boolean().optional(),
        createdAt: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const {
        projectId,
        page,
        limit,
        search,
        status,
        selectedStatuses,
        includeFromContact,
        createdAt,
      } = input
      const skip = (page - 1) * limit

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

      const where: any = { projectId }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phoneNumber: { contains: search, mode: 'insensitive' } },
        ]
      }

      if (status) {
        where.status = status
      }

      if (selectedStatuses && selectedStatuses.length > 0) {
        where.status = { in: selectedStatuses }
      }

      // Filter leads created from contacts if specified
      if (includeFromContact === true) {
        where.contactId = { not: null }
      } else if (includeFromContact === false) {
        where.contactId = null
      }

      if (createdAt) {
        const startOfDay = new Date(createdAt)
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date(createdAt)
        endOfDay.setHours(23, 59, 59, 999)

        where.createdAt = {
          gte: startOfDay,
          lte: endOfDay,
        }
      }

      const [leads, totalCount] = await Promise.all([
        ctx.db.projectLead.findMany({
          where,
          include: {
            files: {
              where: {
                fileType: 'IMAGE',
              },
              take: 1,
            },
            contact: {
              select: {
                id: true,
                name: true,
                email: true,
                companyName: true,
                status: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.db.projectLead.count({ where }),
      ])

      return {
        leads,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: limit,
        },
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const lead = await ctx.db.projectLead.findFirst({
        where: {
          id: input.id,
          project: {
            members: {
              some: {
                userId: ctx.session.user.id,
              },
            },
          },
        },
        include: {
          files: {
            where: {
              fileType: 'IMAGE',
            },
          },
          contact: {
            select: {
              id: true,
              name: true,
              email: true,
              companyName: true,
              role: true,
              status: true,
            },
          },
        },
      })

      if (!lead) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Lead not found',
        })
      }

      return lead
    }),

  update: protectedProcedure
    .input(updateLeadSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, projectId, contactId, ...updateData } = input

      const membership = await ctx.db.projectMember.findFirst({
        where: {
          userId: ctx.session.user.id,
          projectId,
        },
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update leads in this project',
        })
      }

      const lead = await ctx.db.projectLead.findFirst({
        where: {
          id,
          projectId,
        },
      })

      if (!lead) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Lead not found',
        })
      }

      // Validate contactId if provided
      if (contactId) {
        const contact = await ctx.db.projectContact.findFirst({
          where: {
            id: contactId,
            projectId,
          },
        })

        if (!contact) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Contact not found',
          })
        }
      }

      const updatedLead = await ctx.db.projectLead.update({
        where: { id },
        data: {
          ...updateData,
          contactId,
        },
        include: {
          files: {
            where: {
              fileType: 'IMAGE',
            },
          },
          contact: {
            select: {
              id: true,
              name: true,
              email: true,
              companyName: true,
              status: true,
            },
          },
        },
      })

      return updatedLead
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string(), projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, projectId } = input

      const membership = await ctx.db.projectMember.findFirst({
        where: {
          userId: ctx.session.user.id,
          projectId,
        },
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete leads in this project',
        })
      }

      const lead = await ctx.db.projectLead.findFirst({
        where: {
          id,
          projectId,
        },
      })

      if (!lead) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Lead not found',
        })
      }

      await ctx.db.projectLead.delete({
        where: { id },
      })

      return { success: true }
    }),

  convertContactToCustomer: protectedProcedure
    .input(
      z.object({
        contactId: z.string().min(1, 'Contact ID is required'),
        projectId: z.string().min(1, 'Project ID is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { contactId, projectId } = input

      // Check permissions
      const membership = await ctx.db.projectMember.findFirst({
        where: {
          userId: ctx.session.user.id,
          projectId,
        },
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            'You do not have permission to convert contacts in this project',
        })
      }

      // Get contact with all related data
      const contact = await ctx.db.projectContact.findFirst({
        where: {
          id: contactId,
          projectId,
        },
        include: {
          files: {
            where: {
              fileType: 'IMAGE',
            },
          },
          leads: {
            include: {
              files: {
                where: {
                  fileType: 'IMAGE',
                },
              },
            },
          },
        },
      })

      if (!contact) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Contact not found',
        })
      }

      // Validate that contact is not already a customer
      if (contact.status === 'CUSTOMER') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Contact is already a customer',
        })
      }

      const existingCustomer = await ctx.db.projectCustomer.findFirst({
        where: {
          projectId,
          email: contact.email,
        },
      })

      if (existingCustomer) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'A customer with this email already exists',
        })
      }

      // Perform conversion in a transaction
      const result = await ctx.db.$transaction(async (tx) => {
        const customer = await tx.projectCustomer.create({
          data: {
            name: contact.name,
            email: contact.email,
            phoneNumber: contact.phoneNumber,
            subscriber: contact.subscriber,
            gender: contact.gender,
            location: contact.location,
            role: contact.role,
            website: contact.website,
            isActive: true,
            origin: 'FROM_CONTACT',
            projectId,
            createdById: ctx.session.user.id,
          },
        })

        if (contact.files && contact.files.length > 0) {
          for (const contactFile of contact.files) {
            await tx.projectCustomerFile.create({
              data: {
                name: contactFile.name,
                fileName: contactFile.fileName,
                fileType: contactFile.fileType,
                mimeType: contactFile.mimeType,
                fileSize: contactFile.fileSize,
                s3Key: contactFile.s3Key,
                s3Bucket: contactFile.s3Bucket,
                s3Url: contactFile.s3Url,
                description: contactFile.description,
                isPublic: contactFile.isPublic,
                customerId: customer.id,
                uploadedById: ctx.session.user.id,
              },
            })
          }
        }

        if (contact.leads && contact.leads.length > 0) {
          for (const lead of contact.leads) {
            await tx.projectLeadFile.deleteMany({
              where: { leadId: lead.id },
            })

            await tx.projectLead.delete({
              where: { id: lead.id },
            })
          }
        }

        return customer
      })

      return {
        success: true,
        customer: result,
        message: 'Contact successfully converted to customer',
      }
    }),

  getCustomerLeads: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, 'Project ID is required'),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(100),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { projectId, page, limit, search } = input

      // Check permissions
      const membership = await ctx.db.projectMember.findFirst({
        where: {
          userId: ctx.session.user.id,
          projectId,
        },
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view leads in this project',
        })
      }

      // Get leads with status CONVERTED_TO_CUSTOMER
      const leads = await ctx.db.projectLead.findMany({
        where: {
          projectId,
          status: 'CONVERTED_TO_CUSTOMER',
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phoneNumber: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        include: {
          files: {
            where: {
              fileType: 'IMAGE',
            },
            take: 1,
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      })

      const total = await ctx.db.projectLead.count({
        where: {
          projectId,
          status: 'CONVERTED_TO_CUSTOMER',
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phoneNumber: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
      })

      return {
        leads,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    }),

  migrateExistingCustomers: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, 'Project ID is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { projectId } = input

      // Check permissions
      const membership = await ctx.db.projectMember.findFirst({
        where: {
          userId: ctx.session.user.id,
          projectId,
        },
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to migrate data in this project',
        })
      }

      // Find all contacts with status CUSTOMER
      const contactsToMigrate = await ctx.db.projectContact.findMany({
        where: {
          projectId,
          status: 'CUSTOMER',
        },
        include: {
          files: {
            where: {
              fileType: 'IMAGE',
            },
          },
          leads: {
            include: {
              files: {
                where: {
                  fileType: 'IMAGE',
                },
              },
            },
          },
        },
      })

      if (contactsToMigrate.length === 0) {
        return {
          success: true,
          migratedCount: 0,
          message: 'No contacts with CUSTOMER status found to migrate',
        }
      }

      let migratedCount = 0
      const errors: string[] = []

      // Migrate each contact
      for (const contact of contactsToMigrate) {
        try {
          await ctx.db.$transaction(async (tx) => {
            // Create new customer with contact data
            const customer = await tx.projectCustomer.create({
              data: {
                name: contact.name,
                email: contact.email,
                phoneNumber: contact.phoneNumber,
                subscriber: contact.subscriber,
                gender: contact.gender,
                location: contact.location,
                role: contact.role,
                website: contact.website,
                isActive: true,
                origin: 'FROM_CONTACT',
                projectId,
                createdById: ctx.session.user.id,
              },
            })

            // Copy contact image files to customer files
            if (contact.files && contact.files.length > 0) {
              for (const contactFile of contact.files) {
                await tx.projectCustomerFile.create({
                  data: {
                    name: contactFile.name,
                    fileName: contactFile.fileName,
                    fileType: contactFile.fileType,
                    mimeType: contactFile.mimeType,
                    fileSize: contactFile.fileSize,
                    s3Key: contactFile.s3Key,
                    s3Bucket: contactFile.s3Bucket,
                    s3Url: contactFile.s3Url,
                    description: contactFile.description,
                    isPublic: contactFile.isPublic,
                    customerId: customer.id,
                    uploadedById: ctx.session.user.id,
                  },
                })
              }
            }

            // Update related leads to point to the new customer
            if (contact.leads && contact.leads.length > 0) {
              for (const lead of contact.leads) {
                await tx.projectLead.update({
                  where: { id: lead.id },
                  data: {
                    contactId: null,
                  },
                })
              }
            }

            // Delete contact files first
            await tx.projectContactFile.deleteMany({
              where: { contactId: contact.id },
            })

            // Delete the contact
            await tx.projectContact.delete({
              where: { id: contact.id },
            })
          })

          migratedCount++
        } catch (error) {
          errors.push(`Failed to migrate contact ${contact.name}: ${error}`)
        }
      }

      return {
        success: true,
        migratedCount,
        totalContacts: contactsToMigrate.length,
        errors: errors.length > 0 ? errors : undefined,
        message: `Successfully migrated ${migratedCount} out of ${contactsToMigrate.length} contacts to customers`,
      }
    }),
})
