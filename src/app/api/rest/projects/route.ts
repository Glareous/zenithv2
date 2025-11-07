import { NextRequest, NextResponse } from 'next/server'

import { createTRPCContext } from '@src/server/api/trpc'

export async function GET(req: NextRequest) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers })
    const user = ctx.session?.user || ctx.apiKeyUser

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let projects

    if (ctx.isAdminApiKey) {
      const [ownedOrgs, projectMemberships] = await Promise.all([
        ctx.db.organization.findMany({
          where: { ownerId: user.id },
          include: {
            projects: {
              include: {
                createdBy: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        }),
        ctx.db.projectMember.findMany({
          where: { userId: user.id },
          include: {
            project: {
              include: {
                createdBy: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        }),
      ])

      const allProjects = [
        ...ownedOrgs.flatMap((org) => org.projects),
        ...projectMemberships.map((pm) => pm.project),
      ]

      const uniqueProjects = new Map()
      allProjects.forEach((project) => {
        if (!uniqueProjects.has(project.id)) {
          uniqueProjects.set(project.id, {
            ...project,
            createdAt: project.createdAt.toISOString(),
            updatedAt: project.updatedAt.toISOString(),
          })
        }
      })

      projects = Array.from(uniqueProjects.values())
    } else {
      const memberships = await ctx.db.organizationMember.findMany({
        where: { userId: user.id },
        include: {
          organization: {
            include: {
              projects: true,
            },
          },
        },
      })

      projects = memberships.flatMap((membership) =>
        membership.organization.projects.map((project) => ({
          ...project,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
        }))
      )
    }

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error in /api/rest/projects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers })
    const user = ctx.session?.user || ctx.apiKeyUser

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, organizationId, logoUrl, status } = body

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      )
    }

    let canCreateProject = false

    if (ctx.isAdminApiKey) {
      const [isOwner, hasProject] = await Promise.all([
        ctx.db.organization.findFirst({
          where: {
            id: organizationId,
            ownerId: user.id,
          },
        }),
        ctx.db.projectMember.findFirst({
          where: {
            userId: user.id,
            project: {
              organizationId: organizationId,
            },
          },
        }),
      ])
      canCreateProject = !!(isOwner || hasProject)
    } else {
      const organization = await ctx.db.organization.findFirst({
        where: {
          id: organizationId,
          ownerId: user.id,
        },
      })
      canCreateProject = !!organization
    }

    if (!canCreateProject) {
      return NextResponse.json(
        {
          error:
            'You can only create projects in organizations where you are owner or have existing projects (admin)',
        },
        { status: 403 }
      )
    }

    const project = await ctx.db.project.create({
      data: {
        name,
        description,
        organizationId,
        createdById: user.id,
        logoUrl,
        status: status || 'CREATED',
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
