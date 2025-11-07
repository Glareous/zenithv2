import { NextRequest, NextResponse } from 'next/server'

import { createTRPCContext } from '@src/server/api/trpc'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; pqrId: string } }
) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers })
    const user = ctx.session?.user || ctx.apiKeyUser

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, pqrId } = await params

    let project

    if (ctx.isAdminApiKey) {
      // Admin API key: Solo proyectos donde es OWNER o ProjectMember
      const [ownedProject, memberProject, createdProject] = await Promise.all([
        // Proyectos donde es OWNER de la organización
        ctx.db.project.findFirst({
          where: {
            id,
            organization: {
              ownerId: user.id,
            },
          },
          include: {
            pqrs: {
              where: { id: pqrId },
              include: {
                analysis: true,
              },
            },
          },
        }),
        // Proyectos específicos donde es ProjectMember
        ctx.db.projectMember.findFirst({
          where: {
            projectId: id,
            userId: user.id,
          },
          include: {
            project: {
              include: {
                pqrs: {
                  where: { id: pqrId },
                  include: {
                    analysis: true,
                  },
                },
              },
            },
          },
        }),
        // Proyectos que creó (incluso en otras organizaciones)
        ctx.db.project.findFirst({
          where: {
            id,
            createdById: user.id,
          },
          include: {
            pqrs: {
              where: { id: pqrId },
              include: {
                analysis: true,
              },
            },
          },
        }),
      ])

      project = ownedProject || memberProject?.project || createdProject
    } else {
      // Regular access - solo proyectos propios (OWNER)
      project = await ctx.db.project.findFirst({
        where: {
          id,
          organization: {
            ownerId: user.id,
          },
        },
        include: {
          pqrs: {
            where: { id: pqrId },
            include: {
              analysis: true,
            },
          },
        },
      })
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const pqr = project.pqrs[0]
    if (!pqr) {
      return NextResponse.json(
        { error: 'PQR not found in this project' },
        { status: 404 }
      )
    }

    return NextResponse.json({
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
    })
  } catch (error) {
    console.error('Error in /api/rest/projects/[id]/pqrs/[pqrId] GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; pqrId: string } }
) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers })
    const user = ctx.session?.user || ctx.apiKeyUser

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, pqrId } = await params
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

    let project

    if (ctx.isAdminApiKey) {
      // Admin API key: Solo proyectos donde es OWNER o ProjectMember
      const [ownedProject, memberProject, createdProject] = await Promise.all([
        // Proyectos donde es OWNER de la organización
        ctx.db.project.findFirst({
          where: {
            id,
            organization: {
              ownerId: user.id,
            },
          },
          include: {
            pqrs: {
              where: { id: pqrId },
            },
          },
        }),
        // Proyectos específicos donde es ProjectMember
        ctx.db.projectMember.findFirst({
          where: {
            projectId: id,
            userId: user.id,
          },
          include: {
            project: {
              include: {
                pqrs: {
                  where: { id: pqrId },
                },
              },
            },
          },
        }),
        // Proyectos que creó (incluso en otras organizaciones)
        ctx.db.project.findFirst({
          where: {
            id,
            createdById: user.id,
          },
          include: {
            pqrs: {
              where: { id: pqrId },
            },
          },
        }),
      ])

      project = ownedProject || memberProject?.project || createdProject
    } else {
      // Regular access - solo proyectos propios (OWNER)
      project = await ctx.db.project.findFirst({
        where: {
          id,
          organization: {
            ownerId: user.id,
          },
        },
        include: {
          pqrs: {
            where: { id: pqrId },
          },
        },
      })
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if PQR exists in this project
    const existingPqr = project.pqrs[0]
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
        ...(documentType !== undefined && {
          documentType: documentType.trim(),
        }),
        ...(documentNumber !== undefined && {
          documentNumber: documentNumber.trim(),
        }),
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
    console.error('Error in /api/rest/projects/[id]/pqrs/[pqrId] PUT:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; pqrId: string } }
) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers })
    const user = ctx.session?.user || ctx.apiKeyUser

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, pqrId } = await params

    let project

    if (ctx.isAdminApiKey) {
      // Admin API key: Solo proyectos donde es OWNER o ProjectMember
      const [ownedProject, memberProject, createdProject] = await Promise.all([
        // Proyectos donde es OWNER de la organización
        ctx.db.project.findFirst({
          where: {
            id,
            organization: {
              ownerId: user.id,
            },
          },
          include: {
            pqrs: {
              where: { id: pqrId },
            },
          },
        }),
        // Proyectos específicos donde es ProjectMember
        ctx.db.projectMember.findFirst({
          where: {
            projectId: id,
            userId: user.id,
          },
          include: {
            project: {
              include: {
                pqrs: {
                  where: { id: pqrId },
                },
              },
            },
          },
        }),
        // Proyectos que creó (incluso en otras organizaciones)
        ctx.db.project.findFirst({
          where: {
            id,
            createdById: user.id,
          },
          include: {
            pqrs: {
              where: { id: pqrId },
            },
          },
        }),
      ])

      project = ownedProject || memberProject?.project || createdProject
    } else {
      // Regular access - solo proyectos propios (OWNER)
      project = await ctx.db.project.findFirst({
        where: {
          id,
          organization: {
            ownerId: user.id,
          },
        },
        include: {
          pqrs: {
            where: { id: pqrId },
          },
        },
      })
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if PQR exists in this project
    const existingPqr = project.pqrs[0]
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
    console.error(
      'Error in /api/rest/projects/[id]/pqrs/[pqrId] DELETE:',
      error
    )
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
