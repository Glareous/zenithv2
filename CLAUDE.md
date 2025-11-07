# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands

- `yarn dev` - Start development server
- `yarn build` - Build the application for production
- `yarn start` - Start production server
- `yarn preview` - Start production server (alias for start)

### Code Quality

- `yarn lint` - Run ESLint
- `yarn lint:fix` - Run ESLint with auto-fix
- `yarn prettier:write` - Format code with Prettier
- **Note**: No separate typecheck command - use `yarn build` to check types

### Database

- `yarn db:push` - Push schema changes to database (development)
- `yarn db:migrate` - Deploy database migrations (production)
- `yarn db:seed` - Seed database with initial data (uses prisma/seed.ts)
- **Important**: After schema changes, run `yarn db:push` to update the database

## Architecture Overview

### Stack

- **Framework**: Next.js 15 with App Router
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js v5 with multiple OAuth providers (GitHub, Google, Discord, Facebook) + custom email/password auth
- **API**: tRPC for type-safe API calls
- **Styling**: Tailwind CSS v4 with PostCSS
- **UI Components**: Custom component library with Headless UI
- **State Management**: TanStack Query (React Query) + Redux Toolkit
- **Forms**: React Hook Form with Zod validation
- **Package Manager**: Yarn

### Application Domain

**AgenticWeb** is a multi-tenant SaaS platform for creating and managing AI-powered sales agents that operate via multiple communication channels. The platform follows a hierarchical structure:

