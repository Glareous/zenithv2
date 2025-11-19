import { NextResponse } from 'next/server'

import { apiContract } from '@src/server/api/contracts/api'
import { generateOpenApi } from '@ts-rest/open-api'

export async function GET() {
  const openApiDocument = generateOpenApi(
    apiContract,
    {
      info: {
        title: 'Zenith API',
        description: `REST API for Zenith platform

## Authentication & Authorization

### API Key Types
- **Regular API Keys (admin: false)**: Scoped access to user's organizations and projects
- **Admin API Keys (admin: true)**: System-wide access to all resources

### Access Levels
1. **Regular Users**: Access only to their organization's data
2. **Project Members**: Access scoped to specific projects  
3. **Organization Admins**: Full access to organization data
4. **System Admins (via admin API keys)**: Access to all system data

### Admin API Key Behavior
Admin API keys bypass normal organization/project scoping restrictions:
- \`GET /api/rest/projects\` - Returns ALL projects in the system
- \`GET /api/rest/projects/{id}/*\` - Can access any project's resources
- Useful for system monitoring, analytics, and administration

**Note**: Admin status can only be set directly in the database, not via API.`,
        version: '1.0.0',
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
          description: 'API Server',
        },
      ],
      components: {
        securitySchemes: {
          ApiKeyAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'API Key',
            description: 'API Key authentication using Bearer token',
          },
        },
      },
      security: [{ ApiKeyAuth: [] }],
      tags: [
        { name: 'user', description: 'User profile and account management' },
        { name: 'api-keys', description: 'API key management endpoints' },
        {
          name: 'projects',
          description: 'Project management and organization',
        },
        {
          name: 'project-members',
          description: 'Project team member management',
        },
        {
          name: 'project-products',
          description: 'Product catalog and inventory management',
        },
        {
          name: 'project-customers',
          description: 'Customer relationship management',
        },
        {
          name: 'project-agents',
          description: 'AI agent configuration and management',
        },
        {
          name: 'project-deals',
          description: 'Deal and sales opportunity management',
        },
        {
          name: 'project-contacts',
          description: 'Contact management and lead generation',
        },
        {
          name: 'project-leads',
          description: 'Lead tracking and conversion management',
        },
        {
          name: 'project-categories',
          description: 'Product and service category management',
        },
        {
          name: 'project-warehouses',
          description: 'Warehouse and inventory location management',
        },
        {
          name: 'project-pqrs',
          description: 'PQR management',
        },
        {
          name: 'webhooks',
          description: 'Webhook endpoints for external integrations',
        },
      ],
    },
    {
      setOperationId: true,
      jsonQuery: true,
      operationMapper: (operation, route) => {
        // Map endpoints to appropriate tags based on path
        const path = route.path
        let tags: string[] = ['default']

        if (path.includes('/user/profile')) {
          tags = ['user']
        } else if (path.includes('/user/api-keys')) {
          tags = ['api-keys']
        } else if (path.includes('/projects') && path.includes('/members')) {
          tags = ['project-members']
        } else if (path.includes('/projects') && path.includes('/products')) {
          tags = ['project-products']
        } else if (path.includes('/projects') && path.includes('/customers')) {
          tags = ['project-customers']
        } else if (path.includes('/projects') && path.includes('/agents')) {
          tags = ['project-agents']
        } else if (path.includes('/projects') && path.includes('/deals')) {
          tags = ['project-deals']
        } else if (path.includes('/projects') && path.includes('/contacts')) {
          tags = ['project-contacts']
        } else if (path.includes('/projects') && path.includes('/leads')) {
          tags = ['project-leads']
        } else if (path.includes('/projects') && path.includes('/categories')) {
          tags = ['project-categories']
        } else if (path.includes('/projects') && path.includes('/warehouses')) {
          tags = ['project-warehouses']
        } else if (path.includes('/projects') && path.includes('/pqrs')) {
          tags = ['project-pqrs']
        } else if (path.includes('/webhook')) {
          tags = ['webhooks']
        } else if (path.includes('/projects')) {
          tags = ['projects']
        }

        return {
          ...operation,
          tags,
        }
      },
    }
  )

  // ✅ ADD MANUAL EXAMPLES FOR ALL REMAINING ENDPOINTS
  // Projects
  if (
    openApiDocument.paths['/api/rest/projects']?.post?.requestBody?.content?.[
      'application/json'
    ]?.schema
  ) {
    openApiDocument.paths['/api/rest/projects'].post.requestBody.content[
      'application/json'
    ].schema = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'REQUIRED: Project name (e.g., My First Project)',
          example: 'My First Project',
        },
        description: {
          type: 'string',
          description:
            'OPTIONAL: Project description (e.g., Project description)',
          example: 'Project description',
        },
        organizationId: {
          type: 'string',
          description: 'REQUIRED: Organization ID (e.g., org_123456789)',
          example: 'org_123456789',
        },
      },
      required: ['name', 'organizationId'],
    }
  }

  // Project Updates
  if (
    openApiDocument.paths['/api/rest/projects/{id}']?.put?.requestBody
      ?.content?.['application/json']?.schema
  ) {
    openApiDocument.paths['/api/rest/projects/{id}'].put.requestBody.content[
      'application/json'
    ].schema = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'OPTIONAL: Project name (e.g., Updated Project Name)',
          example: 'Updated Project Name',
        },
        description: {
          type: 'string',
          description:
            'OPTIONAL: Project description (e.g., Updated description)',
          example: 'Updated description',
        },
        logoUrl: {
          type: 'string',
          description:
            'OPTIONAL: Project logo URL (e.g., https://example.com/logo.png)',
          example: 'https://example.com/logo.png',
        },
        status: {
          type: 'string',
          description:
            'OPTIONAL: Project status - Choose from: ACTIVE, CREATED, COMPLETED',
          example: 'ACTIVE',
          enum: ['ACTIVE', 'CREATED', 'COMPLETED'],
        },
      },
      required: [],
    }
  }

  // Products
  if (
    openApiDocument.paths['/api/rest/projects/{id}/products']?.post?.requestBody
      ?.content?.['application/json']?.schema
  ) {
    openApiDocument.paths[
      '/api/rest/projects/{id}/products'
    ].post.requestBody.content['application/json'].schema = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'REQUIRED: Product name (e.g., Sample Product)',
          example: 'Sample Product',
        },
        description: {
          type: 'string',
          description:
            'OPTIONAL: Product description (e.g., Product description)',
          example: 'Product description',
        },
        price: {
          type: 'number',
          description:
            'OPTIONAL: Product price in decimal format (e.g., 29.99)',
          example: 29.99,
        },
        categoryId: {
          type: 'string',
          description: 'REQUIRED: Organization ID (e.g., org_123456789)',
          example: 'categ_123456789',
        },
      },
      required: ['name', 'categoryId'],
    }
  }

  // Product Updates
  if (
    openApiDocument.paths['/api/rest/projects/{id}/products/{productId}']?.put
      ?.requestBody?.content?.['application/json']?.schema
  ) {
    openApiDocument.paths[
      '/api/rest/projects/{id}/products/{productId}'
    ].put.requestBody.content['application/json'].schema = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'OPTIONAL: Product name (e.g., Updated Product Name)',
          example: 'Updated Product Name',
        },
        description: {
          type: 'string',
          description:
            'OPTIONAL: Product description (e.g., Updated description)',
          example: 'Updated description',
        },
        price: {
          type: 'number',
          description:
            'OPTIONAL: Product price in decimal format (e.g., 39.99)',
          example: 39.99,
        },
        categoryId: {
          type: 'string',
          description: 'OPTIONAL: Product category ID (e.g., cat_123456789)',
          example: 'cat_123456789',
        },
        isActive: {
          type: 'boolean',
          description: 'OPTIONAL: Is product active (e.g., true)',
          example: true,
        },
      },
      required: [],
    }
  }

  // Customers
  if (
    openApiDocument.paths['/api/rest/projects/{id}/customers']?.post
      ?.requestBody?.content?.['application/json']?.schema
  ) {
    openApiDocument.paths[
      '/api/rest/projects/{id}/customers'
    ].post.requestBody.content['application/json'].schema = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'REQUIRED: Customer full name (e.g., John Doe)',
          example: 'John Doe',
        },
        email: {
          type: 'string',
          description:
            'OPTIONAL: Customer email address (e.g., john@example.com)',
          example: 'john@example.com',
        },
        phoneNumber: {
          type: 'string',
          description: 'OPTIONAL: Customer phone number (e.g., +1234567890)',
          example: '+1234567890',
        },
        location: {
          type: 'string',
          description: 'OPTIONAL: Customer location/city (e.g., New York, USA)',
          example: 'New York, USA',
        },
        subscriber: {
          type: 'boolean',
          description: 'OPTIONAL: Is customer a subscriber (e.g., true)',
          example: true,
        },
        gender: {
          type: 'string',
          description:
            'OPTIONAL: Customer gender - Choose from: MALE, FEMALE, OTHER',
          example: 'MALE',
          enum: ['MALE', 'FEMALE', 'OTHER'],
        },
        role: {
          type: 'string',
          description:
            'OPTIONAL: Customer role in organization (e.g., Manager)',
          example: 'Manager',
        },
        website: {
          type: 'string',
          description:
            'OPTIONAL: Customer website URL (e.g., https://example.com)',
          example: 'https://example.com',
        },
        origin: {
          type: 'string',
          description:
            'OPTIONAL: Customer origin/source (e.g., Website, Referral)',
          example: 'Website',
        },
      },
      required: ['name'],
    }
  }

  // Customer Updates
  if (
    openApiDocument.paths['/api/rest/projects/{id}/customers/{customerId}']?.put
      ?.requestBody?.content?.['application/json']?.schema
  ) {
    openApiDocument.paths[
      '/api/rest/projects/{id}/customers/{customerId}'
    ].put.requestBody.content['application/json'].schema = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'OPTIONAL: Customer full name (e.g., John Smith)',
          example: 'John Smith',
        },
        email: {
          type: 'string',
          description:
            'OPTIONAL: Customer email address (e.g., john.smith@example.com)',
          example: 'john.smith@example.com',
        },
        phoneNumber: {
          type: 'string',
          description: 'OPTIONAL: Customer phone number (e.g., +1987654321)',
          example: '+1987654321',
        },
        location: {
          type: 'string',
          description:
            'OPTIONAL: Customer location/city (e.g., Los Angeles, CA)',
          example: 'Los Angeles, CA',
        },
        subscriber: {
          type: 'boolean',
          description: 'OPTIONAL: Is customer a subscriber (e.g., false)',
          example: false,
        },
        gender: {
          type: 'string',
          description:
            'OPTIONAL: Customer gender - Choose from: MALE, FEMALE, OTHER',
          example: 'MALE',
          enum: ['MALE', 'FEMALE', 'OTHER'],
        },
        role: {
          type: 'string',
          description:
            'OPTIONAL: Customer role in organization (e.g., Director)',
          example: 'Director',
        },
        website: {
          type: 'string',
          description:
            'OPTIONAL: Customer website URL (e.g., https://new-example.com)',
          example: 'https://new-example.com',
        },
        isActive: {
          type: 'boolean',
          description: 'OPTIONAL: Is customer active (e.g., true)',
          example: true,
        },
        origin: {
          type: 'string',
          description:
            'OPTIONAL: Customer origin/source (e.g., Referral, Website)',
          example: 'Referral',
        },
      },
      required: [],
    }
  }

  // Agents
  if (
    openApiDocument.paths['/api/rest/projects/{id}/agents']?.post?.requestBody
      ?.content?.['application/json']?.schema
  ) {
    openApiDocument.paths[
      '/api/rest/projects/{id}/agents'
    ].post.requestBody.content['application/json'].schema = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'OPTIONAL: Agent name (e.g., Sales Agent)',
          example: 'Sales Agent',
        },
        type: {
          type: 'string',
          description:
            'REQUIRED: Agent type - Choose from: SALES, NFO, CUSTOMER_SERVICE, LOGISTICS, CRM',
          example: 'SALES',
          enum: ['SALES', 'NFO', 'CUSTOMER_SERVICE', 'LOGISTICS', 'CRM'],
        },
        systemInstructions: {
          type: 'string',
          description:
            'OPTIONAL: System instructions for the agent (e.g., Handle customer inquiries professionally)',
          example: 'Handle customer inquiries professionally',
        },
      },
      required: ['type'],
    }
  }

  // Deals
  if (
    openApiDocument.paths['/api/rest/projects/{id}/deals']?.post?.requestBody
      ?.content?.['application/json']?.schema
  ) {
    openApiDocument.paths[
      '/api/rest/projects/{id}/deals'
    ].post.requestBody.content['application/json'].schema = {
      type: 'object',
      properties: {
        dealDate: {
          type: 'string',
          description:
            'OPTIONAL: Deal date in ISO format (e.g., 2025-01-15T10:00:00Z)',
          example: '2025-01-15T10:00:00Z',
        },
        isActive: {
          type: 'boolean',
          description: 'OPTIONAL: Is deal currently active (e.g., true)',
          example: true,
        },
        isExpired: {
          type: 'boolean',
          description: 'OPTIONAL: Is deal expired (e.g., false)',
          example: false,
        },
        revenue: {
          type: 'number',
          description: 'OPTIONAL: Deal revenue amount (e.g., 1500.00)',
          example: 1500.0,
        },
        customerId: {
          type: 'string',
          description:
            'REQUIRED: Customer ID for this deal (e.g., cust_123456789)',
          example: 'cust_123456789',
        },
      },
      required: ['customerId'],
    }
  }

  // Deal Updates
  if (
    openApiDocument.paths['/api/rest/projects/{id}/deals/{dealId}']?.put
      ?.requestBody?.content?.['application/json']?.schema
  ) {
    openApiDocument.paths[
      '/api/rest/projects/{id}/deals/{dealId}'
    ].put.requestBody.content['application/json'].schema = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'OPTIONAL: Deal name (e.g., Updated Deal Name)',
          example: 'Updated Deal Name',
        },
        dealDate: {
          type: 'string',
          description:
            'OPTIONAL: Deal date in ISO format (e.g., 2025-02-15T10:00:00Z)',
          example: '2025-02-15T10:00:00Z',
        },
        isActive: {
          type: 'boolean',
          description: 'OPTIONAL: Is deal currently active (e.g., false)',
          example: false,
        },
        isExpired: {
          type: 'boolean',
          description: 'OPTIONAL: Is deal expired (e.g., true)',
          example: true,
        },
        revenue: {
          type: 'number',
          description: 'OPTIONAL: Deal revenue amount (e.g., 2500.00)',
          example: 2500.0,
        },
        customerId: {
          type: 'string',
          description:
            'OPTIONAL: Customer ID for this deal (e.g., cust_987654321)',
          example: 'cust_987654321',
        },
      },
      required: [],
    }
  }

  // Contacts
  if (
    openApiDocument.paths['/api/rest/projects/{id}/contacts']?.post?.requestBody
      ?.content?.['application/json']?.schema
  ) {
    openApiDocument.paths[
      '/api/rest/projects/{id}/contacts'
    ].post.requestBody.content['application/json'].schema = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'REQUIRED: Contact full name (e.g., Jane Smith)',
          example: 'Jane Smith',
        },
        companyName: {
          type: 'string',
          description: 'OPTIONAL: Company name (e.g., Example Corp)',
          example: 'Example Corp',
        },
        role: {
          type: 'string',
          description: 'OPTIONAL: Contact role in company (e.g., CEO)',
          example: 'CEO',
        },
        email: {
          type: 'string',
          description:
            'REQUIRED: Contact email address (e.g., jane@example.com)',
          example: 'jane@example.com',
        },
        phoneNumber: {
          type: 'string',
          description: 'REQUIRED: Contact phone number (e.g., +1987654321)',
          example: '+1987654321',
        },
        website: {
          type: 'string',
          description:
            'OPTIONAL: Company website URL (e.g., https://example.com)',
          example: 'https://example.com',
        },
        status: {
          type: 'string',
          description:
            'OPTIONAL: Contact status - Choose from: CONTACT, CUSTOMER, LEAD',
          example: 'CONTACT',
          enum: ['CONTACT', 'CUSTOMER', 'LEAD'],
        },
        subscriber: {
          type: 'boolean',
          description: 'OPTIONAL: Is contact a subscriber (e.g., false)',
          example: false,
        },
        gender: {
          type: 'string',
          description:
            'OPTIONAL: Contact gender - Choose from: MALE, FEMALE, OTHER',
          example: 'FEMALE',
          enum: ['MALE', 'FEMALE', 'OTHER'],
        },
        location: {
          type: 'string',
          description: 'OPTIONAL: Contact location (e.g., San Francisco, CA)',
          example: 'San Francisco, CA',
        },
      },
      required: ['name', 'email', 'phoneNumber'],
    }
  }

  // Contact Updates
  if (
    openApiDocument.paths['/api/rest/projects/{id}/contacts/{contactId}']?.put
      ?.requestBody?.content?.['application/json']?.schema
  ) {
    openApiDocument.paths[
      '/api/rest/projects/{id}/contacts/{contactId}'
    ].put.requestBody.content['application/json'].schema = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'OPTIONAL: Contact full name (e.g., Jane Johnson)',
          example: 'Jane Johnson',
        },
        companyName: {
          type: 'string',
          description: 'OPTIONAL: Company name (e.g., New Example Corp)',
          example: 'New Example Corp',
        },
        role: {
          type: 'string',
          description: 'OPTIONAL: Contact role in company (e.g., CTO)',
          example: 'CTO',
        },
        email: {
          type: 'string',
          description:
            'OPTIONAL: Contact email address (e.g., jane.johnson@example.com)',
          example: 'jane.johnson@example.com',
        },
        phoneNumber: {
          type: 'string',
          description: 'OPTIONAL: Contact phone number (e.g., +1555123456)',
          example: '+1555123456',
        },
        website: {
          type: 'string',
          description:
            'OPTIONAL: Company website URL (e.g., https://new-example.com)',
          example: 'https://new-example.com',
        },
        status: {
          type: 'string',
          description:
            'OPTIONAL: Contact status - Choose from: CONTACT, CUSTOMER, LEAD',
          example: 'CUSTOMER',
          enum: ['CONTACT', 'CUSTOMER', 'LEAD'],
        },
        subscriber: {
          type: 'boolean',
          description: 'OPTIONAL: Is contact a subscriber (e.g., true)',
          example: true,
        },
        gender: {
          type: 'string',
          description:
            'OPTIONAL: Contact gender - Choose from: MALE, FEMALE, OTHER',
          example: 'FEMALE',
          enum: ['MALE', 'FEMALE', 'OTHER'],
        },
        location: {
          type: 'string',
          description: 'OPTIONAL: Contact location (e.g., Seattle, WA)',
          example: 'Seattle, WA',
        },
      },
      required: [],
    }
  }

  // Leads
  if (
    openApiDocument.paths['/api/rest/projects/{id}/leads']?.post?.requestBody
      ?.content?.['application/json']?.schema
  ) {
    openApiDocument.paths[
      '/api/rest/projects/{id}/leads'
    ].post.requestBody.content['application/json'].schema = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'REQUIRED: Lead full name (e.g., Potential Customer)',
          example: 'Potential Customer',
        },
        email: {
          type: 'string',
          description: 'REQUIRED: Lead email address (e.g., lead@example.com)',
          example: 'lead@example.com',
        },
        phoneNumber: {
          type: 'string',
          description: 'REQUIRED: Lead phone number (e.g., +1555123456)',
          example: '+1555123456',
        },
        status: {
          type: 'string',
          description:
            'OPTIONAL: Lead status - Choose from: NEW, HOT, PENDING, LOST',
          example: 'NEW',
          enum: ['NEW', 'HOT', 'PENDING', 'LOST'],
        },
        contactId: {
          type: 'string',
          description: 'OPTIONAL: Associated contact ID (e.g., cont_123456789)',
          example: 'cont_123456789',
        },
      },
      required: ['name', 'email', 'phoneNumber'],
    }
  }

  // Lead Updates
  if (
    openApiDocument.paths['/api/rest/projects/{id}/leads/{leadId}']?.put
      ?.requestBody?.content?.['application/json']?.schema
  ) {
    openApiDocument.paths[
      '/api/rest/projects/{id}/leads/{leadId}'
    ].put.requestBody.content['application/json'].schema = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'OPTIONAL: Lead full name (e.g., Hot Prospect)',
          example: 'Hot Prospect',
        },
        email: {
          type: 'string',
          description:
            'OPTIONAL: Lead email address (e.g., prospect@example.com)',
          example: 'prospect@example.com',
        },
        phoneNumber: {
          type: 'string',
          description: 'OPTIONAL: Lead phone number (e.g., +1444123456)',
          example: '+1444123456',
        },
        status: {
          type: 'string',
          description:
            'OPTIONAL: Lead status - Choose from: NEW, HOT, PENDING, LOST',
          example: 'HOT',
          enum: ['NEW', 'HOT', 'PENDING', 'LOST'],
        },
        contactId: {
          type: 'string',
          description: 'OPTIONAL: Associated contact ID (e.g., cont_987654321)',
          example: 'cont_987654321',
        },
      },
      required: [],
    }
  }

  // Project Members
  if (
    openApiDocument.paths['/api/rest/projects/{id}/members']?.post?.requestBody
      ?.content?.['application/json']?.schema
  ) {
    openApiDocument.paths[
      '/api/rest/projects/{id}/members'
    ].post.requestBody.content['application/json'].schema = {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description:
            'REQUIRED: User ID to add as member (e.g., user_123456789)',
          example: 'user_123456789',
        },
        role: {
          type: 'string',
          description:
            'OPTIONAL: Member role - Choose from: ADMIN, MEMBER (default: MEMBER)',
          example: 'MEMBER',
          enum: ['ADMIN', 'MEMBER'],
        },
      },
      required: ['userId'],
    }
  }

  // User Profile
  if (
    openApiDocument.paths['/api/rest/user/profile']?.put?.requestBody
      ?.content?.['application/json']?.schema
  ) {
    openApiDocument.paths['/api/rest/user/profile'].put.requestBody.content[
      'application/json'
    ].schema = {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
          description: 'OPTIONAL: User first name (e.g., John)',
          example: 'John',
        },
        lastName: {
          type: 'string',
          description: 'OPTIONAL: User last name (e.g., Doe)',
          example: 'Doe',
        },
        email: {
          type: 'string',
          description:
            'OPTIONAL: User email address (e.g., john.doe@example.com)',
          example: 'john.doe@example.com',
        },
      },
      required: [],
    }
  }

  // Update API Key
  if (
    openApiDocument.paths['/api/rest/user/api-keys/{id}']?.put?.requestBody
      ?.content?.['application/json']?.schema
  ) {
    openApiDocument.paths[
      '/api/rest/user/api-keys/{id}'
    ].put.requestBody.content['application/json'].schema = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'OPTIONAL: API key name (e.g., Updated API Key Name)',
          example: 'Updated API Key Name',
        },
        isActive: {
          type: 'boolean',
          description: 'OPTIONAL: Is API key active (e.g., false)',
          example: false,
        },
      },
      required: [],
    }
  }

  // Webhook
  if (
    openApiDocument.paths['/api/rest/webhook/{agentId}']?.post?.requestBody
      ?.content?.['application/json']?.schema
  ) {
    openApiDocument.paths[
      '/api/rest/webhook/{agentId}'
    ].post.requestBody.content['application/json'].schema = {
      type: 'object',
      description:
        'Optional JSON payload - can be any structure depending on your integration. Leave empty for now as webhook processing is not yet implemented.',
      example: {},
    }
  }

  // Categories
  if (
    openApiDocument.paths['/api/rest/projects/{id}/categories']?.post
      ?.requestBody?.content?.['application/json']?.schema
  ) {
    openApiDocument.paths[
      '/api/rest/projects/{id}/categories'
    ].post.requestBody.content['application/json'].schema = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'REQUIRED: Category name (e.g., Electronics)',
          example: 'Electronics',
        },
        description: {
          type: 'string',
          description:
            'OPTIONAL: Category description (e.g., Electronic products and gadgets)',
          example: 'Electronic products and gadgets',
        },
        type: {
          type: 'string',
          description:
            'REQUIRED: Category type - Choose from: PRODUCT, SERVICE',
          example: 'PRODUCT',
          enum: ['PRODUCT', 'SERVICE'],
        },
        isActive: {
          type: 'boolean',
          description: 'OPTIONAL: Is category active (e.g., true)',
          example: true,
        },
      },
      required: ['name', 'type'],
    }
  }

  // Category Updates
  if (
    openApiDocument.paths['/api/rest/projects/{id}/categories/{categoryId}']
      ?.put?.requestBody?.content?.['application/json']?.schema
  ) {
    openApiDocument.paths[
      '/api/rest/projects/{id}/categories/{categoryId}'
    ].put.requestBody.content['application/json'].schema = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'OPTIONAL: Category name (e.g., Updated Electronics)',
          example: 'Updated Electronics',
        },
        description: {
          type: 'string',
          description:
            'OPTIONAL: Category description (e.g., Updated description)',
          example: 'Updated description',
        },
        type: {
          type: 'string',
          description:
            'OPTIONAL: Category type - Choose from: PRODUCT, SERVICE',
          example: 'SERVICE',
          enum: ['PRODUCT', 'SERVICE'],
        },
        isActive: {
          type: 'boolean',
          description: 'OPTIONAL: Is category active (e.g., false)',
          example: false,
        },
      },
      required: [],
    }
  }

  // Warehouses
  if (
    openApiDocument.paths['/api/rest/projects/{id}/warehouses']?.post
      ?.requestBody?.content?.['application/json']?.schema
  ) {
    openApiDocument.paths[
      '/api/rest/projects/{id}/warehouses'
    ].post.requestBody.content['application/json'].schema = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'REQUIRED: Warehouse name (e.g., Main Warehouse)',
          example: 'Main Warehouse',
        },
        description: {
          type: 'string',
          description:
            'OPTIONAL: Warehouse description (e.g., Primary storage facility)',
          example: 'Primary storage facility',
        },
        isActive: {
          type: 'boolean',
          description: 'OPTIONAL: Is warehouse active (e.g., true)',
          example: true,
        },
      },
      required: ['name'],
    }
  }

  // Warehouse Updates
  if (
    openApiDocument.paths['/api/rest/projects/{id}/warehouses/{warehouseId}']
      ?.put?.requestBody?.content?.['application/json']?.schema
  ) {
    openApiDocument.paths[
      '/api/rest/projects/{id}/warehouses/{warehouseId}'
    ].put.requestBody.content['application/json'].schema = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'OPTIONAL: Warehouse name (e.g., Updated Warehouse)',
          example: 'Updated Warehouse',
        },
        description: {
          type: 'string',
          description:
            'OPTIONAL: Warehouse description (e.g., Updated description)',
          example: 'Updated description',
        },
        isActive: {
          type: 'boolean',
          description: 'OPTIONAL: Is warehouse active (e.g., false)',
          example: false,
        },
      },
      required: [],
    }
  }

  // PQRs (Peticiones, Quejas y Reclamos)
  if (
    openApiDocument.paths['/api/rest/projects/{id}/pqrs']?.post?.requestBody
      ?.content?.['application/json']?.schema
  ) {
    openApiDocument.paths[
      '/api/rest/projects/{id}/pqrs'
    ].post.requestBody.content['application/json'].schema = {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
          description: 'REQUIRED: First name (e.g., John)',
          example: 'John',
        },
        lastName: {
          type: 'string',
          description: 'REQUIRED: Last name (e.g., Doe)',
          example: 'Doe',
        },
        phone: {
          type: 'string',
          description: 'REQUIRED: Phone number (e.g., +123456789123)',
          example: '+123456789123',
        },
        email: {
          type: 'string',
          description: 'REQUIRED: Email address (e.g., john.doe@example.com)',
          example: 'juan.perez@example.com',
        },
        city: {
          type: 'string',
          description: 'REQUIRED: City (e.g., Texas)',
          example: 'Texas',
        },
        documentType: {
          type: 'string',
          description:
            'REQUIRED: Document type - Choose from: CC, CE, PASSPORT, NIT',
          example: 'CC',
          enum: ['CC', 'CE', 'PASSPORT', 'NIT'],
        },
        documentNumber: {
          type: 'string',
          description: 'REQUIRED: Document number (e.g., 1234567890)',
          example: '1234567890',
        },
        message: {
          type: 'string',
          description:
            'REQUIRED: PQR message/description (e.g., I would like to file a complaint about...)',
          example:
            'I would like to file a complaint about the service received.',
        },
        status: {
          type: 'string',
          description:
            'OPTIONAL: PQR status - Choose from: PROCESSING, COMPLETED (default: PROCESSING)',
          example: 'PROCESSING',
          enum: ['PROCESSING', 'COMPLETED'],
        },
      },
      required: [
        'firstName',
        'lastName',
        'phone',
        'email',
        'city',
        'documentType',
        'documentNumber',
        'message',
      ],
    }
  }

  // PQR Updates
  if (
    openApiDocument.paths['/api/rest/projects/{id}/pqrs/{pqrId}']?.put
      ?.requestBody?.content?.['application/json']?.schema
  ) {
    openApiDocument.paths[
      '/api/rest/projects/{id}/pqrs/{pqrId}'
    ].put.requestBody.content['application/json'].schema = {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
          description: 'OPTIONAL: First name (e.g., Jhon)',
          example: 'John',
        },
        lastName: {
          type: 'string',
          description: 'OPTIONAL: Last name (e.g., Doe)',
          example: 'Doe',
        },
        phone: {
          type: 'string',
          description: 'OPTIONAL: Phone number (e.g., +573009876543)',
          example: '+573009876543',
        },
        email: {
          type: 'string',
          description: 'OPTIONAL: Email address (e.g., john.doe@example.com)',
          example: 'john.doe@example.com',
        },
        city: {
          type: 'string',
          description: 'OPTIONAL: City (e.g., Texas)',
          example: 'Texas',
        },
        documentType: {
          type: 'string',
          description:
            'OPTIONAL: Document type - Choose from: CC, CE, PASSPORT, NIT',
          example: 'CE',
          enum: ['CC', 'CE', 'PASSPORT', 'NIT'],
        },
        documentNumber: {
          type: 'string',
          description: 'OPTIONAL: Document number (e.g., 9876543210)',
          example: '9876543210',
        },
        message: {
          type: 'string',
          description: 'OPTIONAL: PQR message/description',
          example: 'Updated complaint description with more details.',
        },
        status: {
          type: 'string',
          description:
            'OPTIONAL: PQR status - Choose from: PROCESSING, COMPLETED',
          example: 'COMPLETED',
          enum: ['PROCESSING', 'COMPLETED'],
        },
      },
      required: [],
    }
  }

  return NextResponse.json(openApiDocument)
}
