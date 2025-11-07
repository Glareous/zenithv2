// crm deal --------------------------------
export interface DealItem {
  id: number
  image: string
  projectName: string
  createDate: string
  endDate: string
  amount: string
  company: string
  content: string
  status: string
  userimage: string
  messages: DealMessage[]
}

export interface DealMessage {
  id: number
  sender: 'agent' | 'user'
  text: string
}

export interface callModalItem {
  open: boolean
  closeModal: () => void
  selectedDeal: DealItem | null
}
export interface messageModalItem {
  messageOpen: boolean
  closeModal: () => void
  selectedDeal: DealItem | null
  handleOpenModal: (deal: DealItem) => void
}