1. **Organizations** - Top-level tenant (created on user signup)
2. **Projects** - Containers for related products and agents
3. **Agents** - AI agents with multiple types (SALES, NFO, CUSTOMER_SERVICE, LOGISTICS, CRM)
4. **Products** - Items that agents can sell
5. **Chats/Messages** - Customer conversation tracking
6. **Integrations** - Multiple communication channels (WhatsApp, Telegram, Email, SMS)

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (layout)/          # Grouped routes with shared layout
│   ├── (non-layout)/      # Grouped routes without layout
│   └── api/               # API routes and handlers
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── common/            # Shared UI components
│   ├── layout/            # Layout-specific components
│   ├── molecules/         # Composite components
│   ├── organisms/         # Complex UI sections
│   └── pages/             # Page-level components
├── server/                # Backend code
│   ├── api/               # tRPC routers and procedures
│   ├── auth/              # Authentication configuration
│   └── db.ts              # Database connection
├── views/                 # Page views and sections
├── slices/                # Redux state management
├── trpc/                  # tRPC client configuration
├── utils/                 # Utility functions
├── dtos/                  # Data transfer objects
├── types/                 # TypeScript type definitions
├── assets/                # Static assets (CSS, fonts, images)
└── env.js                 # Environment variables validation
```

### Key Patterns

#### Component Architecture

- **Atoms**: Basic UI components (button, input, dialog)
- **Molecules**: Composite components (tables, forms)
- **Pages**: Full page components with data fetching
- **Templates**: Layout components (auth, sidebar, stacked)

#### Authentication

- Multi-provider auth system supporting OAuth (GitHub, Google, Discord, Facebook) and email/password
- Custom email verification and password reset flows
- Email sending via Resend API
- Protected routes using tRPC middleware

#### Database Schema

- MongoDB with Prisma ORM
- Multi-tenant architecture with Organizations → Projects → Agents/Products hierarchy
- User model supports multiple OAuth providers and email/password auth
- Role-based access control at organization and project levels
- Multiple agent types and integration channels
- All models use `cuid()` for IDs and `@map("_id")` for MongoDB

**Key Models:**

- **Organization**: Top-level tenant with owner and members (OrganizationRole: OWNER/ADMIN/MEMBER)
- **Project**: Container for products, agents, and files (ProjectStatus: ACTIVE/CREATED/COMPLETED)
- **Agent**: AI agents with multiple types (AgentType: SALES/NFO/CUSTOMER_SERVICE/LOGISTICS/CRM)
- **Product**: Items that agents can sell within projects
- **Chat/Message**: Multi-channel conversation tracking with customers
- **ProjectFile**: S3-stored files with metadata (FileType: DOCUMENT/IMAGE/VIDEO/AUDIO/OTHER)
- **ProjectIntegration**: Multi-channel integrations (IntegrationType: WHATSAPP/TELEGRAM/EMAIL/SMS)
- **ProjectInvitation**: Email-based project invitations with tokens
- **OrganizationMember/ProjectMember**: Junction tables with role-based permissions

#### tRPC Setup

- Type-safe API with superjson transformer
- Public and protected procedures
- Timing middleware for development debugging
- Context includes database and session

### Environment Variables

Required variables (defined in `src/env.js`):

- `DATABASE_URL` - MongoDB connection string
- `AUTH_SECRET` - NextAuth secret
- `NEXTAUTH_URL` - NextAuth URL
- `GOOGLE_MAPS_API_KEY` - Google Maps API key
- `RESEND_API_KEY` - Email service API key
- `SENDER_EMAIL` - Email sender address
- `AWS_ACCESS_API_KEY` - AWS access key
- `AWS_SECRET_ACCESS_API_KEY` - AWS secret access key
- `AWS_REGION` - AWS region (default: us-east-2)
- `S3_BUCKET_NAME` - S3 bucket name
- `NEXT_PUBLIC_BRAND_NAME` - Brand name for client
- `NEXT_PUBLIC_IS_API_ACTIVE` - API status flag
- `NEXT_PUBLIC_IS_LOCAL_STORAGE` - Local storage flag
- `NEXT_PUBLIC_BASE_URL` - Base URL for client

**OAuth Providers (Optional):**

- `GITHUB_ID` & `GITHUB_SECRET` - GitHub OAuth
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - Google OAuth
- `DISCORD_CLIENT_ID` & `DISCORD_CLIENT_SECRET` - Discord OAuth
- `FACEBOOK_CLIENT_ID` & `FACEBOOK_CLIENT_SECRET` - Facebook OAuth

### Data Access Patterns

- **Multi-tenancy**: All data is scoped to organizations first, then projects
- **Role-based access**: Organization roles (OWNER/ADMIN/MEMBER) and project roles (ADMIN/MEMBER)
- **Agent ownership**: Agents belong to projects, inherit access from project membership
- **Chat isolation**: Each agent's conversations are isolated within the project scope
- **Multi-channel**: Support for multiple communication channels per project

### Development Notes

- Path aliases configured in tsconfig.json: `@src/*`, `@assets/*`, `@views/*`, `@pages/*`, `@common/*`, `@custom/*`, `@dtos/*`
- ESLint configured with relaxed rules for rapid development
- Prettier with Tailwind plugin for consistent formatting
- TypeScript strict mode enabled
- Husky for pre-commit hooks with lint-staged
- Database changes require `yarn db:push` (development) or `yarn db:migrate` (production)
- Tailwind CSS v4 with PostCSS configuration

## Development Guidelines

### Forms and Validation

- **Always use**: React Hook Form with Zod validation for all forms
- **Toast notifications**: Use react-toastify for success/error messages
- **Form patterns**: Follow existing form patterns in the codebase

### UI Component Architecture

- **Headless UI**: When modifying Headless UI components, maintain Catalyst structure with `data-slot="..."` attributes
- **Component hierarchy**: Follow atoms → molecules → pages → templates structure
- **Styling**: Use Tailwind CSS v4 with PostCSS and CSS variables support

### Code Quality

- **Planning**: Always create a plan before starting implementation
- **Scope**: Only make changes explicitly requested by the user
- **Existing patterns**: Study and follow established code patterns in the codebase
- **Library verification**: Verify library availability in package.json before using new dependencies

### Key Libraries Used

- **UI**: Headless UI, Lucide React icons, React Select, PixeleyezUI
- **Data fetching**: tRPC with TanStack Query
- **State**: Redux Toolkit for complex state management
- **Calendar**: FullCalendar for scheduling features
- **File handling**: AWS SDK for S3 integration
- **Charts**: ApexCharts and ECharts for data visualization
- **Email**: Resend API for transactional emails
- **Maps**: React Google Maps API
- **Internationalization**: i18next with next-i18next
- **Animations**: AOS (Animate On Scroll)
- **Drag & Drop**: Hello Pangea DND
- **Tables**: TanStack Table with React Table
- **Date/Time**: Flatpickr with React Flatpickr
- **Notifications**: React Toastify
- **Icons**: Multiple icon libraries (Boxicons, Line Awesome, Remixicon, Font Awesome)