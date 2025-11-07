import { NextRequest, NextResponse } from "next/server";
import { createTRPCContext } from "@src/server/api/trpc";

export async function GET(req: NextRequest, { params }: { params: { id: string, dealId: string } }) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers });
    const user = ctx.session?.user || ctx.apiKeyUser;
    
    if (!user) {
      return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
    }

    const { id, dealId } = params;
    let deal;
    
    // If admin API key, can access any deal
    if (ctx.isAdminApiKey) {
      deal = await ctx.db.projectDeal.findFirst({
        where: {
          id: dealId,
          projectId: id,
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
      });
    } else {
      // Regular access - check project access
      deal = await ctx.db.projectDeal.findFirst({
        where: {
          id: dealId,
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
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }

    if (!deal) {
      return NextResponse.json({ error: { message: "Deal not found" } }, { status: 404 });
    }

    return NextResponse.json({
      ...deal,
      dealDate: deal.dealDate?.toISOString() || null,
      createdAt: deal.createdAt.toISOString(),
      updatedAt: deal.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error in /api/rest/projects/[id]/deals/[dealId] GET:", error);
    return NextResponse.json({ error: { message: "Internal server error" } }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string, dealId: string } }) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers });
    const user = ctx.session?.user || ctx.apiKeyUser;
    
    if (!user) {
      return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
    }

    const { id, dealId } = params;
    const body = await req.json();
    const { name, dealDate, isActive, isExpired, revenue, customerId } = body;

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

    // Verify deal exists and belongs to the project
    const existingDeal = await ctx.db.projectDeal.findFirst({
      where: {
        id: dealId,
        projectId: id,
      },
    });

    if (!existingDeal) {
      return NextResponse.json({ error: { message: "Deal not found" } }, { status: 404 });
    }

    // If customerId is provided, verify customer exists and belongs to the project
    let customer;
    if (customerId) {
      customer = await ctx.db.projectCustomer.findFirst({
        where: {
          id: customerId,
          projectId: id,
        },
      });

      if (!customer) {
        return NextResponse.json({ error: { message: "Customer not found" } }, { status: 404 });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (dealDate !== undefined) updateData.dealDate = dealDate ? new Date(dealDate) : null;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isExpired !== undefined) updateData.isExpired = isExpired;
    if (revenue !== undefined) updateData.revenue = revenue;
    if (customerId !== undefined) {
      updateData.customerId = customerId;
      // Update name to customer name if customer changed
      if (customer) {
        updateData.name = customer.name;
      }
    }

    const updatedDeal = await ctx.db.projectDeal.update({
      where: { id: dealId },
      data: updateData,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...updatedDeal,
      dealDate: updatedDeal.dealDate?.toISOString() || null,
      createdAt: updatedDeal.createdAt.toISOString(),
      updatedAt: updatedDeal.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error in /api/rest/projects/[id]/deals/[dealId] PUT:", error);
    return NextResponse.json({ error: { message: "Internal server error" } }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string, dealId: string } }) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers });
    const user = ctx.session?.user || ctx.apiKeyUser;
    
    if (!user) {
      return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
    }

    const { id, dealId } = params;

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

    // Verify deal exists and belongs to the project
    const deal = await ctx.db.projectDeal.findFirst({
      where: {
        id: dealId,
        projectId: id,
      },
      include: {
        dealMessage: true,
      },
    });

    if (!deal) {
      return NextResponse.json({ error: { message: "Deal not found" } }, { status: 404 });
    }

    // Delete deal and related deal message in a transaction
    await ctx.db.$transaction(async (tx) => {
      if (deal.dealMessage) {
        await tx.projectDealMessage.delete({
          where: { dealId: dealId },
        });
      }

      await tx.projectDeal.delete({
        where: { id: dealId },
      });
    });

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("Error in /api/rest/projects/[id]/deals/[dealId] DELETE:", error);
    return NextResponse.json({ error: { message: "Internal server error" } }, { status: 500 });
  }
}