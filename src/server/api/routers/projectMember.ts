import { ProjectRole } from '@prisma/client'
import { env } from '@src/env'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@src/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { Resend } from 'resend'
import { z } from 'zod'

const resend = new Resend(env.RESEND_API_KEY)

export const projectMemberRouter = createTRPCRouter({
  // Get all members of a project
  getAll: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user has access to this project
      const userProjectAccess = await ctx.db.projectMember.findFirst({
        where: {
          projectId: input.projectId,
          userId: ctx.session.user.id,
        },
      })

      if (!userProjectAccess) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this project",
        })
      }

      return ctx.db.projectMember.findMany({
        where: { projectId: input.projectId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              image: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { joinedAt: 'asc' },
      })
    }),

  // Add member to project
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        userId: z.string(),
        role: z.nativeEnum(ProjectRole).default(ProjectRole.MEMBER),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if current user is admin of the project
      const userProjectRole = await ctx.db.projectMember.findFirst({
        where: {
          projectId: input.projectId,
          userId: ctx.session.user.id,
          role: ProjectRole.ADMIN,
        },
      })

      if (!userProjectRole) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only project admins can add members',
        })
      }

      // Check if user is already a member
      const existingMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: input.projectId,
          userId: input.userId,
        },
      })

      if (existingMember) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User is already a member of this project',
        })
      }

      // Verify the user exists
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      return ctx.db.projectMember.create({
        data: {
          projectId: input.projectId,
          userId: input.userId,
          role: input.role,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              image: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
    }),

  // Update member role
  updateRole: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        role: z.nativeEnum(ProjectRole),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get the member to check project access
      const member = await ctx.db.projectMember.findUnique({
        where: { id: input.id },
        include: { project: true },
      })

      if (!member) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project member not found',
        })
      }

      // Check if current user is admin of the project
      const userProjectRole = await ctx.db.projectMember.findFirst({
        where: {
          projectId: member.projectId,
          userId: ctx.session.user.id,
          role: ProjectRole.ADMIN,
        },
      })

      if (!userProjectRole) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only project admins can update member roles',
        })
      }

      return ctx.db.projectMember.update({
        where: { id: input.id },
        data: { role: input.role },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              image: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
    }),

  // Remove member from project
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get the member to check project access
      const member = await ctx.db.projectMember.findUnique({
        where: { id: input.id },
        include: { project: true },
      })

      if (!member) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project member not found',
        })
      }

      // Check if current user is admin of the project or removing themselves
      const userProjectRole = await ctx.db.projectMember.findFirst({
        where: {
          projectId: member.projectId,
          userId: ctx.session.user.id,
        },
      })

      if (!userProjectRole) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this project",
        })
      }

      // Can remove if: user is admin OR user is removing themselves
      const canRemove =
        userProjectRole.role === ProjectRole.ADMIN ||
        member.userId === ctx.session.user.id

      if (!canRemove) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            'Only project admins can remove members, or users can remove themselves',
        })
      }

      return ctx.db.projectMember.delete({
        where: { id: input.id },
      })
    }),

  // Get user's project memberships
  getByUser: protectedProcedure
    .input(z.object({ userId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const targetUserId = input.userId ?? ctx.session.user.id

      // If checking another user, verify access through shared projects
      if (targetUserId !== ctx.session.user.id) {
        const sharedProjects = await ctx.db.projectMember.findMany({
          where: {
            userId: ctx.session.user.id,
          },
          select: { projectId: true },
        })

        const targetUserAccess = await ctx.db.projectMember.findFirst({
          where: {
            userId: targetUserId,
            projectId: { in: sharedProjects.map((p) => p.projectId) },
          },
        })

        if (!targetUserAccess) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: "You don't have access to view this user's projects",
          })
        }
      }

      return ctx.db.projectMember.findMany({
        where: { userId: targetUserId },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              description: true,
              status: true,
              organization: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { joinedAt: 'desc' },
      })
    }),

  // Send email invitation to join project
  inviteByEmail: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        email: z.string().email(),
        role: z.nativeEnum(ProjectRole).default(ProjectRole.MEMBER),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if current user is admin of the project
      const userProjectRole = await ctx.db.projectMember.findFirst({
        where: {
          projectId: input.projectId,
          userId: ctx.session.user.id,
          role: ProjectRole.ADMIN,
        },
      })

      if (!userProjectRole) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only project admins can invite members',
        })
      }

      // Get project details for the email
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
        include: {
          organization: {
            select: {
              name: true,
              custom: true,
            },
          },
        },
      })

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        })
      }

      // Check if user is already a member
      const existingMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: input.projectId,
          user: { email: input.email },
        },
      })

      if (existingMember) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User is already a member of this project',
        })
      }

      // Delete any existing pending invitations for this email and project
      await ctx.db.projectInvitation.deleteMany({
        where: {
          projectId: input.projectId,
          email: input.email,
          used: false,
          expires: { gt: new Date() },
        },
      })

      // Generate invitation token
      const invitationToken = crypto.randomUUID()
      const invitationExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      // Create invitation record
      const invitation = await ctx.db.projectInvitation.create({
        data: {
          email: input.email,
          role: input.role,
          token: invitationToken,
          expires: invitationExpiry,
          projectId: input.projectId,
          invitedById: ctx.session.user.id,
        },
      })

      // Send invitation email
      const invitationUrl = `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/invitation/accept/${invitationToken}`

      // Use organization name if custom, otherwise use "Agentic Web"
      const brandName = project.organization.custom ? project.organization.name : 'Agentic Web'

      await resend.emails.send({
        from: env.SENDER_EMAIL,
        to: [input.email],
        subject: `Invitation to join ${project.name} project`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Project Invitation</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 24px; font-weight: bold; color: #000; }
              .button { display: inline-block; padding: 12px 24px; background-color: #000; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
              .project-info { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">${brandName}</div>
              </div>

              <h2>You're invited to join a project!</h2>

              <p>Hello,</p>

              <p>You've been invited to join the <strong>${project.name}</strong> project in the <strong>${project.organization.name}</strong> organization${project.organization.custom ? '' : ' on Agentic Web'}.</p>

              <div class="project-info">
                <strong>Project:</strong> ${project.name}<br>
                <strong>Organization:</strong> ${project.organization.name}<br>
                <strong>Role:</strong> ${input.role}<br>
                ${project.description ? `<strong>Description:</strong> ${project.description}` : ''}
              </div>

              <p>Click the button below to accept the invitation and join the project:</p>

              <div style="text-align: center;">
                <a href="${invitationUrl}" class="button">Accept Invitation</a>
              </div>

              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${invitationUrl}</p>

              <p><strong>This invitation will expire in 7 days.</strong></p>

              <p>If you don't have a${project.organization.custom ? 'n' : 'n Agentic Web'} account yet, you'll be prompted to create one when you accept the invitation.</p>

              <div class="footer">
                <p>Thanks,<br>The ${brandName} Team</p>
                <p>If you're having trouble clicking the button, copy and paste the URL above into your web browser.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      })

      return {
        success: true,
        message: 'Invitation sent successfully',
        invitationId: invitation.id,
      }
    }),

  // Accept invitation via token (public endpoint)
  acceptInvitation: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      console.log('Looking for invitation with token:', input.token)
      
      // Find the invitation
      const invitation = await ctx.db.projectInvitation.findFirst({
        where: {
          token: input.token,
          used: false,
          expires: { gt: new Date() },
        },
        include: {
          project: {
            include: {
              organization: true,
            },
          },
        },
      })
      
      console.log('Found invitation:', invitation ? 'YES' : 'NO')
      if (!invitation) {
        // Let's also check if there's an invitation with this token regardless of status
        const anyInvitation = await ctx.db.projectInvitation.findFirst({
          where: { token: input.token },
          select: { id: true, used: true, expires: true },
        })
        console.log('Any invitation with this token:', anyInvitation)
      }

      if (!invitation) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid or expired invitation token',
        })
      }

      // Check if user is authenticated
      if (!ctx.session?.user) {
        // Return invitation details so user can be redirected to sign in/up
        return {
          requiresAuth: true,
          project: {
            id: invitation.project.id,
            name: invitation.project.name,
            organization: invitation.project.organization.name,
          },
          organization: {
            slug: invitation.project.organization.slug,
            custom: invitation.project.organization.custom,
          },
          role: invitation.role,
          email: invitation.email,
          token: input.token,
        }
      }

      console.log('User session:', {
        userId: ctx.session.user.id,
        userEmail: ctx.session.user.email,
        sessionData: ctx.session.user
      })

      // Check if user has an email in session
      if (!ctx.session.user.email) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User session does not contain email information. Please sign out and sign in again.',
        })
      }

      // Check if user's email matches the invitation email (case-insensitive)
      const userEmail = ctx.session.user.email.toLowerCase().trim()
      const invitationEmail = invitation.email.toLowerCase().trim()
      
      console.log('Email comparison:', {
        userEmail,
        invitationEmail,
        originalUserEmail: ctx.session.user.email,
        originalInvitationEmail: invitation.email,
        match: userEmail === invitationEmail
      })
      
      if (userEmail !== invitationEmail) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `This invitation was sent to ${invitation.email}, but you are signed in as ${ctx.session.user.email}. Please sign in with the correct email address.`,
        })
      }

      // Check if user is already a member
      const existingMember = await ctx.db.projectMember.findFirst({
        where: {
          projectId: invitation.projectId,
          userId: ctx.session.user.id,
        },
      })

      if (existingMember) {
        // Mark invitation as used and return success
        await ctx.db.projectInvitation.update({
          where: { id: invitation.id },
          data: { used: true },
        })

        return {
          success: true,
          message: 'You are already a member of this project',
          redirectTo: `/apps/projects/${invitation.projectId}/overview`,
        }
      }

      // Add user to project and mark invitation as used
      await ctx.db.$transaction([
        ctx.db.projectMember.create({
          data: {
            projectId: invitation.projectId,
            userId: ctx.session.user.id,
            role: invitation.role,
          },
        }),
        ctx.db.projectInvitation.update({
          where: { id: invitation.id },
          data: { used: true },
        }),
      ])

      return {
        success: true,
        message: 'Successfully joined the project!',
        redirectTo: `/apps/projects/${invitation.projectId}/overview`,
      }
    }),

  // Get pending invitations for a project
  getPendingInvitations: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user has access to this project
      const userProjectAccess = await ctx.db.projectMember.findFirst({
        where: {
          projectId: input.projectId,
          userId: ctx.session.user.id,
        },
      })

      if (!userProjectAccess) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "You don't have access to this project",
        })
      }

      return ctx.db.projectInvitation.findMany({
        where: {
          projectId: input.projectId,
          used: false,
          expires: { gt: new Date() },
        },
        include: {
          invitedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    }),

  // Cancel/revoke an invitation
  cancelInvitation: protectedProcedure
    .input(z.object({ invitationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get the invitation to check project access
      const invitation = await ctx.db.projectInvitation.findUnique({
        where: { id: input.invitationId },
        include: { project: true },
      })

      if (!invitation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invitation not found',
        })
      }

      // Check if current user is admin of the project or the one who sent the invitation
      const userProjectRole = await ctx.db.projectMember.findFirst({
        where: {
          projectId: invitation.projectId,
          userId: ctx.session.user.id,
          role: ProjectRole.ADMIN,
        },
      })

      const canCancel = userProjectRole || invitation.invitedById === ctx.session.user.id

      if (!canCancel) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only project admins or the sender can cancel invitations',
        })
      }

      // Delete the invitation
      await ctx.db.projectInvitation.delete({
        where: { id: input.invitationId },
      })

      return {
        success: true,
        message: 'Invitation cancelled successfully',
      }
    }),
})
