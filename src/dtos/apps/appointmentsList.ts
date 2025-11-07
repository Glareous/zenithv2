//appointment List
import { StaticImageData } from 'next/image'

export interface AppointmentList {
  id?: number | undefined
  image: string
  avatarText: string
  patientName: string
  treatmentType: string
  date: string
  startTime: string
  endTime: string
  doctor: string
  status: string
}
export interface OptionType {
  label: string
  value: string
}

export const categoryItems: OptionType[] = [
  { label: 'New', value: 'New' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Confirmed', value: 'Confirmed' },
  { label: 'Completed', value: 'Completed' },
]

export interface AddEditAppointmentsListProps {
  modalState: {
    showAddAppointmentForm: boolean
    showEditAppointmentForm: boolean
  }
  closeModal: (modal: string) => void
  editMode?: boolean
  currentAppointment?: AppointmentList | null
  appointmentList?: AppointmentList[] // Added this property
}
export interface CallPatientsModalProps {
  show: boolean
  patients: {
    image?: string | StaticImageData
    avatarText?: string
    patientName: string
  }
  handleHide: () => void
}
