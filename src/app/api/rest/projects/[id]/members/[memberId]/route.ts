import { NextRequest, NextResponse } from "next/server";
import { createTRPCContext } from "@src/server/api/trpc";
import { ProjectRole } from "@prisma/client";

export async function DELETE(req: NextRequest, { params }: { params: { id: string, memberId: string } }) {
  try {
    const ctx = await createTRPCContext({ headers: req.headers });
    const user = ctx.session?.user || ctx.apiKeyUser;
    
    if (!user) {
      return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
    }

    const { id, memberId } = params;

    // Get the member to check project access
    const member = await ctx.db.projectMember.findUnique({
      where: { id: memberId },
      include: { project: true },
    });

    if (!member) {
      return NextResponse.json(
        { error: { message: "Project member not found" } }, 
        { status: 404 }
      );
    }

    // Verify member belongs to the correct project
    if (member.projectId !== id) {
      return NextResponse.json(
        { error: { message: "Project member not found" } }, 
        { status: 404 }
      );
    }

    // Check if current user is admin of the project or removing themselves
    const userProjectRole = await ctx.db.projectMember.findFirst({
      where: {
        projectId: member.projectId,
        userId: user.id,
      },
    });

    if (!userProjectRole) {
      return NextResponse.json(
        { error: { message: "You don't have access to this project" } }, 
        { status: 403 }
      );
    }

    // Can remove if: user is admin OR user is removing themselves
    const canRemove =
      userProjectRole.role === ProjectRole.ADMIN ||
      member.userId === user.id;

    if (!canRemove) {
      return NextResponse.json(
        { 
          error: { 
            message: "Only project admins can remove members, or users can remove themselves" 
          } 
        }, 
        { status: 403 }
      );
    }

    // Delete the project member
    await ctx.db.projectMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("Error in /api/rest/projects/[id]/members/[memberId] DELETE:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } }, 
      { status: 500 }
    );
  }
}