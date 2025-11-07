import { StaticImageData } from 'next/image'

// email
export interface Replys {
  id: number
  sender: string
  email: string
  avatarImage?: string | StaticImageData
  date: string
  subject: string
  message: string
}

export interface Email {
  id: number
  sender: string
  email: string
  date: string
  subject: string
  message: string
  avatarImage?: string | StaticImageData
  avatarText?: string
  avatarColor?: string
  badges: string[]
  type?: string
  replies?: Replys[] // Optional replies array
}
export interface AddComposeModalProps {
  isModalOpen: boolean
  onClose: () => void
  mailList: Email[]
}
export interface EmailsProps {
  filteredEmails: {
    id: string
    avatarColor?: string
    avatarImage?: string
    avatarText?: string
    sender: string
    email: string
    date: string
    subject: string
    message: string
    badges: string[]
  }[]
  handleShowMail: (email: {
    id: string
    avatarColor?: string
    avatarImage?: string
    avatarText?: string
    sender: string
    email: string
    date: string
    subject: string
    message: string
    badges: string[]
  }) => void
}
