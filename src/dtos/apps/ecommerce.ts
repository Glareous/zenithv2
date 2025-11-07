import { CustomerRecord } from './customer'

export interface OptionType {
  label: string
  value: string
}

export interface ModalState {
  showAddCustomerForm: boolean
  showEditCustomerForm: boolean
}

export interface AddNewCustomerPropsModal {
  modalState: ModalState
  closeModal: (key: string) => void
  customerList: CustomerRecord[]
  editMode: boolean
  currentCustomer: CustomerRecord | null
}

export const subscribeOptions: OptionType[] = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
]

export const statusOptions: OptionType[] = [
  { label: 'Active', value: 'Active' },
  { label: 'In Active', value: 'Inactive' },
]
export interface OverviewCustomerProps {
  currentCustomer: CustomerRecord | null
  show: boolean
  handleClose: () => void
  editMode: boolean
  handleEditMode: () => void
}
