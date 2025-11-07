import { createNextRouter } from "@ts-rest/next";
import { apiContract } from "../contracts/api";
import { auth } from "@src/server/auth";
import { db } from "@src/server/db";
import { createHash } from "crypto";

// Helper function to authenticate user via API key or session
async function authenticateUser(req: any) {
  // First try session authentication
  const session = await auth();
  if (session?.user?.id) {
    return session.user;
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
      
      return userApiKey.user;
    }
  }

  return null;
}

export const restRouter = createNextRouter(apiContract, {
  // User endpoints
  getUserProfile: async ({ req }: any) => {
    const user = await authenticateUser(req);
    
    if (!user?.id) {
      return {
        status: 401,
        body: { error: { message: "Unauthorized" } },
      };
    }

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
    const user = await authenticateUser(req);
    
    if (!user?.id) {
      return {
        status: 401,
        body: { error: { message: "Unauthorized" } },
      };
    }

    try {
      const updatedUser = await db.user.update({
        where: { id: user.id },
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
    const user = await authenticateUser(req);
    
    if (!user?.id) {
      return {
        status: 401,
        body: { error: { message: "Unauthorized" } },
      };
    }

    try {
      const memberships = await db.organizationMember.findMany({
        where: { userId: user.id },
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
    const user = await authenticateUser(req);
    
    if (!user?.id) {
      return {
        status: 401,
        body: { error: { message: "Unauthorized" } },
      };
    }

    try {
      // Verify user has access to the organization
      const membership = await db.organizationMember.findFirst({
        where: {
          userId: user.id,
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
          createdById: user.id,
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
    const user = await authenticateUser(req);
    
    if (!user?.id) {
      return {
        status: 401,
        body: { error: { message: "Unauthorized" } },
      };
    }

    try {
      const project = await db.project.findFirst({
        where: {
          id: params.id,
          organization: {
            members: {
              some: { userId: user.id },
            },
          },
        },
      });

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
    const user = await authenticateUser(req);
    
    if (!user?.id) {
      return {
        status: 401,
        body: { error: { message: "Unauthorized" } },
      };
    }

    try {
      const project = await db.project.findFirst({
        where: {
          id: params.id,
          organization: {
            members: {
              some: { userId: user.id },
            },
          },
        },
        include: {
          products: true,
        },
      });

      if (!project) {
        return {
          status: 404,
          body: { error: { message: "Project not found" } },
        };
      }

      const products = project.products.map(product => ({
        ...product,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      }));

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
    const user = await authenticateUser(req);
    
    if (!user?.id) {
      return {
        status: 401,
        body: { error: { message: "Unauthorized" } },
      };
    }

    try {
      // Verify user has access to the project
      const project = await db.project.findFirst({
        where: {
          id: params.id,
          organization: {
            members: {
              some: { userId: user.id },
            },
          },
        },
      });

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
    const user = await authenticateUser(req);
    
    if (!user?.id) {
      return {
        status: 401,
        body: { error: { message: "Unauthorized" } },
      };
    }

    try {
      const project = await db.project.findFirst({
        where: {
          id: params.id,
          organization: {
            members: {
              some: { userId: user.id },
            },
          },
        },
        include: {
          customers: true,
        },
      });

      if (!project) {
        return {
          status: 404,
          body: { error: { message: "Project not found" } },
        };
      }

      const customers = project.customers.map(customer => ({
        ...customer,
        createdAt: customer.createdAt.toISOString(),
        updatedAt: customer.updatedAt.toISOString(),
      }));

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
    const user = await authenticateUser(req);
    
    if (!user?.id) {
      return {
        status: 401,
        body: { error: { message: "Unauthorized" } },
      };
    }

    try {
      const project = await db.project.findFirst({
        where: {
          id: params.id,
          organization: {
            members: {
              some: { userId: user.id },
            },
          },
        },
        include: {
          agents: true,
        },
      });

      if (!project) {
        return {
          status: 404,
          body: { error: { message: "Project not found" } },
        };
      }

      const agents = project.agents.map(agent => ({
        ...agent,
        createdAt: agent.createdAt.toISOString(),
        updatedAt: agent.updatedAt.toISOString(),
      }));

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