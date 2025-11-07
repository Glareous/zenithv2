import { StaticImageData } from 'next/image'

import {
  CircleCheckBig,
  Cross,
  Dessert,
  Hourglass,
  LucideProps,
} from 'lucide-react'

export const iconMapping: Record<string, React.ComponentType<LucideProps>> = {
  Dessert: Dessert,
  Cross: Cross,
  Hourglass: Hourglass,
  CircleCheckBig: CircleCheckBig,
}

export interface TaskTableProps {
  tasks: Array<{
    taskName: string
    createDate: string
    assignees: string[] | StaticImageData[]
    status: string
    priority: string
  }>
  itemsPerPage: number
  currentPage: number
}
