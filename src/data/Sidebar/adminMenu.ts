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
  {
    title: 'Agents',
    lang: 'agents',
    icon: 'bot',
    link: '/admin/agents',
    separator: false,
  },
  {
    title: 'Actions',
    lang: 'pe-actions',
    icon: 'life-buoy',
    link: '/admin/dashboard-actions',
    separator: false,
  },
  {
    title: 'Models',
    lang: 'pe-models',
    icon: 'dna',
    link: '/admin/models',
    separator: false,
  },
]

export { adminMenu }
