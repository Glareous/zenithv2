import { MegaMenu } from '@src/dtos'

interface Organization {
  id: string
  name: string
  allowedPages?: string[] | null
  agentPqrId?: string | null
  agentRrhhId?: string | null
  agentForecastingId?: string | null
  agentRrhhChatId?: string | null
  agentAdvisorChatId?: string | null
  agentAdvisorId?: string | null
  agentLeadsId?: string | null
}

/**
 * Filter menu items based on organization's allowed pages and update agent links
 * @param menu - Full menu array
 * @param allowedPages - Array of allowed page categories
 * @param organization - Organization data with agent IDs (optional)
 * @returns Filtered and updated menu array
 */
export function filterMenuByAllowedPages(
  menu: MegaMenu[],
  allowedPages: string[] | null | undefined,
  organization?: Organization | null
): MegaMenu[] {
  // If no restrictions, return full menu (but still update agent links if organization provided)
  const shouldFilter = allowedPages && allowedPages.length > 0

  // Map of menu items to their category slugs
  const menuCategoryMap: { [key: string]: string } = {
    Dashboards: 'dashboards',
    Projects: 'projects',
    Ecommerce: 'ecommerce',
    RRHH: 'rrhh',
    Orders: 'orders',
    Chat: 'chat',
    CRM: 'crm',
    Agents: 'agents',
    Models: 'models',
    PQR: 'pqr',
    FORECASTING: 'forecasting',
    'DIGITAL ADVISOR': 'advisor',
    LEADS: 'leads',
    'NVIDIA - NIM FRAUD': 'nim-fraud',
    'API Keys': 'api-keys',
    Actions: 'actions',
    'Phone Numbers': 'phone-numbers',
  }

  const filteredMenu = shouldFilter
    ? menu.filter((menuItem) => {
        // Keep separators
        if (menuItem.separator && !menuItem.title) {
          return true
        }

        // Check if this menu item's category is allowed
        const categorySlug = menuCategoryMap[menuItem.title]

        if (!categorySlug) {
          // If no mapping found, include by default (for backwards compatibility)
          return true
        }

        return allowedPages.includes(categorySlug)
      })
    : menu

  // Update agent links if organization data is provided
  if (!organization) {
    return filteredMenu
  }

  return filteredMenu.map((menuItem) => {
    // Deep clone to avoid mutating original menu
    const clonedItem = JSON.parse(JSON.stringify(menuItem)) as MegaMenu

    // Update agent links in children
    if (clonedItem.children && clonedItem.children.length > 0) {
      clonedItem.children = clonedItem.children.map((child) => {
        // Check if this is an agent link and update it
        if (child.lang === 'Pqr Agent' && organization.agentPqrId) {
          return {
            ...child,
            link: `/apps/agents/default/${organization.agentPqrId}/configure`,
          }
        }
        if (child.lang === 'RRHH Agent' && organization.agentRrhhId) {
          return {
            ...child,
            link: `/apps/agents/default/${organization.agentRrhhId}/configure`,
          }
        }
        if (
          child.title === 'Forecasting Agent' &&
          organization.agentForecastingId
        ) {
          return {
            ...child,
            link: `/apps/agents/default/${organization.agentForecastingId}/configure`,
          }
        }
        if (child.lang === 'RRHH Chat Agent' && organization.agentRrhhChatId) {
          return {
            ...child,
            link: `/apps/agents/default/${organization.agentRrhhChatId}/configure`,
          }
        }
        if (child.lang === 'Advisor Chat Agent' && organization.agentAdvisorChatId) {
          return {
            ...child,
            link: `/apps/agents/default/${organization.agentAdvisorChatId}/configure`,
          }
        }
        if (child.lang === 'Advisor Agent' && organization.agentAdvisorId) {
          return {
            ...child,
            link: `/apps/agents/default/${organization.agentAdvisorId}/configure`,
          }
        }
        if (child.lang === 'Leads Agent' && organization.agentLeadsId) {
          return {
            ...child,
            link: `/apps/agents/default/${organization.agentLeadsId}/configure`,
          }
        }
        return child
      })
    }

    return clonedItem
  })
}
