import { AppointmentList } from './appointmentsList'
import { OptionType } from './crm'
import { Attendance } from './staffattendance'

export interface AppointmentOverViewProps {
  show: boolean
  hideOverviewModal: () => void // Added this line
  handleHide: () => void
  appointment: AppointmentList
  deleteAppointment: (appointment: AppointmentList) => void
  showCallModal: boolean
  handleShowCallModal: () => void
}
export const categoryItems: OptionType[] = [
  { label: 'Pending', value: 'Pending' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Expired', value: 'Expired' },
]
export const Recommendations: OptionType[] = [
  { label: 'N/A', value: 'N/A' },
  { label: 'Follow up required', value: 'Completed' },
  { label: 'Consult with surgron', value: 'In Progress' },
]
export const reportsTypeData: OptionType[] = [
  { label: 'X-Ray', value: 'X-Ray' },
  { label: 'Blood Test', value: 'Blood Test' },
  { label: 'MRI', value: 'MRI' },
  { label: 'CT Scan', value: 'CT Scan' },
  { label: 'Ultrasound', value: 'Ultrasound' },
]
export const categoryItem: OptionType[] = [
  { label: 'Present', value: 'Present' },
  { label: 'Late', value: 'Late' },
  { label: 'Absent', value: 'Absent' },
]
export interface EditAttendanceProps {
  modalState: {
    showEditAttendanceForm: boolean
    showAddAttendanceForm: boolean
  }
  closeModal: (modal: string) => void
  attendanceList: Attendance[]
  editMode?: boolean
  currentAttendance?: Attendance | null
}

export const categoryStatus: OptionType[] = [
  { label: 'Approved', value: 'Approved' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Rejected', value: 'Rejected' },
]

export const leaveTypes: OptionType[] = [
  { label: 'Sick Leave', value: 'Sick Leave' },
  { label: 'Personal', value: 'Personal' },
  { label: 'Vacation', value: 'Vacation' },
  { label: 'Maternity Leave', value: 'Maternity Leave' },
]
