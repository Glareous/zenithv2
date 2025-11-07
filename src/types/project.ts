export interface Project {
  id: string
  name: string
  description?: string | null
  status: 'CREATED' | 'ACTIVE' | 'COMPLETED'
  revenue?: number | null
  createdAt: Date
  updatedAt: Date
  _count: {
    products: number
    agents: number
  }
  createdBy: {
    id: string
    firstName: string
    lastName: string
    email: string | null
  }
}
