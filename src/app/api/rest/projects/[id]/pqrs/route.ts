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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const project = await verifyProjectAccess(
      id,
      user,
      ctx.isGlobalApiKey,
      ctx.isAdminApiKey,
      {
        pqrs: {
          include: {
            analysis: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      }
    )

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const pqrs = (project as any).pqrs.map((pqr: any) => ({
      ...pqr,
      createdAt: pqr.createdAt.toISOString(),
      updatedAt: pqr.updatedAt.toISOString(),
      analysis: pqr.analysis
        ? {
            ...pqr.analysis,
            createdAt: pqr.analysis.createdAt.toISOString(),
            updatedAt: pqr.analysis.updatedAt.toISOString(),
          }
        : null,
    }))

    return NextResponse.json(pqrs)
  } catch (error) {
    console.error('Error in /api/rest/projects/[id]/pqrs GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const {
      firstName,
      lastName,
      phone,
      email,
      city,
      documentType,
      documentNumber,
      message,
      status,
    } = body

    // Validate required fields
    if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
      return NextResponse.json({ error: 'First name is required' }, { status: 400 })
    }

    if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
      return NextResponse.json({ error: 'Last name is required' }, { status: 400 })
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 })
    }

    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!city || typeof city !== 'string' || city.trim().length === 0) {
      return NextResponse.json({ error: 'City is required' }, { status: 400 })
    }

    if (!documentType || typeof documentType !== 'string') {
      return NextResponse.json({ error: 'Document type is required' }, { status: 400 })
    }

    if (!documentNumber || typeof documentNumber !== 'string' || documentNumber.trim().length === 0) {
      return NextResponse.json({ error: 'Document number is required' }, { status: 400 })
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const project = await verifyProjectAccess(
      id,
      user,
      ctx.isGlobalApiKey,
      ctx.isAdminApiKey
    )

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const pqr = await ctx.db.projectPQR.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        city: city.trim(),
        documentType: documentType.trim(),
        documentNumber: documentNumber.trim(),
        message: message.trim(),
        status: status || 'PROCESSING',
        projectId: id,
      },
      include: {
        analysis: true,
      },
    })

    return NextResponse.json(
      {
        ...pqr,
        createdAt: pqr.createdAt.toISOString(),
        updatedAt: pqr.updatedAt.toISOString(),
        analysis: pqr.analysis
          ? {
              ...pqr.analysis,
              createdAt: pqr.analysis.createdAt.toISOString(),
              updatedAt: pqr.analysis.updatedAt.toISOString(),
            }
          : null,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in /api/rest/projects/[id]/pqrs POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers })
    const user = ctx.session?.user || ctx.apiKeyUser

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const {
      pqrId,
      firstName,
      lastName,
      phone,
      email,
      city,
      documentType,
      documentNumber,
      message,
      status,
    } = body

    if (!pqrId || typeof pqrId !== 'string') {
      return NextResponse.json(
        { error: 'PQR ID is required' },
        { status: 400 }
      )
    }

    const project = await verifyProjectAccess(
      id,
      user,
      ctx.isGlobalApiKey,
      ctx.isAdminApiKey,
      {
        pqrs: {
          where: { id: pqrId },
        },
      }
    )

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if PQR exists in this project
    const existingPqr = (project as any).pqrs[0]
    if (!existingPqr) {
      return NextResponse.json(
        { error: 'PQR not found in this project' },
        { status: 404 }
      )
    }

    // Update the PQR
    const updatedPqr = await ctx.db.projectPQR.update({
      where: { id: pqrId },
      data: {
        ...(firstName !== undefined && { firstName: firstName.trim() }),
        ...(lastName !== undefined && { lastName: lastName.trim() }),
        ...(phone !== undefined && { phone: phone.trim() }),
        ...(email !== undefined && { email: email.trim() }),
        ...(city !== undefined && { city: city.trim() }),
        ...(documentType !== undefined && { documentType: documentType.trim() }),
        ...(documentNumber !== undefined && { documentNumber: documentNumber.trim() }),
        ...(message !== undefined && { message: message.trim() }),
        ...(status !== undefined && { status }),
      },
      include: {
        analysis: true,
      },
    })

    return NextResponse.json({
      ...updatedPqr,
      createdAt: updatedPqr.createdAt.toISOString(),
      updatedAt: updatedPqr.updatedAt.toISOString(),
      analysis: updatedPqr.analysis
        ? {
            ...updatedPqr.analysis,
            createdAt: updatedPqr.analysis.createdAt.toISOString(),
            updatedAt: updatedPqr.analysis.updatedAt.toISOString(),
          }
        : null,
    })
  } catch (error) {
    console.error('Error in /api/rest/projects/[id]/pqrs PUT:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers })
    const user = ctx.session?.user || ctx.apiKeyUser

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(req.url)
    const pqrId = searchParams.get('pqrId')

    if (!pqrId || typeof pqrId !== 'string') {
      return NextResponse.json(
        { error: 'PQR ID is required' },
        { status: 400 }
      )
    }

    const project = await verifyProjectAccess(
      id,
      user,
      ctx.isGlobalApiKey,
      ctx.isAdminApiKey,
      {
        pqrs: {
          where: { id: pqrId },
        },
      }
    )

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if PQR exists in this project
    const existingPqr = (project as any).pqrs[0]
    if (!existingPqr) {
      return NextResponse.json(
        { error: 'PQR not found in this project' },
        { status: 404 }
      )
    }

    // Delete the PQR (cascade will delete analysis)
    const deletedPqr = await ctx.db.projectPQR.delete({
      where: { id: pqrId },
      include: {
        analysis: true,
      },
    })

    return NextResponse.json({
      ...deletedPqr,
      createdAt: deletedPqr.createdAt.toISOString(),
      updatedAt: deletedPqr.updatedAt.toISOString(),
      analysis: deletedPqr.analysis
        ? {
            ...deletedPqr.analysis,
            createdAt: deletedPqr.analysis.createdAt.toISOString(),
            updatedAt: deletedPqr.analysis.updatedAt.toISOString(),
          }
        : null,
    })
  } catch (error) {
    console.error('Error in /api/rest/projects/[id]/pqrs DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}