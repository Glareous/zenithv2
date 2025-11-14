import { MegaMenu } from '@src/dtos'

const menu: MegaMenu[] = [
  {
    separator: true,
    title: 'Dashboards',
    lang: 'pe-dashboards',
    children: [],
  },
  {
    title: 'Dashboards',
    lang: 'pe-dashboards',
    icon: 'gauge',
    link: '/dashboards/ecommerce',
  },
  {
    title: 'Projects',
    lang: 'pe-projects',
    icon: 'monitor',
    link: '/apps/projects/grid',
    separator: false,
  },
  {
    title: 'Ecommerce',
    lang: 'pe-ecommerce',
    icon: 'shopping-bag',
    link: '#',
    separator: false,
    children: [
      {
        title: 'Products',
        link: '#',
        lang: 'pe-products',
        children: [
          {
            title: 'Products List',
            lang: 'products-list',
            link: '/apps/ecommerce/products/list',
            dropdownPosition: null,
            children: [],
          },
          {
            title: 'Products Grid',
            lang: 'products-grid',
            link: '/apps/ecommerce/products/grid',
            dropdownPosition: null,
            children: [],
          },
          {
            title: 'Create Product',
            lang: 'create-product',
            link: '/apps/ecommerce/products/create-products',
            dropdownPosition: null,
            children: [],
          },
          {
            title: 'Warehouse',
            lang: 'warehouse',
            link: '/apps/ecommerce/products/warehouse',
            dropdownPosition: null,
            children: [],
          },
        ],
      },
      {
        title: 'Service',
        lang: 'service',
        link: '#',
        children: [
          {
            title: 'Services List',
            lang: 'Services List',
            link: '/apps/service/list',
            dropdownPosition: null,
            children: [],
          },
          {
            title: 'Create Service',
            lang: 'Create Service',
            link: '/apps/service/create-service',
            dropdownPosition: null,
            children: [],
          },
        ],
      },
      {
        title: 'Customers',
        link: '#',
        lang: 'pe-customers',
        children: [
          {
            title: 'Customers List',
            lang: 'customers-list',
            link: '/apps/ecommerce/customer/list',
            dropdownPosition: null,
            children: [],
          },
        ],
      },
      {
        title: 'Category',
        lang: 'Category',
        link: '/apps/category',
      },
    ],
  },

  {
    title: 'Orders',
    lang: 'orders',
    icon: 'mail',
    link: '/apps/orders',
    separator: false,
    children: [
      {
        title: 'Orders List',
        lang: 'Orders List',
        link: '/apps/orders/list',
        dropdownPosition: null,
        children: [],
      },
      {
        title: 'Create Order',
        lang: 'Create Order',
        link: '/apps/orders/create-order',
        dropdownPosition: null,
        children: [],
      },
    ],
  },

  /*  {
    title: 'CHAT',
    lang: 'pe-chat',
    icon: 'messages-square',
    link: '/apps/chat',
    separator: false,
    children: [
      {
        title: 'Chat view',
        link: '/apps/chat/default',
        lang: 'Chat view',
      },
      {
        title: 'Chat Agent',
        link: '/apps/agents',
        lang: 'Chat Agent',
      },
    ],
  }, */
  {
    title: 'CRM',
    lang: 'pe-crm',
    icon: 'shapes',
    link: '/apps/crm/default',
    separator: false,
    children: [
      {
        title: 'Lead',
        link: '/apps/crm/lead',
        lang: 'Lead',
      },
      {
        title: 'Contact',
        link: '/apps/crm/contact',
        lang: 'Contact',
      },
      {
        title: 'Deal',
        link: '/apps/crm/deal',
        lang: 'Deal',
      },
    ],
  },
  {
    title: 'Agents',
    lang: 'pe-agents',
    icon: 'bot',
    link: '/apps/agents/default',
    separator: false,
  },
  {
    title: 'Models',
    lang: 'pe-models',
    icon: 'dna',
    link: '/apps/models',
    separator: false,
  },
  {
    title: 'PQR',
    lang: 'pe-pqr',
    icon: 'users-round',
    link: '/apps/pqr',
    separator: false,
    children: [
      {
        title: 'Create-view',
        link: '/apps/pqr/pqr-list',
        lang: 'Create-view',
      },
      {
        title: 'Landing',
        link: '/apps/pqr/landing',
        lang: 'Landing',
      },
      {
        title: 'Documentation',
        link: '/docs/pqr',
        lang: 'Documentation',
      },
      {
        title: 'Pqr Agent',
        link: '/apps/agents',
        lang: 'Pqr Agent',
      },
    ],
  },
  {
    title: 'FORECASTING',
    lang: 'pe-forecasting',
    icon: 'table-2',
    link: '/apps/forecasting',
    separator: false,
    children: [
      {
        title: 'Create-view',
        link: '/apps/forecasting/forecasting-list',
        lang: 'Create-view',
      },
      {
        title: 'Landing',
        link: '/apps/forecasting/landing',
        lang: 'Landing',
      },
      {
        title: 'Documentation',
        link: '/docs/forecasting',
        lang: 'Documentation',
      },
      {
        title: 'Forecasting Agent',
        link: '/apps/agents',
        lang: 'Forecasting Agent',
      },
    ],
  },
  {
    title: 'RRHH',
    lang: 'pe-rrhh',
    icon: 'users-round',
    link: '/apps/rrhh/',
    separator: false,
    children: [
      {
        title: 'Create-view',
        lang: 'Create-view',
        link: '/apps/rrhh/rrhh-list',
      },
      {
        title: 'Landing',
        link: '/apps/rrhh/landing',
        lang: 'Landing',
      },
      {
        title: 'Documentation',
        link: '/docs/rrhh',
        lang: 'Documentation',
      },
      {
        title: 'RRHH Agent',
        link: '/apps/agents',
        lang: 'RRHH Agent',
      },
      {
        title: 'Chat',
        link: '/apps/chat/default',
        lang: 'Chat',
      },
    ],
  },
  {
    title: 'API Keys',
    lang: 'pe-api-keys',
    icon: 'box',
    link: '/api-keys',
    separator: false,
    isProjectIndependent: true,
  },
  {
    title: 'Actions',
    lang: 'pe-actions',
    icon: 'life-buoy',
    link: '/page/dashboard-actions',
    separator: false,
  },
  {
    title: 'Phone Numbers',
    lang: 'pe-phoneNumbers',
    icon: 'phone',
    link: '/apps/phoneNumbers',
    separator: false,
  },
]

export { menu }
