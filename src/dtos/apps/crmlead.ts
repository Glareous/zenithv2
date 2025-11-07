export interface LeadItem {
  id: number
  image: string
  name: string
  date: string
  time: string
  email: string
  phoneNumber: string
  status: string
}
export interface ModalState {
  showAddLeadForm: boolean
  showEditLeadForm: boolean
}

export interface LeadModalProps {
  modalState: ModalState
  closeModal: (modal: string) => void
  leadList: LeadItem[]
  editMode?: boolean
  currentLead?: LeadItem | null
}

export interface OptionType {
  label: string
  value: string
}

export const statusOptions: OptionType[] = [
  { label: 'New', value: 'New' },
  { label: 'Hot', value: 'Hot' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Lost', value: 'Lost' },
]
