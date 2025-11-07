import { MegaMenu } from '@src/dtos'

/**
 * Filter menu items based on organization's allowed pages
 * @param menu - Full menu array
 * @param allowedPages - Array of allowed page categories (e.g., ['dashboards', 'ecommerce', 'projects'])
 * @returns Filtered menu array
 */
export function filterMenuByAllowedPages(
  menu: MegaMenu[],
  allowedPages: string[] | null | undefined
): MegaMenu[] {
  // If no restrictions, return full menu
  if (!allowedPages || allowedPages.length === 0) {
    return menu
  }

  // Map of menu items to their category slugs
  const menuCategoryMap: { [key: string]: string } = {
    'Dashboards': 'dashboards',
    'Projects': 'projects',
    'Ecommerce': 'ecommerce',
    'Rrhh': 'rrhh',
    'Orders': 'orders',
    'Chat': 'chat',
    'CRM': 'crm',
    'Agents': 'agents',
    'Models': 'models',
    'PQR': 'pqr',
    'FORECASTING': 'forecasting',
    'API Keys': 'api-keys',
    'Actions': 'actions',
    'Phone Numbers': 'phone-numbers',
  }

  return menu.filter((menuItem) => {
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
}
