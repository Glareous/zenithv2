import { StaticImageData } from 'next/image'

import user12 from '@assets/images/avatar/user-12.png'
import user14 from '@assets/images/avatar/user-14.png'
import user15 from '@assets/images/avatar/user-15.png'
import user16 from '@assets/images/avatar/user-16.png'
import user17 from '@assets/images/avatar/user-17.png'
import user18 from '@assets/images/avatar/user-18.png'

export interface OptionType {
  label: string
  value: string
}

const statusOptions: OptionType[] = [
  { label: 'Active', value: 'Active' },
  { label: 'Pending', value: 'Pending' },
  { label: 'On Hold', value: 'On Hold' },
  { label: 'Completed', value: 'Completed' },
]

const assigneeOptions: OptionType[] = [
  { value: 'Max Boucaut', label: 'Max Boucaut' },
  { value: 'Poppy Dalley', label: 'Poppy Dalley' },
  { value: 'Ethan Zahel', label: 'Ethan Zahel' },
  { value: 'Lucas Griffin', label: 'Lucas Griffin' },
  { value: 'Ryan Frazer', label: 'Ryan Frazer' },
  { value: 'Natasha Tegg', label: 'Natasha Tegg' },
]
const assigneeImages: Record<string, string | StaticImageData> = {
  'Max Boucaut': user14,
  'Poppy Dalley': user17,
  'Ethan Zahel': user16,
  'Lucas Griffin': user12,
  'Ryan Frazer': user18,
  'Natasha Tegg': user15,
}
const filterOptions = [
  { label: 'Weekly', value: 'Weekly' },
  { label: 'Monthly', value: 'Monthly' },
  { label: 'Yearly', value: 'Yearly' },
]

export interface AssigneeType {
  id: string
  name: string
  image: StaticImageData | string
}

const assignee: AssigneeType[] = [
  {
    id: 'assigneeToMax',
    name: 'Max Boucaut',
    image: user14,
  },
  {
    id: 'assigneeTonatasha',
    name: 'Natasha Tegg',
    image: user15,
  },
  {
    id: 'assigneeToEthan',
    name: 'Ethan Zahel',
    image: user16,
  },
  {
    id: 'assigneeToPoppy',
    name: 'Poppy Dalley',
    image: user17,
  },
  {
    id: 'assigneeToRyan',
    name: 'Ryan Frazer',
    image: user18,
  },
  {
    id: 'assigneeToJulian',
    name: 'Julian Marconi',
    image: user12,
  },
]
export {
  statusOptions,
  assigneeImages,
  assigneeOptions,
  assignee,
  filterOptions,
}
