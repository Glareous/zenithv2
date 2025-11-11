import { PrismaAdapter } from '@auth/prisma-adapter'
import { OrganizationRole } from '@prisma/client'
import { db } from '@src/server/db'
import { compare } from 'bcryptjs'
import { type DefaultSession, type NextAuthConfig, type User } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import DiscordProvider from 'next-auth/providers/discord'
import GoogleProvider from 'next-auth/providers/google'

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      role?: string
      defaultOrganization?: {
        id: string
        name: string
      }
    } & DefaultSession['user']
  }

  interface User {
    role?: string
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  providers: [
    DiscordProvider({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        slug: { label: 'Slug', type: 'text', optional: true },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            password: true,
            isVerified: true,
            role: true,
          },
        })

        if (!user?.password) {
          return null
        }

        const isValidPassword = await compare(
          credentials.password as string,
          user.password
        )

        if (!isValidPassword) {
          return null
        }

        if (!user.isVerified) {
          return null
        }

        // Return user - additional validations will be done on the frontend
        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
        }
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isOnAuth = nextUrl.pathname.startsWith('/auth')
      const isOnRoot = nextUrl.pathname === '/'

      if (isOnRoot) {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }

      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false
      }

      if (isOnAuth && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }

      return true
    },
    async signIn({ user, account, profile }) {
      return true
    },
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session: async ({ session, token }) => {
      if (token?.id) {
        session.user.id = token.id as string

        // Fetch user role from database
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        })
        session.user.role = dbUser?.role || undefined

        // Fetch default organization (first organization where user is a member)
        const membership = await db.organizationMember.findFirst({
          where: { userId: token.id as string },
          orderBy: { joinedAt: 'asc' }, // Get the first organization they joined
          include: {
            organization: {
              select: { id: true, name: true },
            },
          },
        })
        session.user.defaultOrganization = membership?.organization || undefined
      }
      return session
    },
  },
  events: {
    async createUser({ user }: { user: User }) {
      try {
        // Create default organization for new users (OAuth or credentials)
        // No slug needed - they login via /auth/signin-basic
        const organization = await db.organization.create({
          data: {
            name: `${user.name || user.email?.split('@')[0]}'s Organization`,
            description: 'Personal workspace',
            owner: {
              connect: {
                id: user.id,
              },
            },
          },
        })

        // Add user as owner to the organization
        await db.organizationMember.create({
          data: {
            userId: user.id as string,
            organizationId: organization.id,
            role: OrganizationRole.OWNER,
          },
        })

        console.log(`Created default organization for new user: ${user.email}`)
      } catch (error) {
        console.error('Error creating default organization:', error)
        // Don't throw error to avoid breaking user creation
      }
    },
  },
  session: {
    strategy: 'jwt',
  },
} satisfies NextAuthConfig
