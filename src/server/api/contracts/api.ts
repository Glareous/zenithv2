import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

// User schemas
const UserProfileSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().nullable(),
  username: z.string(),
  image: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const UpdateUserProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
});

const CreateApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  expiresAt: z.string().datetime().optional(),
});

const UpdateApiKeySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
});

// Project schemas
const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  logoUrl: z.string().nullable(),
  status: z.enum(["ACTIVE", "CREATED", "COMPLETED"]),
  revenue: z.number().nullable(),
  organizationId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  organizationId: z.string(),
});

// Product schemas
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number().nullable(),
  imageUrl: z.string().nullable(),
  isActive: z.boolean(),
  projectId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreateProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  imageUrl: z.string().url().optional(),
});

const UpdateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  imageUrl: z.string().url().optional(),
  categoryId: z.string().optional(),
  isActive: z.boolean().optional(),
});

const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  logoUrl: z.string().url().optional(),
  status: z.enum(["ACTIVE", "CREATED", "COMPLETED"]).optional(),
});

const AddProjectMemberSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

// Customer schemas
const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  subscriber: z.boolean(),
  location: z.string().nullable(),
  isActive: z.boolean(),
  projectId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreateCustomerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  location: z.string().optional(),
  subscriber: z.boolean().default(false),
  gender: z.string().optional(),
  role: z.string().optional(),
  website: z.string().url().optional(),
  origin: z.string().optional(),
});

const UpdateCustomerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  location: z.string().optional(),
  subscriber: z.boolean().optional(),
  gender: z.string().optional(),
  role: z.string().optional(),
  website: z.string().url().optional(),
  isActive: z.boolean().optional(),
  origin: z.string().optional(),
});

// Agent schemas
const AgentSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  type: z.enum(["SALES", "NFO", "CUSTOMER_SERVICE", "LOGISTICS", "CRM"]),
  isActive: z.boolean(),
  systemInstructions: z.string().nullable(),
  projectId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreateAgentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(["SALES", "NFO", "CUSTOMER_SERVICE", "LOGISTICS", "CRM"]),
  systemInstructions: z.string().optional(),
});

// Deal schemas
const DealSchema = z.object({
  id: z.string(),
  name: z.string(),
  dealDate: z.string().nullable(),
  isActive: z.boolean(),
  isExpired: z.boolean(),
  revenue: z.number().nullable(),
  customerId: z.string(),
  projectId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreateDealSchema = z.object({
  dealDate: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
  isExpired: z.boolean().default(true),
  revenue: z.number().positive().optional(),
  customerId: z.string().cuid(),
});

const UpdateDealSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  dealDate: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
  isExpired: z.boolean().optional(),
  revenue: z.number().positive().optional(),
  customerId: z.string().cuid().optional(),
});

// Contact schemas
const ContactSchema = z.object({
  id: z.string(),
  name: z.string(),
  companyName: z.string().nullable(),
  role: z.string().nullable(),
  email: z.string(),
  phoneNumber: z.string(),
  website: z.string().nullable(),
  status: z.enum(["CONTACT", "CUSTOMER", "LEAD"]),
  subscriber: z.boolean(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).nullable(),
  location: z.string().nullable(),
  projectId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreateContactSchema = z.object({
  name: z.string().min(1).max(100),
  companyName: z.string().optional(),
  role: z.string().optional(),
  email: z.string().email(),
  phoneNumber: z.string().min(1),
  website: z.string().url().optional(),
  status: z.enum(["CONTACT", "CUSTOMER", "LEAD"]).default("CONTACT"),
  subscriber: z.boolean().default(false),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  location: z.string().optional(),
});

const UpdateContactSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  companyName: z.string().optional(),
  role: z.string().optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().min(1).optional(),
  website: z.string().url().optional(),
  status: z.enum(["CONTACT", "CUSTOMER", "LEAD"]).optional(),
  subscriber: z.boolean().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  location: z.string().optional(),
});

