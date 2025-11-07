import { MegaMenu } from '@src/dtos'

const adminMenu: MegaMenu[] = [
  {
    separator: true,
    title: 'Administration',
    lang: 'administration',
    children: [],
  },
  {
    title: 'Organizations',
    lang: 'organizations',
    icon: 'building-2',
    link: '/admin/organizations',
    separator: false,
  },
  // Aquí puedes agregar más opciones de administración en el futuro
  // {
  //   title: 'Users Management',
  //   lang: 'users-management',
  //   icon: 'users',
  //   link: '/admin/users',
  //   separator: false,
  // },
  // {
  //   title: 'System Settings',
  //   lang: 'system-settings',
  //   icon: 'settings',
  //   link: '/admin/settings',
  //   separator: false,
  // },
]

export { adminMenu }
