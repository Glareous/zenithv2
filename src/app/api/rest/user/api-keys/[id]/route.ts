import { NextRequest, NextResponse } from "next/server";
import { createTRPCContext } from "@src/server/api/trpc";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers });
    const user = ctx.session?.user || ctx.apiKeyUser;
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, isActive } = body;

    // Verify the API key belongs to the user
    const existingKey = await ctx.db.userApiKey.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ error: "Name must be a non-empty string" }, { status: 400 });
      }
      updateData.name = name.trim();
    }
    if (isActive !== undefined) {
      if (typeof isActive !== 'boolean') {
        return NextResponse.json({ error: "isActive must be a boolean" }, { status: 400 });
      }
      updateData.isActive = isActive;
    }

    const updatedKey = await ctx.db.userApiKey.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        keyPreview: true,
        isActive: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      ...updatedKey,
      createdAt: updatedKey.createdAt.toISOString(),
      updatedAt: updatedKey.updatedAt.toISOString(),
      lastUsedAt: updatedKey.lastUsedAt?.toISOString() || null,
      expiresAt: updatedKey.expiresAt?.toISOString() || null,
    });
  } catch (error) {
    console.error("Error in /api/rest/user/api-keys/[id] PUT:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers });
    const user = ctx.session?.user || ctx.apiKeyUser;
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify the API key belongs to the user
    const existingKey = await ctx.db.userApiKey.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    await ctx.db.userApiKey.delete({
      where: { id },
    });

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("Error in /api/rest/user/api-keys/[id] DELETE:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}