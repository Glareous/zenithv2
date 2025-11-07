import { StaticImageData } from 'next/image'

export interface StudentList {
  id: number
  studentId: string
  studentName: string
  middleName: string
  lastName: string
  gender: string
  rollNo: string
  age: string
  class: string
  email: string
  phone: string
  alternativePhone: string
  nationality: string
  birthDate: string
  address: string
  city: string
  country: string
  date: string
  pinCode: string
  image?: string | StaticImageData
}
