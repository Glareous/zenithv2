import { NextRequest, NextResponse } from 'next/server'

import { createTRPCContext } from '@src/server/api/trpc'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; customerId: string } }
) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers })
    const user = ctx.session?.user || ctx.apiKeyUser

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, customerId } = params

    let customer

    // If admin API key, can access any customer
    if (ctx.isAdminApiKey) {
      customer = await ctx.db.projectCustomer.findFirst({
        where: {
          id: customerId,
          projectId: id,
        },
        include: {
          files: {
            where: {
              fileType: 'IMAGE',
            },
          },
          _count: {
            select: {
              orders: true,
            },
          },
        },
      })
    } else {
      // Regular access - check project access
      customer = await ctx.db.projectCustomer.findFirst({
        where: {
          id: customerId,
          projectId: id,
          project: {
            organization: {
              members: {
                some: { userId: user.id },
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
          _count: {
            select: {
              orders: true,
            },
          },
        },
      })
    }

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...customer,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error(
      'Error in /api/rest/projects/[id]/customers/[customerId] GET:',
      error
    )
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; customerId: string } }
) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers })
    const user = ctx.session?.user || ctx.apiKeyUser

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, customerId } = await params
    const body = await req.json()
    const {
      name,
      email,
      phoneNumber,
      location,
      subscriber,
      gender,
      role,
      website,
      isActive,
      origin,
    } = body

    if (
      name !== undefined &&
      (typeof name !== 'string' || name.trim().length === 0)
    ) {
      return NextResponse.json(
        { error: 'Name must be a non-empty string' },
        { status: 400 }
      )
    }

    if (
      email !== undefined &&
      email &&
      (typeof email !== 'string' || !email.includes('@'))
    ) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if user has permission to update this customer (must be admin)
    const customer = await ctx.db.projectCustomer.findFirst({
      where: {
        id: customerId,
        projectId: id,
        project: {
          organization: {
            members: {
              some: {
                userId: user.id,
                role: { in: ['OWNER', 'ADMIN'] },
              },
            },
          },
        },
      },
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found or insufficient permissions' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (email !== undefined) updateData.email = email
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber
    if (location !== undefined) updateData.location = location
    if (subscriber !== undefined) updateData.subscriber = subscriber
    if (gender !== undefined) updateData.gender = gender
    if (role !== undefined) updateData.role = role
    if (website !== undefined) updateData.website = website
    if (isActive !== undefined) updateData.isActive = isActive
    if (origin !== undefined) updateData.origin = origin

    const updatedCustomer = await ctx.db.projectCustomer.update({
      where: { id: customerId },
      data: updateData,
      include: {
        files: {
          where: {
            fileType: 'IMAGE',
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    })

    return NextResponse.json({
      ...updatedCustomer,
      createdAt: updatedCustomer.createdAt.toISOString(),
      updatedAt: updatedCustomer.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error(
      'Error in /api/rest/projects/[id]/customers/[customerId] PUT:',
      error
    )
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; customerId: string } }
) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers })
    const user = ctx.session?.user || ctx.apiKeyUser

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, customerId } = params

    // Check if user has permission to delete this customer (must be admin)
    const customer = await ctx.db.projectCustomer.findFirst({
      where: {
        id: customerId,
        projectId: id,
        project: {
          organization: {
            members: {
              some: {
                userId: user.id,
                role: { in: ['OWNER', 'ADMIN'] },
              },
            },
          },
        },
      },
      include: {
        files: true,
        orders: {
          where: {
            status: {
              in: ['NEW', 'PENDING', 'SHIPPING'],
            },
          },
        },
      },
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found or insufficient permissions' },
        { status: 404 }
      )
    }

    // Business logic validations (same as tRPC)
    if (customer.isActive) {
      return NextResponse.json(
        {
          error:
            'Cannot delete an active customer. Please deactivate the customer first.',
        },
        { status: 400 }
      )
    }

    if (customer.subscriber) {
      return NextResponse.json(
        {
          error:
            'Cannot delete a subscriber customer. Please remove subscription first.',
        },
        { status: 400 }
      )
    }

    if (customer.orders.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete customer with ${customer.orders.length} active order(s). Please wait for all orders to be delivered or cancelled.`,
        },
        { status: 400 }
      )
    }

    // Delete customer (files will be deleted in cascade)
    await ctx.db.projectCustomer.delete({
      where: { id: customerId },
    })

    return NextResponse.json(null, { status: 204 })
  } catch (error) {
    console.error(
      'Error in /api/rest/projects/[id]/customers/[customerId] DELETE:',
      error
    )
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
