import { NextRequest, NextResponse } from "next/server";
import { createTRPCContext } from "@src/server/api/trpc";
import { appRouter } from "@src/server/api/root";

export async function GET(req: NextRequest) {
  try {
    // Create tRPC context with the request headers
    const ctx = await createTRPCContext({ headers: req.headers });
    
    // Check if user is authenticated via API key or session
    const user = ctx.session?.user || ctx.apiKeyUser;
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user profile data
    const userProfile = await ctx.db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Error in /api/rest/user/profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers });
    const user = ctx.session?.user || ctx.apiKeyUser;
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { firstName, lastName, email } = body;

    const updatedUser = await ctx.db.user.update({
      where: { id: user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        image: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}