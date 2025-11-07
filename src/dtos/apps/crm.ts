// crm contact --------------------------------
export interface CrmContactItems {
  id: number
  contact_id: string
  image: string
  contactName: string
  phoneNumber: string
  company: string
  role: string
  email: string
  website: string
  status: string
}

export interface ModalState {
  showAddContactForm: boolean
  showEditContactForm: boolean
}

export interface AddEditCrmContactProps {
  modalState: ModalState
  closeModal: (key?: string) => void
  contactList: CrmContactItems[]
  editMode?: boolean
  currentContact?: CrmContactItems | null
}

export interface OptionType {
  label: string
  value: string
}

export const statusOptions: OptionType[] = [
  { label: 'Customer', value: 'Customer' },
  { label: 'Personal', value: 'Personal' },
  { label: 'Employee', value: 'Employee' },
  { label: 'Marketing', value: 'Marketing' },
]
