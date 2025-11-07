import { env } from '@src/env'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@src/server/api/trpc'
import { signIn, signOut } from '@src/server/auth'
import { TRPCError } from '@trpc/server'
import { compare, hash } from 'bcryptjs'
import { Resend } from 'resend'
import { z } from 'zod'

const resend = new Resend(env.RESEND_API_KEY)

export const authRouter = createTRPCRouter({
  // Sign up with email and password
  signUp: publicProcedure
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        username: z.string().min(3),
        email: z.string().email(),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log('Signup input:', input)

      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.email },
        select: { id: true, email: true },
      })

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User with this email already exists',
        })
      }

      const existingUsername = await ctx.db.user.findUnique({
        where: { username: input.username },
        select: { id: true, username: true },
      })
      if (existingUsername) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Username already taken',
        })
      }

      const hashedPassword = await hash(input.password, 12)

      // Extract organization name from email (part before @)
      const emailPrefix = input.email.split('@')[0]
      const organizationName = `${emailPrefix} organization`

      // Create user and organization in a transaction
      const result = await ctx.db.$transaction(async (tx) => {
        // Create the user
        const user = await tx.user.create({
          data: {
            firstName: input.firstName,
            lastName: input.lastName,
            username: input.username,
            email: input.email,
            password: hashedPassword,
            isVerified: false, // User starts as unverified
          },
        })

        // Create organization with user as owner
        const organization = await tx.organization.create({
          data: {
            name: organizationName,
            description: `Organization for ${input.email}`,
            ownerId: user.id,
            custom: false,
          },
        })

        // Add user as owner member in the organization
        await tx.organizationMember.create({
          data: {
            organizationId: organization.id,
            userId: user.id,
            role: 'OWNER',
          },
        })

        // Create default project
        const project = await tx.project.create({
          data: {
            name: `${input.firstName} ${input.lastName}'s Project`,
            description: 'Your first project to get started',
            organizationId: organization.id,
            createdById: user.id,
          },
        })

        // Add user as admin member of the default project
        await tx.projectMember.create({
          data: {
            projectId: project.id,
            userId: user.id,
            role: 'ADMIN',
          },
        })

        // Create default categories for products and services
        await tx.projectCategory.create({
          data: {
            name: 'General',
            description: 'Default category for products',
            type: 'PRODUCT',
            isDefault: true,
            projectId: project.id,
            createdById: user.id,
          },
        })

        await tx.projectCategory.create({
          data: {
            name: 'General Services',
            description: 'Default category for services',
            type: 'SERVICE',
            isDefault: true,
            projectId: project.id,
            createdById: user.id,
          },
        })

        // Create default warehouse "a001"
        await tx.projectProductWarehouse.create({
          data: {
            warehouseId: 'a001',
            name: 'DEFAULT',
            isDefault: true,
            projectId: project.id,
            createdById: user.id,
          },
        })

        // Create default WhatsApp integration (inactive)
        await tx.projectIntegration.create({
          data: {
            name: 'WhatsApp Integration',
            type: 'WHATSAPP',
            isActive: false,
            config: {},
            projectId: project.id,
            createdById: user.id,
          },
        })

        // Create default agents for all types (inactive) with default workflows
        const agentTypes = [
          { type: 'INBOUND' as const, name: 'Inbound Agent' },
          { type: 'OUTBOUND' as const, name: 'Outbound Agent' },
          { type: 'PROCESS' as const, name: 'Process Agent' },
          { type: 'RPA' as const, name: 'RPA Agent' },
        ]
        for (const agentConfig of agentTypes) {
          // Create the agent
          const agent = await tx.projectAgent.create({
            data: {
              name: agentConfig.name,
              type: agentConfig.type,
              isActive: false,
              projectId: project.id,
            },
          })

          // Create default workflow for this agent with Global Settings
          await tx.projectAgentWorkflow.create({
            data: {
              name: 'Global Settings',
              instructions: `Default instructions for ${agentConfig.name}`,
              globalFaqs: [],
              globalObjections: [],
              nodes: [],
              edges: [],
              agentId: agent.id,
            },
          })
        }

        return { user, organization, project }
      })

      const user = result.user

      // Generate verification token
      const verificationToken = crypto.randomUUID()
      const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Create email verification token
      await ctx.db.emailVerificationToken.create({
        data: {
          token: verificationToken,
          expires: verificationTokenExpiry,
          userId: user.id,
        },
      })

      // Send verification email
      const verificationUrl = `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/auth/verify-email/${verificationToken}`

      await resend.emails.send({
        from: env.SENDER_EMAIL,
        to: [input.email],
        subject: 'Verify your Agentic Web email address',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verify Your Email</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { font-size: 24px; font-weight: bold; color: #000; }
                .button { display: inline-block; padding: 12px 24px; background-color: #000; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">Agentic Web</div>
                </div>
                
                <h2>Verify Your Email Address</h2>
                
                <p>Hello,</p>
                
                <p>Welcome to Agentic Web! To complete your registration and start creating amazing QR codes, please verify your email address.</p>
                
                <p>Click the button below to verify your email:</p>
                
                <div style="text-align: center;">
                  <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </div>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
                
                <p><strong>This link will expire in 24 hours.</strong></p>
                
                <div class="footer">
                  <p>Thanks,<br>The Agentic Web Team</p>
                  <p>If you're having trouble clicking the button, copy and paste the URL above into your web browser.</p>
                </div>
              </div>
            </body>
            </html>
          `,
      })
      return {
        success: true,
        userId: user.id,
        message:
          'Account created successfully. Please check your email to verify your account.',
      }
    }),

  // Change password (requires current password)
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { password: true },
      })

      if (!user?.password) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No password set for this account',
        })
      }

      const isValidPassword = await compare(
        input.currentPassword,
        user.password
      )
      if (!isValidPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Current password is incorrect',
        })
      }

      const hashedNewPassword = await hash(input.newPassword, 12)

      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { password: hashedNewPassword },
      })

      return { success: true }
    }),

  // Change email
  changeEmail: protectedProcedure
    .input(
      z.object({
        newEmail: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { password: true },
      })

      if (!user?.password) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Password verification required',
        })
      }

      const isValidPassword = await compare(input.password, user.password)
      if (!isValidPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Password is incorrect',
        })
      }

      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.newEmail },
      })

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Email is already in use',
        })
      }

      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { email: input.newEmail },
      })

      return { success: true }
    }),

  // Request password reset
  forgotPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      })

      console.log({ user })
      if (!user) {
        // Don't reveal if user exists for security
        return { success: true }
      }

      // Generate reset token
      const resetToken = crypto.randomUUID()
      const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

      // Create password reset token
      await ctx.db.passwordResetToken.create({
        data: {
          token: resetToken,
          expires: resetTokenExpiry,
          userId: user.id,
        },
      })

      // Send password reset email
      const resetUrl = `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/auth/reset-password-basic/${resetToken}`

      await resend.emails.send({
        from: env.SENDER_EMAIL,
        to: [input.email],
        subject: 'Reset your Agentic Web password',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Reset Your Password</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { font-size: 24px; font-weight: bold; color: #000; }
                .button { display: inline-block; padding: 12px 24px; background-color: #000; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">Agentic Web</div>
                </div>
                
                <h2>Reset Your Password</h2>
                
                <p>Hello,</p>
                
                <p>We received a request to reset your password for your Agentic Web account. If you didn't make this request, you can safely ignore this email.</p>
                
                <p>To reset your password, click the button below:</p>
                
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666;">${resetUrl}</p>
                
                <p><strong>This link will expire in 1 hour.</strong></p>
                
                <div class="footer">
                  <p>Thanks,<br>The Agentic Web Team</p>
                  <p>If you're having trouble clicking the button, copy and paste the URL above into your web browser.</p>
                </div>
              </div>
            </body>
            </html>
          `,
      })

      return {
        success: true,
      }
    }),

  // Reset password with token
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        newPassword: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const resetToken = await ctx.db.passwordResetToken.findFirst({
        where: {
          token: input.token,
          expires: {
            gt: new Date(),
          },
          used: false,
        },
        include: {
          user: true,
        },
      })

      if (!resetToken) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid or expired reset token',
        })
      }

      const hashedPassword = await hash(input.newPassword, 12)

      // Update password and mark token as used
      await ctx.db.$transaction([
        ctx.db.user.update({
          where: { id: resetToken.userId },
          data: {
            password: hashedPassword,
          },
        }),
        ctx.db.passwordResetToken.update({
          where: { id: resetToken.id },
          data: {
            used: true,
          },
        }),
      ])

      return { success: true }
    }),

  // Verify email with token
  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const verificationToken = await ctx.db.emailVerificationToken.findFirst({
        where: {
          token: input.token,
          expires: {
            gt: new Date(),
          },
          used: false,
        },
        include: {
          user: true,
        },
      })

      if (!verificationToken) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid or expired verification token',
        })
      }

      // Update user as verified and mark token as used
      await ctx.db.$transaction([
        ctx.db.user.update({
          where: { id: verificationToken.userId },
          data: {
            isVerified: true,
            emailVerified: new Date(), // Also update NextAuth field for compatibility
          },
        }),
        ctx.db.emailVerificationToken.update({
          where: { id: verificationToken.id },
          data: {
            used: true,
          },
        }),
      ])

      return {
        success: true,
        message: 'Email verified successfully!',
        email: verificationToken.user.email,
      }
    }),

  // Resend verification email
  resendVerificationEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
        select: { id: true, email: true, isVerified: true },
      })

      if (!user) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No account found with this email address',
        })
      }

      if (user.isVerified) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Email is already verified',
        })
      }

      // Delete any existing unused verification tokens for this user
      await ctx.db.emailVerificationToken.deleteMany({
        where: {
          userId: user.id,
          used: false,
        },
      })

      // Generate new verification token
      const verificationToken = crypto.randomUUID()
      const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Create new email verification token
      await ctx.db.emailVerificationToken.create({
        data: {
          token: verificationToken,
          expires: verificationTokenExpiry,
          userId: user.id,
        },
      })

      // Send verification email
      const verificationUrl = `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/auth/verify-email/${verificationToken}`

      try {
        await resend.emails.send({
          from: env.SENDER_EMAIL,
          to: [input.email],
          subject: 'Verify your Agentic Web email address',
          html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 24px; font-weight: bold; color: #000; }
              .button { display: inline-block; padding: 12px 24px; background-color: #000; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">Agentic Web</div>
              </div>
              
              <h2>Verify Your Email Address</h2>
              
              <p>Hello,</p>
              
              <p>Please verify your email address to continue using Agentic Web.</p>
              
              <p>Click the button below to verify your email:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
              
              <p><strong>This link will expire in 24 hours.</strong></p>
              
              <div class="footer">
                <p>Thanks,<br>The Agentic Web Team</p>
                <p>If you're having trouble clicking the button, copy and paste the URL above into your web browser.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        })
      } catch (error) {
        console.error('Failed to send verification email:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send verification email',
        })
      }

      return {
        success: true,
        message: 'Verification email sent successfully!',
      }
    }),

  // Get email from verification token (for displaying email on failed verification)
  getEmailFromToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const verificationToken = await ctx.db.emailVerificationToken.findFirst({
        where: {
          token: input.token,
        },
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      })

      if (!verificationToken) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Token not found',
        })
      }

      return { email: verificationToken.user.email }
    }),

  // Validate login permissions (for slug-based and basic login)
  validateLoginPermissions: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        slug: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
        select: { id: true, role: true },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      // If slug is provided (login from /auth/signin-basic/[slug])
      if (input.slug) {
        // Verify organization exists
        const organization = await ctx.db.organization.findUnique({
          where: { slug: input.slug },
          include: {
            members: {
              where: { userId: user.id },
            },
          },
        })

        if (!organization) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Organization not found',
          })
        }

        // Check if user is member
        if (organization.members.length === 0) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `You don't have access to this organization. Please contact an administrator.`,
          })
        }

        // SUPERADMIN cannot login via slug
        if (user.role === 'SUPERADMIN') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Super admins must use the standard login page',
          })
        }

        return { allowed: true }
      } else {
        // Login from /auth/signin-basic (without slug)
        // Only SUPERADMIN or users with organizations WITHOUT slug can login here

        if (user.role !== 'SUPERADMIN') {
          // Check if user belongs to an organization WITH a slug
          const userOrgs = await ctx.db.organizationMember.findMany({
            where: { userId: user.id },
            include: {
              organization: {
                select: { slug: true, name: true },
              },
            },
          })

          // If user belongs to organizations with slugs, they must use slug login
          const slugOrg = userOrgs.find(
            (org) => org.organization.slug && org.organization.slug.trim() !== ''
          )

          if (slugOrg) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: `Please use your organization login page: /auth/signin-basic/${slugOrg.organization.slug}`,
            })
          }
        }

        return { allowed: true }
      }
    }),
})
