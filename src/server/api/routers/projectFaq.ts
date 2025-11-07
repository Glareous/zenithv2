import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '../trpc'

const faqCreateSchema = z.object({
  question: z.string().min(1, 'Question is required').max(500),
  answer: z.string().min(1, 'Answer is required').max(2000),
  projectId: z.string(), // <-- Añade esto
})

const faqUpdateSchema = z.object({
  id: z.string(),
  question: z.string().min(1, 'Question is required').max(500),
  answer: z.string().min(1, 'Answer is required').max(2000),
  projectId: z.string(), // <-- Añade esto
})

export const projectFaqRouter = createTRPCRouter({
  // Crear nueva FAQ
  create: protectedProcedure
    .input(faqCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const faq = await ctx.db.projectFaq.create({
        data: {
          question: input.question,
          answer: input.answer,
          projectId: input.projectId,
        },
      })
      return faq
    }),

  // Obtener todas las FAQs de un proyecto
  getAll: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const faqs = await ctx.db.projectFaq.findMany({
        where: { projectId: input.projectId },
        orderBy: { createdAt: 'desc' },
      })
      return faqs
    }),

  // Obtener FAQ por ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const faq = await ctx.db.projectFaq.findUnique({
        where: { id: input.id },
      })
      return faq
    }),

  // Actualizar FAQ
  update: protectedProcedure
    .input(faqUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      // Verificar que el usuario tiene acceso al proyecto de la FAQ
      const faq = await ctx.db.projectFaq.findUnique({
        where: { id: input.id },
        include: {
          project: {
            include: {
              members: true,
              organization: {
                include: {
                  members: true,
                },
              },
            },
          },
        },
      })

      if (
        !faq ||
        !faq.project ||
        !(
          faq.project.members.some(
            (m: any) => m.userId === ctx.session.user.id
          ) ||
          faq.project.organization.members.some(
            (m: any) =>
              m.userId === ctx.session.user.id &&
              ['OWNER', 'ADMIN'].includes(m.role)
          )
        )
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this FAQ",
        })
      }

      const updatedFaq = await ctx.db.projectFaq.update({
        where: { id: input.id },
        data: {
          question: input.question,
          answer: input.answer,
        },
      })
      return updatedFaq
    }),

  // Eliminar FAQ
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verificar que el usuario tiene acceso al proyecto de la FAQ
      const faq = await ctx.db.projectFaq.findUnique({
        where: { id: input.id },
        include: {
          project: {
            include: {
              members: true,
              organization: {
                include: {
                  members: true,
                },
              },
            },
          },
        },
      })

      if (
        !faq ||
        !faq.project ||
        !(
          faq.project.members.some(
            (m: any) => m.userId === ctx.session.user.id
          ) ||
          faq.project.organization.members.some(
            (m: any) =>
              m.userId === ctx.session.user.id &&
              ['OWNER', 'ADMIN'].includes(m.role)
          )
        )
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this FAQ",
        })
      }

      await ctx.db.projectFaq.delete({
        where: { id: input.id },
      })
      return { success: true }
    }),
})