// Lead schemas
const LeadSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  status: z.enum(["NEW", "HOT", "PENDING", "LOST"]),
  contactId: z.string().nullable(),
  projectId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreateLeadSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phoneNumber: z.string().min(1),
  status: z.enum(["NEW", "HOT", "PENDING", "LOST"]).default("NEW"),
  contactId: z.string().cuid().optional(),
});

const UpdateLeadSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().min(1).optional(),
  status: z.enum(["NEW", "HOT", "PENDING", "LOST"]).optional(),
  contactId: z.string().cuid().optional(),
});

// Category schemas
const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  type: z.enum(["PRODUCT", "SERVICE"]),
  isActive: z.boolean(),
  isDefault: z.boolean(),
  projectId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreateCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  type: z.enum(["PRODUCT", "SERVICE"]),
  isActive: z.boolean().default(true),
});

const UpdateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  type: z.enum(["PRODUCT", "SERVICE"]).optional(),
  isActive: z.boolean().optional(),
});

// Warehouse schemas
const WarehouseSchema = z.object({
  id: z.string(),
  warehouseId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  isDefault: z.boolean(),
  projectId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreateWarehouseSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

const UpdateWarehouseSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

// PQR schemas
const PQRSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  email: z.string(),
  city: z.string(),
  documentType: z.string(),
  documentNumber: z.string(),
  message: z.string(),
  status: z.enum(["PROCESSING", "COMPLETED"]),
  projectId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreatePQRSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().min(1),
  email: z.string().email(),
  city: z.string().min(1).max(100),
  documentType: z.enum(["CC", "CE", "PASSPORT", "NIT"]),
  documentNumber: z.string().min(1),
  message: z.string().min(1),
  status: z.enum(["PROCESSING", "COMPLETED"]).default("PROCESSING"),
});

const UpdatePQRSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().email().optional(),
  city: z.string().min(1).max(100).optional(),
  documentType: z.enum(["CC", "CE", "PASSPORT", "NIT"]).optional(),
  documentNumber: z.string().min(1).optional(),
  message: z.string().min(1).optional(),
  status: z.enum(["PROCESSING", "COMPLETED"]).optional(),
});

// Error response schema
const ErrorSchema = z.object({
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
  }),
});

