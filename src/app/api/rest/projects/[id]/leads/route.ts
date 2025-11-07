import { NextRequest, NextResponse } from 'next/server'

import { createTRPCContext } from '@src/server/api/trpc'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers })
    const user = ctx.session?.user || ctx.apiKeyUser

    if (!user) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    const { id } = await params
    let project

    // If admin API key, can access any project's leads
    if (ctx.isAdminApiKey) {
      project = await ctx.db.project.findUnique({
        where: { id },
        include: {
          leads: {
            where: {
              contactId: { not: null },
            },
            include: {
              contact: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  companyName: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      })
    } else {
      // Regular access - verify user has access to the project
      project = await ctx.db.project.findFirst({
        where: {
          id,
          organization: {
            members: {
              some: { userId: user.id },
            },
          },
        },
        include: {
          leads: {
            where: {
              contactId: { not: null },
            },
            include: {
              contact: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  companyName: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      })
    }

    if (!project) {
      return NextResponse.json(
        { error: { message: 'Project not found' } },
        { status: 404 }
      )
    }

    const leads = project.leads.map((lead) => ({
      ...lead,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),
    }))

    return NextResponse.json(leads)
  } catch (error) {
    console.error('Error in /api/rest/projects/[id]/leads GET:', error)
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers })
    const user = ctx.session?.user || ctx.apiKeyUser

    if (!user) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const { name, email, phoneNumber, status = 'NEW', contactId } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: { message: 'Name is required' } },
        { status: 400 }
      )
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: { message: 'Valid email is required' } },
        { status: 400 }
      )
    }

    if (
      !phoneNumber ||
      typeof phoneNumber !== 'string' ||
      phoneNumber.trim().length === 0
    ) {
      return NextResponse.json(
        { error: { message: 'Phone number is required' } },
        { status: 400 }
      )
    }

    // Verify user has access to the project
    const project = await ctx.db.project.findFirst({
      where: {
        id,
        organization: {
          members: {
            some: { userId: user.id },
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: { message: 'Project not found' } },
        { status: 404 }
      )
    }

    // Validate contactId if provided
    if (contactId) {
      const contact = await ctx.db.projectContact.findFirst({
        where: {
          id: contactId,
          projectId: id,
        },
      })

      if (!contact) {
        return NextResponse.json(
          { error: { message: 'Contact not found' } },
          { status: 404 }
        )
      }
    }

    const lead = await ctx.db.projectLead.create({
      data: {
        name: name.trim(),
        email,
        phoneNumber,
        status,
        contactId,
        projectId: id,
        createdById: user.id,
      },
      include: {
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

    return NextResponse.json(
      {
        ...lead,
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in /api/rest/projects/[id]/leads POST:', error)
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
