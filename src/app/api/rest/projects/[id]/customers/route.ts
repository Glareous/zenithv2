import { NextRequest, NextResponse } from "next/server";
import { createTRPCContext } from "@src/server/api/trpc";
import { verifyProjectAccess } from "@src/server/api/rest/helpers";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers });
    const user = ctx.session?.user || ctx.apiKeyUser;
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const project = await verifyProjectAccess(
      id,
      user,
      ctx.isGlobalApiKey,
      ctx.isAdminApiKey,
      {
        customers: {
          orderBy: { createdAt: "desc" },
        },
      }
    );

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const customers = (project as any).customers.map((customer: any) => ({
      ...customer,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    }));

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error in /api/rest/projects/[id]/customers GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers });
    const user = ctx.session?.user || ctx.apiKeyUser;
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, email, phoneNumber, location, subscriber = false, gender, role, website, origin } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (email && (typeof email !== 'string' || !email.includes('@'))) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
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
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const customer = await ctx.db.projectCustomer.create({
      data: {
        name: name.trim(),
        email,
        phoneNumber,
        location,
        subscriber,
        gender,
        role,
        website,
        origin: origin || 'FROM_CUSTOMER',
        projectId: id,
        createdById: user.id,
      },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
        files: {
          where: {
            fileType: 'IMAGE',
          },
          take: 1,
        },
      },
    });

    return NextResponse.json({
      ...customer,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error("Error in /api/rest/projects/[id]/customers POST:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}