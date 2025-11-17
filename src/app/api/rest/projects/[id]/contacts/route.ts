import { NextRequest, NextResponse } from 'next/server'

import { createTRPCContext } from '@src/server/api/trpc'
import { verifyProjectAccess } from '@src/server/api/rest/helpers'

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

    const project = await verifyProjectAccess(
      id,
      user,
      ctx.isGlobalApiKey,
      ctx.isAdminApiKey,
      {
        contacts: {
          orderBy: { createdAt: 'desc' },
        },
      }
    )

    if (!project) {
      return NextResponse.json(
        { error: { message: 'Project not found' } },
        { status: 404 }
      )
    }

    const contacts = (project as any).contacts.map((contact: any) => ({
      ...contact,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString(),
    }))

    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Error in /api/rest/projects/[id]/contacts GET:', error)
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
    const {
      name,
      companyName,
      role,
      email,
      phoneNumber,
      website,
      status = 'CONTACT',
      subscriber = false,
      gender,
      location,
    } = body

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

    // Create contact and automatically create a lead in a transaction
    const result = await ctx.db.$transaction(async (tx) => {
      // Create the contact
      const contact = await tx.projectContact.create({
        data: {
          name: name.trim(),
          companyName,
          role,
          email,
          phoneNumber,
          website,
          status,
          subscriber,
          gender,
          location,
          projectId: id,
          createdById: user.id,
        },
      })

      // Automatically create a lead from the contact
      await tx.projectLead.create({
        data: {
          name: name.trim(),
          email,
          phoneNumber,
          status: 'NEW',
          projectId: id,
          createdById: user.id,
          contactId: contact.id,
        },
      })

      return contact
    })

    return NextResponse.json(
      {
        ...result,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in /api/rest/projects/[id]/contacts POST:', error)
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
