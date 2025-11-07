import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { CrmContactItems } from '@src/dtos/apps/crm'
import { initStore } from '@src/utils/init_store'

interface ContactState {
  contact: CrmContactItems[]
  isLoading: boolean
}

const initialState: ContactState = {
  contact: initStore('d-crm-contact-list') as CrmContactItems[],
  isLoading: false,
}

const ContactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    // get contact list data
    getContactList(state, action: PayloadAction<CrmContactItems[]>) {
      state.contact = action.payload
    },

    // delete contact list
    deleteContactList(state, action: PayloadAction<number[]>) {
      if (state.contact !== null) {
        state.contact = state.contact.filter(
          (item) => !action.payload.includes(item.id)
        )
      }
    },

    // edit contact list
    editContactList(state, action: PayloadAction<CrmContactItems>) {
      const contact = action.payload
      if (state.contact !== null) {
        const findContactIndex = state.contact.findIndex(
          (item) => item.id === contact.id
        )
        const findContactRecord = state.contact.find(
          (item) => item.id === contact.id
        )
        if (findContactIndex !== -1 && findContactRecord) {
          state.contact[findContactIndex] = contact
        }
      }
    },

    // add contact list
    addContactList(state, action: PayloadAction<CrmContactItems>) {
      const newContact = action.payload
      if (state.contact !== null) {
        state.contact.unshift(newContact)
      } else {
        state.contact = [newContact]
      }
    },
  },
})

export const {
  getContactList,
  addContactList,
  editContactList,
  deleteContactList,
} = ContactSlice.actions
export default ContactSlice.reducer
