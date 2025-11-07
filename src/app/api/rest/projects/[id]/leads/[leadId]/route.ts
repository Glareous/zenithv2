import { NextRequest, NextResponse } from "next/server";
import { createTRPCContext } from "@src/server/api/trpc";

export async function GET(req: NextRequest, { params }: { params: { id: string, leadId: string } }) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers });
    const user = ctx.session?.user || ctx.apiKeyUser;
    
    if (!user) {
      return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
    }

    const { id, leadId } = params;
    let lead;
    
    // If admin API key, can access any lead
    if (ctx.isAdminApiKey) {
      lead = await ctx.db.projectLead.findFirst({
        where: {
          id: leadId,
          projectId: id,
        },
        include: {
          contact: {
            select: {
              id: true,
              name: true,
              email: true,
              companyName: true,
              role: true,
              status: true,
            },
          },
        },
      });
    } else {
      // Regular access - check project access
      lead = await ctx.db.projectLead.findFirst({
        where: {
          id: leadId,
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
          contact: {
            select: {
              id: true,
              name: true,
              email: true,
              companyName: true,
              role: true,
              status: true,
            },
          },
        },
      });
    }

    if (!lead) {
      return NextResponse.json({ error: { message: "Lead not found" } }, { status: 404 });
    }

    return NextResponse.json({
      ...lead,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error in /api/rest/projects/[id]/leads/[leadId] GET:", error);
    return NextResponse.json({ error: { message: "Internal server error" } }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string, leadId: string } }) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers });
    const user = ctx.session?.user || ctx.apiKeyUser;
    
    if (!user) {
      return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
    }

    const { id, leadId } = params;
    const body = await req.json();
    const { name, email, phoneNumber, status, contactId } = body;

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
    });

    if (!project) {
      return NextResponse.json({ error: { message: "Project not found or insufficient permissions" } }, { status: 404 });
    }

    // Verify lead exists and belongs to the project
    const existingLead = await ctx.db.projectLead.findFirst({
      where: {
        id: leadId,
        projectId: id,
      },
    });

    if (!existingLead) {
      return NextResponse.json({ error: { message: "Lead not found" } }, { status: 404 });
    }

    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json({ error: { message: "Name must be a non-empty string" } }, { status: 400 });
    }

    if (email !== undefined && email && !email.includes('@')) {
      return NextResponse.json({ error: { message: "Invalid email format" } }, { status: 400 });
    }

    // Validate contactId if provided
    if (contactId) {
      const contact = await ctx.db.projectContact.findFirst({
        where: {
          id: contactId,
          projectId: id,
        },
      });

      if (!contact) {
        return NextResponse.json({ error: { message: "Contact not found" } }, { status: 404 });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (status !== undefined) updateData.status = status;
    if (contactId !== undefined) updateData.contactId = contactId;

    const updatedLead = await ctx.db.projectLead.update({
      where: { id: leadId },
      data: updateData,
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
    });

    return NextResponse.json({
      ...updatedLead,
      createdAt: updatedLead.createdAt.toISOString(),
      updatedAt: updatedLead.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error in /api/rest/projects/[id]/leads/[leadId] PUT:", error);
    return NextResponse.json({ error: { message: "Internal server error" } }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string, leadId: string } }) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers });
    const user = ctx.session?.user || ctx.apiKeyUser;
    
    if (!user) {
      return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
    }

    const { id, leadId } = params;

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
    });

    if (!project) {
      return NextResponse.json({ error: { message: "Project not found or insufficient permissions" } }, { status: 404 });
    }

    // Verify lead exists and belongs to the project
    const lead = await ctx.db.projectLead.findFirst({
      where: {
        id: leadId,
        projectId: id,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: { message: "Lead not found" } }, { status: 404 });
    }

    // Delete lead files first, then the lead
    await ctx.db.$transaction(async (tx) => {
      await tx.projectLeadFile.deleteMany({
        where: { leadId: leadId },
      });

      await tx.projectLead.delete({
        where: { id: leadId },
      });
    });

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("Error in /api/rest/projects/[id]/leads/[leadId] DELETE:", error);
    return NextResponse.json({ error: { message: "Internal server error" } }, { status: 500 });
  }
}