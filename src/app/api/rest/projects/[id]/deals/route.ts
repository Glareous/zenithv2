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
        deals: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
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

    const deals = (project as any).deals.map((deal: any) => ({
      ...deal,
      dealDate: deal.dealDate?.toISOString() || null,
      createdAt: deal.createdAt.toISOString(),
      updatedAt: deal.updatedAt.toISOString(),
    }))

    return NextResponse.json(deals)
  } catch (error) {
    console.error('Error in /api/rest/projects/[id]/deals GET:', error)
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
      dealDate,
      isActive = true,
      isExpired = true,
      revenue,
      customerId,
    } = body

    if (!customerId) {
      return NextResponse.json(
        { error: { message: 'Customer ID is required' } },
        { status: 400 }
      )
    }

    // Verify user has access to the project
    const project = await verifyProjectAccess(
      id,
      user,
      ctx.isGlobalApiKey,
      ctx.isAdminApiKey
    )

    if (!project) {
      return NextResponse.json(
        { error: { message: 'Project not found' } },
        { status: 404 }
      )
    }

    // Verify customer exists and belongs to the project
    const customer = await ctx.db.projectCustomer.findFirst({
      where: {
        id: customerId,
        projectId: id,
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

    if (!customer) {
      return NextResponse.json(
        { error: { message: 'Customer not found' } },
        { status: 404 }
      )
    }

    // Create deal and deal message in a transaction
    const result = await ctx.db.$transaction(async (tx) => {
      const deal = await tx.projectDeal.create({
        data: {
          name: customer.name,
          dealDate: dealDate ? new Date(dealDate) : undefined,
          isActive,
          isExpired,
          revenue,
          customerId: customer.id,
          projectId: id,
          createdById: user.id,
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      const dealImage =
        customer.files?.[0]?.s3Url || '/assets/images/user-avatar.jpg'

      await tx.projectDealMessage.create({
        data: {
          dealId: deal.id,
          dealName: deal.name,
          dealImage,
          status: 'ACTIVE',
        },
      })

      return deal
    })

    return NextResponse.json(
      {
        ...result,
        dealDate: result.dealDate?.toISOString() || null,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in /api/rest/projects/[id]/deals POST:', error)
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