export const apiContract = c.router({
  // User endpoints
  getUserProfile: {
    method: "GET",
    path: "/api/rest/user/profile",
    responses: {
      200: UserProfileSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Get user profile",
    description: "Retrieve the authenticated user's profile information",
  },
  updateUserProfile: {
    method: "PUT",
    path: "/api/rest/user/profile",
    body: UpdateUserProfileSchema,
    responses: {
      200: UserProfileSchema,
      400: ErrorSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Update user profile",
    description: "Update the authenticated user's profile information",
  },

  // API Key endpoints
  getUserApiKeys: {
    method: "GET",
    path: "/api/rest/user/api-keys",
    responses: {
      200: z.array(z.object({
        id: z.string(),
        name: z.string(),
        keyPreview: z.string(),
        isActive: z.boolean(),
        lastUsedAt: z.string().nullable(),
        expiresAt: z.string().nullable(),
        createdAt: z.string(),
        updatedAt: z.string(),
      })),
      401: ErrorSchema,
    },
    summary: "List user API keys",
    description: "Get all API keys for the authenticated user",
  },
  createUserApiKey: {
    method: "POST",
    path: "/api/rest/user/api-keys",
    body: CreateApiKeySchema,
    responses: {
      201: z.object({
        id: z.string(),
        name: z.string(),
        apiKey: z.string(),
        keyPreview: z.string(),
        isActive: z.boolean(),
        lastUsedAt: z.string().nullable(),
        expiresAt: z.string().nullable(),
        createdAt: z.string(),
        updatedAt: z.string(),
      }),
      400: ErrorSchema,
      401: ErrorSchema,
    },
    summary: "Create API key",
    description: "Create a new API key for the authenticated user",
  },
  updateUserApiKey: {
    method: "PUT",
    path: "/api/rest/user/api-keys/:id",
    pathParams: z.object({
      id: z.string(),
    }),
    body: UpdateApiKeySchema,
    responses: {
      200: z.object({
        id: z.string(),
        name: z.string(),
        keyPreview: z.string(),
        isActive: z.boolean(),
        lastUsedAt: z.string().nullable(),
        expiresAt: z.string().nullable(),
        createdAt: z.string(),
        updatedAt: z.string(),
      }),
      400: ErrorSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Update API key",
    description: "Update an existing API key",
  },
  deleteUserApiKey: {
    method: "DELETE",
    path: "/api/rest/user/api-keys/:id",
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      204: z.null(),
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Delete API key",
    description: "Delete an existing API key",
  },

  // Project endpoints
  getProjects: {
    method: "GET",
    path: "/api/rest/projects",
    responses: {
      200: z.array(ProjectSchema),
      401: ErrorSchema,
    },
    summary: "List user projects",
    description: "Get all projects accessible to the authenticated user. Admin API keys return ALL projects in the system.",
  },
  createProject: {
    method: "POST",
    path: "/api/rest/projects",
    body: CreateProjectSchema,
    responses: {
      201: ProjectSchema,
      400: ErrorSchema,
      401: ErrorSchema,
      403: ErrorSchema,
    },
    summary: "Create new project",
    description: "Create a new project in the user's organization",
  },
  getProject: {
    method: "GET",
    path: "/api/rest/projects/:id",
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: ProjectSchema.extend({
        organization: z.object({
          id: z.string(),
          name: z.string(),
        }),
        createdBy: z.object({
          id: z.string(),
          firstName: z.string(),
          lastName: z.string(),
          email: z.string().nullable(),
        }),
        _count: z.object({
          agents: z.number(),
          products: z.number(),
          customers: z.number(),
          orders: z.number(),
        }),
      }),
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Get project details",
    description: "Get detailed information about a specific project. Admin API keys can access any project.",
  },
  updateProject: {
    method: "PUT",
    path: "/api/rest/projects/:id",
    pathParams: z.object({
      id: z.string(),
    }),
    body: UpdateProjectSchema,
    responses: {
      200: ProjectSchema,
      400: ErrorSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Update project",
    description: "Update an existing project",
  },
  deleteProject: {
    method: "DELETE",
    path: "/api/rest/projects/:id",
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      204: z.null(),
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Delete project",
    description: "Delete an existing project",
  },

  // Project members
  getProjectMembers: {
    method: "GET",
    path: "/api/rest/projects/:id/members",
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: z.array(z.object({
        id: z.string(),
        role: z.enum(["ADMIN", "MEMBER"]),
        createdAt: z.string(),
        updatedAt: z.string(),
        user: z.object({
          id: z.string(),
          firstName: z.string(),
          lastName: z.string(),
          email: z.string().nullable(),
          image: z.string().nullable(),
        }),
      })),
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Get project members",
    description: "List all members of a specific project. Admin API keys can access any project's members.",
  },
  addProjectMember: {
    method: "POST",
    path: "/api/rest/projects/:id/members",
    pathParams: z.object({
      id: z.string(),
    }),
    body: AddProjectMemberSchema,
    responses: {
      201: z.object({
        id: z.string(),
        role: z.enum(["ADMIN", "MEMBER"]),
        createdAt: z.string(),
        updatedAt: z.string(),
        user: z.object({
          id: z.string(),
          firstName: z.string(),
          lastName: z.string(),
          email: z.string().nullable(),
          image: z.string().nullable(),
        }),
      }),
      400: ErrorSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Add project member",
    description: "Add a new member to the project",
  },
  removeProjectMember: {
    method: "DELETE",
    path: "/api/rest/projects/:id/members/:memberId",
    pathParams: z.object({
      id: z.string(),
      memberId: z.string(),
    }),
    responses: {
      204: z.null(),
      401: ErrorSchema,
      403: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Remove project member",
    description: "Remove a member from the project (admins can remove any member, users can remove themselves)",
  },

  // Product endpoints
  getProjectProducts: {
    method: "GET",
    path: "/api/rest/projects/:id/products",
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: z.array(ProductSchema),
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Get project products",
    description: "List all products in a specific project. Admin API keys can access any project's products.",
  },
  createProjectProduct: {
    method: "POST",
    path: "/api/rest/projects/:id/products",
    pathParams: z.object({
      id: z.string(),
    }),
    body: CreateProductSchema,
    responses: {
      201: ProductSchema,
      400: ErrorSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Create project product",
    description: "Create a new product in the specified project",
  },
  getProjectProduct: {
    method: "GET",
    path: "/api/rest/projects/:id/products/:productId",
    pathParams: z.object({
      id: z.string(),
      productId: z.string(),
    }),
    responses: {
      200: ProductSchema.extend({
        category: z.object({
          id: z.string(),
          name: z.string(),
        }).nullable(),
        createdBy: z.object({
          id: z.string(),
          firstName: z.string(),
          lastName: z.string(),
        }),
        _count: z.object({
          stockMovements: z.number(),
        }),
      }),
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Get product details",
    description: "Get detailed information about a specific product",
  },
  updateProjectProduct: {
    method: "PUT",
    path: "/api/rest/projects/:id/products/:productId",
    pathParams: z.object({
      id: z.string(),
      productId: z.string(),
    }),
    body: UpdateProductSchema,
    responses: {
      200: ProductSchema.extend({
        category: z.object({
          id: z.string(),
          name: z.string(),
        }).nullable(),
        createdBy: z.object({
          id: z.string(),
          firstName: z.string(),
          lastName: z.string(),
        }),
      }),
      400: ErrorSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Update product",
    description: "Update an existing product",
  },
  deleteProjectProduct: {
    method: "DELETE",
    path: "/api/rest/projects/:id/products/:productId",
    pathParams: z.object({
      id: z.string(),
      productId: z.string(),
    }),
    responses: {
      204: z.null(),
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Delete product",
    description: "Delete an existing product",
  },

  // Customer endpoints
  getProjectCustomers: {
    method: "GET",
    path: "/api/rest/projects/:id/customers",
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: z.array(CustomerSchema),
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Get project customers",
    description: "List all customers in a specific project. Admin API keys can access any project's customers.",
  },
  createProjectCustomer: {
    method: "POST",
    path: "/api/rest/projects/:id/customers",
    pathParams: z.object({
      id: z.string(),
    }),
    body: CreateCustomerSchema,
    responses: {
      201: CustomerSchema.extend({
        _count: z.object({
          orders: z.number(),
        }),
        files: z.array(z.any()),
      }),
      400: ErrorSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Create project customer",
    description: "Create a new customer in the specified project",
  },
  getProjectCustomer: {
    method: "GET",
    path: "/api/rest/projects/:id/customers/:customerId",
    pathParams: z.object({
      id: z.string(),
      customerId: z.string(),
    }),
    responses: {
      200: CustomerSchema.extend({
        _count: z.object({
          orders: z.number(),
        }),
        files: z.array(z.any()),
      }),
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Get customer details",
    description: "Get detailed information about a specific customer",
  },
  updateProjectCustomer: {
    method: "PUT",
    path: "/api/rest/projects/:id/customers/:customerId",
    pathParams: z.object({
      id: z.string(),
      customerId: z.string(),
    }),
    body: UpdateCustomerSchema,
    responses: {
      200: CustomerSchema.extend({
        _count: z.object({
          orders: z.number(),
        }),
        files: z.array(z.any()),
      }),
      400: ErrorSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Update customer",
    description: "Update an existing customer",
  },
  deleteProjectCustomer: {
    method: "DELETE",
    path: "/api/rest/projects/:id/customers/:customerId",
    pathParams: z.object({
      id: z.string(),
      customerId: z.string(),
    }),
    responses: {
      204: z.null(),
      400: ErrorSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Delete customer",
    description: "Delete an existing customer (with business rule validations)",
  },

  // Agent endpoints
  getProjectAgents: {
    method: "GET",
    path: "/api/rest/projects/:id/agents",
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: z.array(AgentSchema),
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Get project agents",
    description: "List all AI agents in a specific project. Admin API keys can access any project's agents.",
  },
  createProjectAgent: {
    method: "POST",
    path: "/api/rest/projects/:id/agents",
    pathParams: z.object({
      id: z.string(),
    }),
    body: CreateAgentSchema,
    responses: {
      201: AgentSchema,
      400: ErrorSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Create project agent",
    description: "Create a new AI agent in the specified project",
  },

  // Deal endpoints
  getProjectDeals: {
    method: "GET",
    path: "/api/rest/projects/:id/deals",
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: z.array(DealSchema.extend({
        customer: z.object({
          id: z.string(),
          name: z.string(),
          email: z.string().nullable(),
        }),
      })),
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Get project deals",
    description: "List all deals in a specific project. Admin API keys can access any project's deals.",
  },
  createProjectDeal: {
    method: "POST",
    path: "/api/rest/projects/:id/deals",
    pathParams: z.object({
      id: z.string(),
    }),
    body: CreateDealSchema,
    responses: {
      201: DealSchema.extend({
        customer: z.object({
          id: z.string(),
          name: z.string(),
          email: z.string().nullable(),
        }),
      }),
      400: ErrorSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Create project deal",
    description: "Create a new deal in the specified project",
  },
  getProjectDeal: {
    method: "GET",
    path: "/api/rest/projects/:id/deals/:dealId",
    pathParams: z.object({
      id: z.string(),
      dealId: z.string(),
    }),
    responses: {
      200: DealSchema.extend({
        customer: z.object({
          id: z.string(),
          name: z.string(),
          email: z.string().nullable(),
        }),
      }),
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Get deal details",
    description: "Get detailed information about a specific deal",
  },
  updateProjectDeal: {
    method: "PUT",
    path: "/api/rest/projects/:id/deals/:dealId",
    pathParams: z.object({
      id: z.string(),
      dealId: z.string(),
    }),
    body: UpdateDealSchema,
    responses: {
      200: DealSchema.extend({
        customer: z.object({
          id: z.string(),
          name: z.string(),
          email: z.string().nullable(),
        }),
      }),
      400: ErrorSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Update deal",
    description: "Update an existing deal",
  },
  deleteProjectDeal: {
    method: "DELETE",
    path: "/api/rest/projects/:id/deals/:dealId",
    pathParams: z.object({
      id: z.string(),
      dealId: z.string(),
    }),
    responses: {
      204: z.null(),
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Delete deal",
    description: "Delete an existing deal",
  },

  // Contact endpoints
  getProjectContacts: {
    method: "GET",
    path: "/api/rest/projects/:id/contacts",
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: z.array(ContactSchema),
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Get project contacts",
    description: "List all contacts in a specific project. Admin API keys can access any project's contacts.",
  },
  createProjectContact: {
    method: "POST",
    path: "/api/rest/projects/:id/contacts",
    pathParams: z.object({
      id: z.string(),
    }),
    body: CreateContactSchema,
    responses: {
      201: ContactSchema,
      400: ErrorSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Create project contact",
    description: "Create a new contact in the specified project",
  },
  getProjectContact: {
    method: "GET",
    path: "/api/rest/projects/:id/contacts/:contactId",
    pathParams: z.object({
      id: z.string(),
      contactId: z.string(),
    }),
    responses: {
      200: ContactSchema.extend({
        leads: z.array(z.object({
          id: z.string(),
          status: z.enum(["NEW", "HOT", "PENDING", "LOST"]),
        })),
      }),
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Get contact details",
    description: "Get detailed information about a specific contact",
  },
  updateProjectContact: {
    method: "PUT",
    path: "/api/rest/projects/:id/contacts/:contactId",
    pathParams: z.object({
      id: z.string(),
      contactId: z.string(),
    }),
    body: UpdateContactSchema,
    responses: {
      200: ContactSchema.extend({
        leads: z.array(z.object({
          id: z.string(),
          status: z.enum(["NEW", "HOT", "PENDING", "LOST"]),
        })),
      }),
      400: ErrorSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Update contact",
    description: "Update an existing contact",
  },
  deleteProjectContact: {
    method: "DELETE",
    path: "/api/rest/projects/:id/contacts/:contactId",
    pathParams: z.object({
      id: z.string(),
      contactId: z.string(),
    }),
    responses: {
      204: z.null(),
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Delete contact",
    description: "Delete an existing contact and related leads",
  },

  // Lead endpoints
  getProjectLeads: {
    method: "GET",
    path: "/api/rest/projects/:id/leads",
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: z.array(LeadSchema.extend({
        contact: z.object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
          companyName: z.string().nullable(),
        }).nullable(),
      })),
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Get project leads",
    description: "List all leads in a specific project. Admin API keys can access any project's leads.",
  },
  createProjectLead: {
    method: "POST",
    path: "/api/rest/projects/:id/leads",
    pathParams: z.object({
      id: z.string(),
    }),
    body: CreateLeadSchema,
    responses: {
      201: LeadSchema.extend({
        contact: z.object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
          companyName: z.string().nullable(),
        }).nullable(),
      }),
      400: ErrorSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Create project lead",
    description: "Create a new lead in the specified project",
  },
  getProjectLead: {
    method: "GET",
    path: "/api/rest/projects/:id/leads/:leadId",
    pathParams: z.object({
      id: z.string(),
      leadId: z.string(),
    }),
    responses: {
      200: LeadSchema.extend({
        contact: z.object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
          companyName: z.string().nullable(),
          role: z.string().nullable(),
          status: z.enum(["CONTACT", "CUSTOMER", "LEAD"]),
        }).nullable(),
      }),
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Get lead details",
    description: "Get detailed information about a specific lead",
  },
  updateProjectLead: {
    method: "PUT",
    path: "/api/rest/projects/:id/leads/:leadId",
    pathParams: z.object({
      id: z.string(),
      leadId: z.string(),
    }),
    body: UpdateLeadSchema,
    responses: {
      200: LeadSchema.extend({
        contact: z.object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
          companyName: z.string().nullable(),
        }).nullable(),
      }),
      400: ErrorSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Update lead",
    description: "Update an existing lead",
  },
  deleteProjectLead: {
    method: "DELETE",
    path: "/api/rest/projects/:id/leads/:leadId",
    pathParams: z.object({
      id: z.string(),
      leadId: z.string(),
    }),
    responses: {
      204: z.null(),
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Delete lead",
    description: "Delete an existing lead",
  },

  // Category endpoints
  getProjectCategories: {
    method: "GET",
    path: "/api/rest/projects/:id/categories",
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: z.array(CategorySchema),
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Get project categories",
    description: "List all categories in a specific project. Admin API keys can access any project's categories.",
  },
  createProjectCategory: {
    method: "POST",
    path: "/api/rest/projects/:id/categories",
    pathParams: z.object({
      id: z.string(),
    }),
    body: CreateCategorySchema,
    responses: {
      201: CategorySchema,
      400: ErrorSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Create project category",
    description: "Create a new category in the specified project",
  },
  getProjectCategory: {
    method: "GET",
    path: "/api/rest/projects/:id/categories/:categoryId",
    pathParams: z.object({
      id: z.string(),
      categoryId: z.string(),
    }),
    responses: {
      200: CategorySchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Get category details",
    description: "Get detailed information about a specific category",
  },
  updateProjectCategory: {
    method: "PUT",
    path: "/api/rest/projects/:id/categories/:categoryId",
    pathParams: z.object({
      id: z.string(),
      categoryId: z.string(),
    }),
    body: UpdateCategorySchema,
    responses: {
      200: CategorySchema,
      400: ErrorSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Update category",
    description: "Update an existing category",
  },
  deleteProjectCategory: {
    method: "DELETE",
    path: "/api/rest/projects/:id/categories/:categoryId",
    pathParams: z.object({
      id: z.string(),
      categoryId: z.string(),
    }),
    responses: {
      204: z.null(),
      400: ErrorSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Delete category",
    description: "Delete an existing category (cannot delete default categories)",
  },

  // Warehouse endpoints
  getProjectWarehouses: {
    method: "GET",
    path: "/api/rest/projects/:id/warehouses",
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: z.array(WarehouseSchema),
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Get project warehouses",
    description: "List all warehouses in a specific project. Admin API keys can access any project's warehouses.",
  },
  createProjectWarehouse: {
    method: "POST",
    path: "/api/rest/projects/:id/warehouses",
    pathParams: z.object({
      id: z.string(),
    }),
    body: CreateWarehouseSchema,
    responses: {
      201: WarehouseSchema,
      400: ErrorSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Create project warehouse",
    description: "Create a new warehouse in the specified project (warehouse ID is auto-generated)",
  },
  getProjectWarehouse: {
    method: "GET",
    path: "/api/rest/projects/:id/warehouses/:warehouseId",
    pathParams: z.object({
      id: z.string(),
      warehouseId: z.string(),
    }),
    responses: {
      200: WarehouseSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Get warehouse details",
    description: "Get detailed information about a specific warehouse",
  },
  updateProjectWarehouse: {
    method: "PUT",
    path: "/api/rest/projects/:id/warehouses/:warehouseId",
    pathParams: z.object({
      id: z.string(),
      warehouseId: z.string(),
    }),
    body: UpdateWarehouseSchema,
    responses: {
      200: WarehouseSchema,
      400: ErrorSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Update warehouse",
    description: "Update an existing warehouse",
  },
  deleteProjectWarehouse: {
    method: "DELETE",
    path: "/api/rest/projects/:id/warehouses/:warehouseId",
    pathParams: z.object({
      id: z.string(),
      warehouseId: z.string(),
    }),
    responses: {
      204: z.null(),
      400: ErrorSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Delete warehouse",
    description: "Delete an existing warehouse (cannot delete default warehouses or warehouses with products)",
  },

  // PQR endpoints
  getProjectPQRs: {
    method: "GET",
    path: "/api/rest/projects/:id/pqrs",
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: z.array(PQRSchema),
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Get project PQRs",
    description: "List all PQRs (Peticiones, Quejas y Reclamos) in a specific project. Admin API keys can access any project's PQRs.",
  },
  createProjectPQR: {
    method: "POST",
    path: "/api/rest/projects/:id/pqrs",
    pathParams: z.object({
      id: z.string(),
    }),
    body: CreatePQRSchema,
    responses: {
      201: PQRSchema,
      400: ErrorSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Create project PQR",
    description: "Create a new PQR (Petición, Queja o Reclamo) in the specified project",
  },
  getProjectPQR: {
    method: "GET",
    path: "/api/rest/projects/:id/pqrs/:pqrId",
    pathParams: z.object({
      id: z.string(),
      pqrId: z.string(),
    }),
    responses: {
      200: PQRSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Get PQR details",
    description: "Get detailed information about a specific PQR",
  },
  updateProjectPQR: {
    method: "PUT",
    path: "/api/rest/projects/:id/pqrs/:pqrId",
    pathParams: z.object({
      id: z.string(),
      pqrId: z.string(),
    }),
    body: UpdatePQRSchema,
    responses: {
      200: PQRSchema,
      400: ErrorSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Update PQR",
    description: "Update an existing PQR",
  },
  deleteProjectPQR: {
    method: "DELETE",
    path: "/api/rest/projects/:id/pqrs/:pqrId",
    pathParams: z.object({
      id: z.string(),
      pqrId: z.string(),
    }),
    responses: {
      204: z.null(),
      401: ErrorSchema,
      404: ErrorSchema,
    },
    summary: "Delete PQR",
    description: "Delete an existing PQR and its analysis",
  },

  // Webhook endpoint
  triggerWebhook: {
    method: "POST",
    path: "/api/rest/webhook/:agentId",
    pathParams: z.object({
      agentId: z.string(),
    }),
    body: z.any().optional(),
    responses: {
      200: z.object({
        success: z.boolean(),
        message: z.string(),
        agentId: z.string(),
        agentName: z.string().nullable(),
        agentType: z.enum(["SALES", "NFO", "CUSTOMER_SERVICE", "LOGISTICS", "CRM"]),
        timestamp: z.string(),
        status: z.string(),
      }),
      401: ErrorSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    summary: "Trigger agent via webhook",
    description: "Receive webhook data to trigger an agent. Currently in development - endpoint acknowledges receipt but does not process data yet.",
  },
});

export type ApiContract = typeof apiContract;