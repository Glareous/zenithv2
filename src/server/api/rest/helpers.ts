import { db } from "@src/server/db";

/**
 * Helper function to verify project access based on user role and API key type
 * @param projectId - The project ID to verify access for
 * @param user - The authenticated user
 * @param isGlobalApiKey - Whether the API key is global
 * @param isAdminApiKey - Whether the API key is admin
 * @param includeOptions - Optional Prisma include options
 * @returns The project if access is granted, null otherwise
 */
export async function verifyProjectAccess(
  projectId: string,
  user: any,
  isGlobalApiKey: boolean,
  isAdminApiKey: boolean = false,
  includeOptions?: any
) {
  const isSuperAdmin = user.role === 'SUPERADMIN';

  // SUPERADMIN with global API key can access any project
  if (isGlobalApiKey && isSuperAdmin) {
    return await db.project.findUnique({
      where: { id: projectId },
      ...(includeOptions && { include: includeOptions }),
    });
  }

  // Admin API key: Solo proyectos donde es OWNER o ProjectMember
  if (isAdminApiKey) {
    const [ownedProject, memberProject, createdProject] = await Promise.all([
      // Proyectos donde es OWNER de la organización
      db.project.findFirst({
        where: {
          id: projectId,
          organization: {
            ownerId: user.id,
          },
        },
        ...(includeOptions && { include: includeOptions }),
      }),
      // Proyectos específicos donde es ProjectMember
      db.projectMember.findFirst({
        where: {
          projectId: projectId,
          userId: user.id,
        },
        include: {
          project: includeOptions
            ? {
                include: includeOptions,
              }
            : true,
        },
      }),
      // Proyectos que creó (incluso en otras organizaciones)
      db.project.findFirst({
        where: {
          id: projectId,
          createdById: user.id,
        },
        ...(includeOptions && { include: includeOptions }),
      }),
    ]);

    return ownedProject || memberProject?.project || createdProject;
  }

  // Regular access - verify user has access to the project
  return await db.project.findFirst({
    where: {
      id: projectId,
      organization: {
        members: {
          some: { userId: user.id },
        },
      },
    },
    ...(includeOptions && { include: includeOptions }),
  });
}
