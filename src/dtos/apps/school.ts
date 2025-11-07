import { StaticImageData } from 'next/image'

export interface OptionType {
  label: string
  value: string
}

export const difficult: OptionType[] = [
  { label: 'Normal', value: 'Normal' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Hard', value: 'Hard' },
]

export const questionTypee: OptionType[] = [
  { label: 'MCQ', value: 'MCQ' },
  { label: 'Q & A', value: 'Q & A' },
]

export const statusOptions: OptionType[] = [
  { label: 'New', value: 'New' },
  { label: 'Old', value: 'Old' },
]
export interface OverViewModalProps {
  show: boolean
  handleHide: () => void
  book: {
    id: number
    question: string
    options: string[]
  } | null
}

export const categoryItems: OptionType[] = [
  { label: 'All', value: 'All' },
  { label: 'MCQ', value: 'MCQ' },
  { label: 'Q & A', value: 'Q & A' },
  { label: 'Hard', value: 'Hard' },
  { label: 'Normal', value: 'Normal' },
  { label: 'Medium', value: 'Medium' },
]
export const bookType: OptionType[] = [
  { label: 'Newest', value: 'Newest' },
  { label: 'Oldest', value: 'Oldest' },
  { label: 'Popular Book', value: 'Popular Book' },
  { label: 'Best Sales', value: 'Best Sales' },
]
export interface OverviewModalProps {
  show: boolean
  handleHide: () => void
  book: {
    image?: string | StaticImageData
    rating: number
    reviewCount: string // Update the type to string
    author: string
    price: number | string
  }
}
export const bookTypes: OptionType[] = [
  { label: 'All', value: 'All' },
  { label: 'Newest', value: 'Newest' },
  { label: 'Oldest', value: 'Oldest' },
  { label: 'Popular Book', value: 'Popular Book' },
  { label: 'Best Sales', value: 'Best Sales' },
]
export const gender: OptionType[] = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
]
export const studentStd: OptionType[] = [
  { label: '12 (A)', value: '12 (A)' },
  { label: '12 (B)', value: '12 (B)' },
  { label: '11 (A)', value: '11 (A)' },
  { label: '11 (B)', value: '11 (B)' },
  { label: '10 (A)', value: '10 (A)' },
  { label: '10 (B)', value: '10 (B)' },
  { label: '9', value: '9' },
  { label: '8', value: '8' },
]
export const categoryItem: OptionType[] = [
  { label: 'Teacher', value: 'Teacher' },
  { label: 'Professor', value: 'Professor' },
  { label: 'Assistant', value: 'Assistant' },
  { label: 'Lecturer', value: 'Lecturer' },
  { label: 'Instructor', value: 'Instructor' },
  { label: 'Senior Lecturer', value: 'Senior Lecturer' },
  { label: 'Associate Professor', value: 'Associate Professor' },
  { label: 'Assistant Professor', value: 'Assistant Professor' },
]

export const category: OptionType[] = [
  { label: 'All', value: 'all' },
  { label: 'Status', value: 'status' },
  { label: 'Taxes', value: 'taxes' },
  { label: 'Teachers', value: 'teacherName' },
]

export const studentsStd: OptionType[] = [
  { label: 'All', value: 'All' },
  { label: 'STD 12', value: '12' },
  { label: 'STD 11', value: '11' },
  { label: 'STD 10', value: '10' },
  { label: 'STD 9', value: '9' },
  { label: 'STD 8', value: '8' },
  { label: 'STD 7', value: '7' },
  { label: 'STD 6', value: '6' },
]

export const timeDuration: OptionType[] = [
  { label: 'All', value: 'All' },
  { label: 'Today', value: 'Today' },
  { label: 'Tomorrow', value: 'Tomorrow' },
  { label: 'Weekly', value: 'Weekly' },
  { label: 'Monthly', value: 'Monthly' },
  { label: 'Yearly', value: 'Yearly' },
]
export const status: OptionType[] = [
  { label: 'Paid', value: 'Paid' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Unpaid', value: 'Unpaid' },
]

export const genderOptions: OptionType[] = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Others', value: 'Others' },
]
