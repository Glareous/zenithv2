import { StaticImageData } from 'next/image'

// employee salary
export interface employeeSalary {
  id: number
  employeeName: string
  email: string
  phoneNumber: string
  department: string
  monthlySalary: string
  status: string
  image?: StaticImageData
}
