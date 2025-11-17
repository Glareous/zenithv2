import { createNextRouter } from "@ts-rest/next";
import { apiContract } from "../contracts/api";
import { auth } from "@src/server/auth";
import { db } from "@src/server/db";
import { createHash } from "crypto";

// Export db for use in REST endpoints
export { db };

// Helper function to authenticate user via API key or session
async function authenticateUser(req: any) {
  // First try session authentication
  const session = await auth();
  if (session?.user?.id) {
    return { user: session.user, isGlobalApiKey: false };
  }

  // Try API key authentication
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ak_')) {
    const apiKey = authHeader.replace('Bearer ', '');
    const keyHash = createHash('sha256').update(apiKey).digest('hex');

    const userApiKey = await db.userApiKey.findFirst({
      where: {
        keyHash,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        user: true
      }
    });

    if (userApiKey) {
      // Update last used timestamp in background
      db.userApiKey.update({
        where: { id: userApiKey.id },
        data: { lastUsedAt: new Date() }
      }).catch(() => {}); // Fire and forget

      return { user: userApiKey.user, isGlobalApiKey: userApiKey.isGlobal };
    }
  }

  return null;
}

/**
 * Helper function to verify project access based on user role and API key type
 * @param projectId - The project ID to verify access for
 * @param user - The authenticated user
 * @param isGlobalApiKey - Whether the API key is global
 * @param isAdminApiKey - Whether the API key is admin
 * @param includeOptions - Optional Prisma include options
 * @returns The project if access is granted, null otherwise
 */
