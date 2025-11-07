import { NextRequest, NextResponse } from "next/server";
import { createTRPCContext } from "@src/server/api/trpc";

export async function GET(req: NextRequest, { params }: { params: { id: string, contactId: string } }) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers });
    const user = ctx.session?.user || ctx.apiKeyUser;
    
    if (!user) {
      return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
    }

    const { id, contactId } = params;
    let contact;
    
    // If admin API key, can access any contact
    if (ctx.isAdminApiKey) {
      contact = await ctx.db.projectContact.findFirst({
        where: {
          id: contactId,
          projectId: id,
        },
        include: {
          leads: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });
    } else {
      // Regular access - check project access
      contact = await ctx.db.projectContact.findFirst({
        where: {
          id: contactId,
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
          leads: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });
    }

    if (!contact) {
      return NextResponse.json({ error: { message: "Contact not found" } }, { status: 404 });
    }

    return NextResponse.json({
      ...contact,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error in /api/rest/projects/[id]/contacts/[contactId] GET:", error);
    return NextResponse.json({ error: { message: "Internal server error" } }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string, contactId: string } }) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers });
    const user = ctx.session?.user || ctx.apiKeyUser;
    
    if (!user) {
      return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
    }

    const { id, contactId } = params;
    const body = await req.json();
    const { name, companyName, role, email, phoneNumber, website, status, subscriber, gender, location } = body;

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

    // Verify contact exists and belongs to the project
    const existingContact = await ctx.db.projectContact.findFirst({
      where: {
        id: contactId,
        projectId: id,
      },
    });

    if (!existingContact) {
      return NextResponse.json({ error: { message: "Contact not found" } }, { status: 404 });
    }

    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json({ error: { message: "Name must be a non-empty string" } }, { status: 400 });
    }

    if (email !== undefined && email && !email.includes('@')) {
      return NextResponse.json({ error: { message: "Invalid email format" } }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (companyName !== undefined) updateData.companyName = companyName;
    if (role !== undefined) updateData.role = role;
    if (email !== undefined) updateData.email = email;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (website !== undefined) updateData.website = website;
    if (status !== undefined) updateData.status = status;
    if (subscriber !== undefined) updateData.subscriber = subscriber;
    if (gender !== undefined) updateData.gender = gender;
    if (location !== undefined) updateData.location = location;

    // Update contact and related lead in a transaction
    const result = await ctx.db.$transaction(async (tx) => {
      // Update the contact
      const updatedContact = await tx.projectContact.update({
        where: { id: contactId },
        data: updateData,
        include: {
          leads: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

      // Find and update the related lead
      const relatedLead = await tx.projectLead.findFirst({
        where: {
          contactId: contactId,
          projectId: id,
        },
      });

      if (relatedLead) {
        // Update lead data
        const leadUpdateData: any = {};
        if (name !== undefined) leadUpdateData.name = name.trim();
        if (email !== undefined) leadUpdateData.email = email;
        if (phoneNumber !== undefined) leadUpdateData.phoneNumber = phoneNumber;

        await tx.projectLead.update({
          where: { id: relatedLead.id },
          data: leadUpdateData,
        });
      }

      return updatedContact;
    });

    return NextResponse.json({
      ...result,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error in /api/rest/projects/[id]/contacts/[contactId] PUT:", error);
    return NextResponse.json({ error: { message: "Internal server error" } }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string, contactId: string } }) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers });
    const user = ctx.session?.user || ctx.apiKeyUser;
    
    if (!user) {
      return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
    }

    const { id, contactId } = params;

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

    // Verify contact exists and belongs to the project
    const contact = await ctx.db.projectContact.findFirst({
      where: {
        id: contactId,
        projectId: id,
      },
    });

    if (!contact) {
      return NextResponse.json({ error: { message: "Contact not found" } }, { status: 404 });
    }

    // Delete contact and related lead in a transaction
    await ctx.db.$transaction(async (tx) => {
      // Find and delete the related lead first
      const relatedLead = await tx.projectLead.findFirst({
        where: {
          contactId: contactId,
          projectId: id,
        },
      });

      if (relatedLead) {
        // Delete lead files first
        await tx.projectLeadFile.deleteMany({
          where: { leadId: relatedLead.id },
        });

        // Delete the lead
        await tx.projectLead.delete({
          where: { id: relatedLead.id },
        });
      }

      // Delete contact files first
      await tx.projectContactFile.deleteMany({
        where: { contactId: contactId },
      });

      // Delete the contact
      await tx.projectContact.delete({
        where: { id: contactId },
      });
    });

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("Error in /api/rest/projects/[id]/contacts/[contactId] DELETE:", error);
    return NextResponse.json({ error: { message: "Internal server error" } }, { status: 500 });
  }
}