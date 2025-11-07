export interface OptionType {
  label: string
  value: string
  image?: string
}

const contributorsOptions: OptionType[] = [
  {
    label: 'Declan Grieve',
    value: 'Declan Grieve',
    image: '/assets/images/avatar/user-1.png',
  },
  {
    label: 'Callum Burston',
    value: 'Callum Burston',
    image: '/assets/images/avatar/user-2.png',
  },
  {
    label: 'Liam White',
    value: 'Liam White',
    image: '/assets/images/avatar/user-3.png',
  },
  {
    label: 'Sophia Adams',
    value: 'Sophia Adams',
    image: '/assets/images/avatar/user-4.png',
  },
  {
    label: 'Ethan Thompson',
    value: 'Ethan Thompson',
    image: '/assets/images/avatar/user-5.png',
  },
  {
    label: 'Ava Wilson',
    value: 'Ava Wilson',
    image: '/assets/images/avatar/user-6.png',
  },
]

const eventType: OptionType[] = [
  { label: 'Offline', value: 'Offline' },
  { label: 'Online', value: 'Online' },
]

const status: OptionType[] = [
  { label: 'Published', value: 'Published' },
  { label: 'Coming Soon', value: 'Coming Soon' },
  { label: 'Expired', value: 'Expired' },
]

export { contributorsOptions, eventType, status }
