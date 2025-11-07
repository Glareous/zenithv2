import { StaticImageData } from 'next/image'

export interface Ticket {
  category: string
  count?: number
}

export interface Tickets {
  id: string
  title: string
  description: string
  time: string
  author: string
  avatar: string | StaticImageData
  tags: string[]
  comments: number
  status: string
}

export interface TicketCategory {
  category: string
  tickets: Tickets[]
}

export interface TicketDetails {
  id: string
  title: string
  description: string
  time: string
  author: string
  avatar: string | StaticImageData
  tags: string[]
  comments: number
  status: string
  replymessages?: string[]
}

export interface FormValues {
  title: string
  projectName: string
  description: string
  keywords: string[]
  assignedTo: string[]
  phone: string
}
export const keywordOptions = [
  { label: 'Help', value: 'Help' },
  { label: 'Design', value: 'Design' },
  { label: 'Customize', value: 'Customize' },
  { label: 'Development', value: 'Development' },
]

export const assignedOptions = [
  { label: 'Patrick Schulz', value: '1' },
  { label: 'Margaret Mann', value: '2' },
  { label: 'Joanne Murray', value: '3' },
  { label: 'Cynthia Justice', value: '4' },
  { label: 'John Jenson', value: '5' },
  { label: 'Mark Welch', value: '6' },
  { label: 'Virginia Dawson', value: '7' },
]
// category
export const tickets: Ticket[] = [
  { category: 'Getting Started', count: 5 },
  { category: 'Account with Card', count: 3 },
  { category: 'Licenses Policy' },
  { category: 'Customize Templates' },
  { category: 'Customize Layouts' },
]