async function verifyProjectAccess(
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

export const restRouter = createNextRouter(apiContract, {
  // User endpoints
  getUserProfile: async ({ req }: any) => {
    const auth = await authenticateUser(req);

    if (!auth?.user?.id) {
      return {
        status: 401,
        body: { error: { message: "Unauthorized" } },
      };
    }

    const user = auth.user;

    try {
      const userProfile = await db.user.findUnique({
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
        return {
          status: 404,
          body: { error: { message: "User not found" } },
        };
      }

      return {
        status: 200,
        body: {
          ...userProfile,
          createdAt: userProfile.createdAt.toISOString(),
          updatedAt: userProfile.updatedAt.toISOString(),
        },
      };
    } catch (error) {
      return {
        status: 500,
        body: { error: { message: "Internal server error" } },
      };
    }
  },

  updateUserProfile: async ({ req, body }: any) => {
    const auth = await authenticateUser(req);

    if (!auth?.user?.id) {
      return {
        status: 401,
        body: { error: { message: "Unauthorized" } },
      };
    }

    try {
      const updatedUser = await db.user.update({
        where: { id: auth.user.id },
        data: body,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          username: true,
          image: true,
          updatedAt: true,
          createdAt: true,
        },
      });

      return {
        status: 200,
        body: {
          ...updatedUser,
          createdAt: updatedUser.createdAt.toISOString(),
          updatedAt: updatedUser.updatedAt.toISOString(),
        },
      };
    } catch (error) {
      return {
        status: 500,
        body: { error: { message: "Internal server error" } },
      };
    }
  },

  // Project endpoints
  getProjects: async ({ req }: any) => {
    const auth = await authenticateUser(req);

    if (!auth?.user?.id) {
      return {
        status: 401,
        body: { error: { message: "Unauthorized" } },
      };
    }

    try {
      const memberships = await db.organizationMember.findMany({
        where: { userId: auth.user.id },
        include: {
          organization: {
            include: {
              projects: true,
            },
          },
        },
      });

      const projects = memberships.flatMap((membership) =>
        membership.organization.projects.map(project => ({
          ...project,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
        }))
      );

      return {
        status: 200,
        body: projects,
      };
    } catch (error) {
      return {
        status: 500,
        body: { error: { message: "Internal server error" } },
      };
    }
  },

  createProject: async ({ req, body }: any) => {
    const auth = await authenticateUser(req);

    if (!auth?.user?.id) {
      return {
        status: 401,
        body: { error: { message: "Unauthorized" } },
      };
    }

    try {
      // Verify user has access to the organization
      const membership = await db.organizationMember.findFirst({
        where: {
          userId: auth.user.id,
          organizationId: body.organizationId,
          role: { in: ["OWNER", "ADMIN"] },
        },
      });

      if (!membership) {
        return {
          status: 403,
          body: { error: { message: "Insufficient permissions to create project" } },
        };
      }

      const project = await db.project.create({
        data: {
          name: body.name,
          description: body.description,
          organizationId: body.organizationId,
          createdById: auth.user.id,
        },
      });

      return {
        status: 201,
        body: {
          ...project,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
        },
      };
    } catch (error) {
      return {
        status: 500,
        body: { error: { message: "Internal server error" } },
      };
    }
  },

  getProject: async ({ req, params }: any) => {
    const authResult = await authenticateUser(req);

    if (!authResult?.user?.id) {
      return {
        status: 401,
        body: { error: { message: "Unauthorized" } },
      };
    }

    const user = authResult.user;

    try {
      // Verify project access
      const project = await verifyProjectAccess(params.id, user, authResult.isGlobalApiKey);

      if (!project) {
        return {
          status: 404,
          body: { error: { message: "Project not found" } },
        };
      }

      return {
        status: 200,
        body: {
          ...project,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
        },
      };
    } catch (error) {
      return {
        status: 500,
        body: { error: { message: "Internal server error" } },
      };
    }
  },

  // Product endpoints
  getProjectProducts: async ({ req, params }: any) => {
    const authResult = await authenticateUser(req);

    if (!authResult?.user?.id) {
      return {
        status: 401,
        body: { error: { message: "Unauthorized" } },
      };
    }

    const user = authResult.user;

    try {
      // Verify project access
      const projectAccess = await verifyProjectAccess(params.id, user, authResult.isGlobalApiKey);

      if (!projectAccess) {
        return {
          status: 404,
          body: { error: { message: "Project not found" } },
        };
      }

      const project = await db.project.findUnique({
        where: { id: params.id },
        include: {
          products: true,
        },
      });

      const products = project?.products.map(product => ({
        ...product,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      })) || [];

      return {
        status: 200,
        body: products,
      };
    } catch (error) {
      return {
        status: 500,
        body: { error: { message: "Internal server error" } },
      };
    }
  },

  createProjectProduct: async ({ req, params, body }: any) => {
    const authResult = await authenticateUser(req);

    if (!authResult?.user?.id) {
      return {
        status: 401,
        body: { error: { message: "Unauthorized" } },
      };
    }

    const user = authResult.user;

    try {
      // Verify project access (works for both normal users and SUPERADMIN with global API key)
      const project = await verifyProjectAccess(params.id, user, authResult.isGlobalApiKey);

      if (!project) {
        return {
          status: 404,
          body: { error: { message: "Project not found" } },
        };
      }

      const product = await db.projectProduct.create({
        data: {
          name: body.name,
          description: body.description,
          price: body.price,
          imageUrl: body.imageUrl,
          projectId: params.id,
          createdById: user.id,
        },
      });

      return {
        status: 201,
        body: {
          ...product,
          createdAt: product.createdAt.toISOString(),
          updatedAt: product.updatedAt.toISOString(),
        },
      };
    } catch (error) {
      return {
        status: 500,
        body: { error: { message: "Internal server error" } },
      };
    }
  },

  // Customer endpoints
  getProjectCustomers: async ({ req, params }: any) => {
    const authResult = await authenticateUser(req);

    if (!authResult?.user?.id) {
      return {
        status: 401,
        body: { error: { message: "Unauthorized" } },
      };
    }

    const user = authResult.user;

    try {
      // Verify project access
      const projectAccess = await verifyProjectAccess(params.id, user, authResult.isGlobalApiKey);

      if (!projectAccess) {
        return {
          status: 404,
          body: { error: { message: "Project not found" } },
        };
      }

      const project = await db.project.findUnique({
        where: { id: params.id },
        include: {
          customers: true,
        },
      });

      const customers = project?.customers.map(customer => ({
        ...customer,
        createdAt: customer.createdAt.toISOString(),
        updatedAt: customer.updatedAt.toISOString(),
      })) || [];

      return {
        status: 200,
        body: customers,
      };
    } catch (error) {
      return {
        status: 500,
        body: { error: { message: "Internal server error" } },
      };
    }
  },

  // Agent endpoints
  getProjectAgents: async ({ req, params }: any) => {
    const authResult = await authenticateUser(req);

    if (!authResult?.user?.id) {
      return {
        status: 401,
        body: { error: { message: "Unauthorized" } },
      };
    }

    const user = authResult.user;

    try {
      // Verify project access
      const projectAccess = await verifyProjectAccess(params.id, user, authResult.isGlobalApiKey);

      if (!projectAccess) {
        return {
          status: 404,
          body: { error: { message: "Project not found" } },
        };
      }

      const project = await db.project.findUnique({
        where: { id: params.id },
        include: {
          agents: true,
        },
      });

      const agents = project?.agents.map(agent => ({
        ...agent,
        createdAt: agent.createdAt.toISOString(),
        updatedAt: agent.updatedAt.toISOString(),
      })) || [];

      return {
        status: 200,
        body: agents,
      };
    } catch (error) {
      return {
        status: 500,
        body: { error: { message: "Internal server error" } },
      };
    }
  },
} as any);