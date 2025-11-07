import { createTRPCRouter, protectedProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

const createContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  companyName: z.string().optional(),
  role: z.string().optional(),
  email: z.string().email('Invalid email format'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  website: z.string().optional(),
  status: z.enum(['CONTACT', 'CUSTOMER', 'LEAD']).default('CONTACT'),
  subscriber: z.boolean().default(false),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  location: z.string().optional(),
  projectId: z.string().min(1, 'ProjectId is required'),
})

const updateContactSchema = createContactSchema.extend({
  id: z.string().min(1, 'ID is required'),
})

export const projectContactRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createContactSchema)
    .mutation(async ({ ctx, input }) => {
      const { projectId, ...contactData } = input

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
            'You do not have permission to create contacts in this project',
        })
      }

      // Create contact and lead in a transaction
      const result = await ctx.db.$transaction(async (tx) => {
        // Create the contact
        const contact = await tx.projectContact.create({
          data: {
            ...contactData,
            projectId,
            createdById: ctx.session.user.id,
          },
          include: {
            files: {
              where: {
                fileType: 'IMAGE',
              },
              take: 1,
            },
          },
        })

        // Automatically create a lead from the contact
        const lead = await tx.projectLead.create({
          data: {
            name: contactData.name,
            email: contactData.email,
            phoneNumber: contactData.phoneNumber,
            status: 'NEW', // Default status for leads created from contacts
            projectId,
            createdById: ctx.session.user.id,
            contactId: contact.id, // Link to the contact that created this lead
          },
        })

        // Copy contact image to lead if it exists
        if (contact.files && contact.files.length > 0) {
          const contactImage = contact.files[0]
          await tx.projectLeadFile.create({
            data: {
              name: contactImage.name,
              fileName: contactImage.fileName,
              fileType: 'IMAGE',
              s3Url: contactImage.s3Url,
              s3Key: contactImage.s3Key,
              s3Bucket: contactImage.s3Bucket,
              fileSize: contactImage.fileSize,
              mimeType: contactImage.mimeType,
              leadId: lead.id,
              uploadedById: ctx.session.user.id,
            },
          })
        }

        return { contact, lead }
      })

      return result.contact
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, 'ProjectId is required'),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        status: z
          .enum(['CUSTOMER', 'PERSONAL', 'EMPLOYEE', 'MARKETING'])
          .optional(),
        selectedStatuses: z.array(z.string()).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { projectId, page, limit, search, status, selectedStatuses } = input
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
          { companyName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phoneNumber: { contains: search, mode: 'insensitive' } },
          { role: { contains: search, mode: 'insensitive' } },
        ]
      }

      if (status) {
        where.status = status
      }

      if (selectedStatuses && selectedStatuses.length > 0) {
        where.status = { in: selectedStatuses }
      }

      const [contacts, totalCount] = await Promise.all([
        ctx.db.projectContact.findMany({
          where,
          include: {
            files: {
              where: {
                fileType: 'IMAGE',
              },
              take: 1,
            },
            leads: {
              select: {
                id: true,
                status: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.db.projectContact.count({ where }),
      ])

      return {
        contacts,
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
      const contact = await ctx.db.projectContact.findFirst({
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
          leads: {
            select: {
              id: true,
              status: true,
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

      return contact
    }),

  update: protectedProcedure
    .input(updateContactSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input
      const projectId = updateData.projectId

      // Check if user has access to this project
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId,
          userId: ctx.session.user.id,
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this project",
        })
      }

      // Update contact and related lead in a transaction
      const result = await ctx.db.$transaction(async (tx) => {
        // Update the contact
        const updatedContact = await tx.projectContact.update({
          where: { id },
          data: updateData,
          include: {
            files: {
              where: {
                fileType: 'IMAGE',
              },
              take: 1,
            },
          },
        })

        // Find and update the related lead
        const relatedLead = await tx.projectLead.findFirst({
          where: {
            contactId: id,
            projectId,
          },
          include: {
            files: {
              where: {
                fileType: 'IMAGE',
              },
              take: 1,
            },
          },
        })

        if (relatedLead) {
          // Update lead data
          await tx.projectLead.update({
            where: { id: relatedLead.id },
            data: {
              name: updateData.name,
              email: updateData.email,
              phoneNumber: updateData.phoneNumber,
            },
          })

          // Update lead image if contact image changed
          if (updatedContact.files && updatedContact.files.length > 0) {
            const contactImage = updatedContact.files[0]

            // Delete existing lead image if exists
            if (relatedLead.files && relatedLead.files.length > 0) {
              await tx.projectLeadFile.delete({
                where: { id: relatedLead.files[0].id },
              })
            }

            // Create new lead image
            await tx.projectLeadFile.create({
              data: {
                name: contactImage.name,
                fileName: contactImage.fileName,
                fileType: 'IMAGE',
                s3Url: contactImage.s3Url,
                s3Key: contactImage.s3Key,
                s3Bucket: contactImage.s3Bucket,
                fileSize: contactImage.fileSize,
                mimeType: contactImage.mimeType,
                leadId: relatedLead.id,
                uploadedById: ctx.session.user.id,
              },
            })
          }
        }

        return updatedContact
      })

      return result
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string(), projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, projectId } = input

      // Check if user has access to this project
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId,
          userId: ctx.session.user.id,
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this project",
        })
      }

      // Delete contact and related lead in a transaction
      await ctx.db.$transaction(async (tx) => {
        // Find and delete the related lead first
        const relatedLead = await tx.projectLead.findFirst({
          where: {
            contactId: id,
            projectId,
          },
        })

        if (relatedLead) {
          // Delete lead files first
          await tx.projectLeadFile.deleteMany({
            where: { leadId: relatedLead.id },
          })

          // Delete the lead
          await tx.projectLead.delete({
            where: { id: relatedLead.id },
          })
        }

        // Delete contact files first
        await tx.projectContactFile.deleteMany({
          where: { contactId: id },
        })

        // Delete the contact
        await tx.projectContact.delete({
          where: { id },
        })
      })

      return { success: true }
    }),

  syncImageToLead: protectedProcedure
    .input(
      z.object({
        contactId: z.string(),
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { contactId, projectId } = input

      // Check permissions
      const projectMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId,
          userId: ctx.session.user.id,
        },
      })

      if (!projectMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this project",
        })
      }

      // Get contact with image
      const contact = await ctx.db.projectContact.findFirst({
        where: { id: contactId, projectId },
        include: {
          files: {
            where: { fileType: 'IMAGE' },
            take: 1,
          },
        },
      })

      if (!contact) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Contact not found',
        })
      }

      // Get related lead
      const lead = await ctx.db.projectLead.findFirst({
        where: { contactId, projectId },
        include: {
          files: {
            where: { fileType: 'IMAGE' },
            take: 1,
          },
        },
      })

      if (!lead) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Related lead not found',
        })
      }

      // Sync image if contact has one
      if (contact.files && contact.files.length > 0) {
        const contactImage = contact.files[0]

        // Delete existing lead image if exists
        if (lead.files && lead.files.length > 0) {
          await ctx.db.projectLeadFile.delete({
            where: { id: lead.files[0].id },
          })
        }

        // Create new lead image
        await ctx.db.projectLeadFile.create({
          data: {
            name: contactImage.name,
            fileName: contactImage.fileName,
            fileType: 'IMAGE',
            s3Url: contactImage.s3Url,
            s3Key: contactImage.s3Key,
            s3Bucket: contactImage.s3Bucket,
            fileSize: contactImage.fileSize,
            mimeType: contactImage.mimeType,
            leadId: lead.id,
            uploadedById: ctx.session.user.id,
          },
        })
      }

      return { success: true }
    }),
})
