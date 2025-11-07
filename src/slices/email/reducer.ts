import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { Email } from '@src/dtos'
import { initStore } from '@src/utils/init_store'

interface MailState {
  mail: Email[]
  isLoading: boolean
  currentEmail: Email | null
}

const initialState: MailState = {
  mail: initStore('d-email-list') as Email[],
  isLoading: false,
  currentEmail: null,
}

const ProjectSlice = createSlice({
  name: 'mail',
  initialState,
  reducers: {
    // get mails data
    getMail(state, action) {
      state.mail = action.payload
    },

    // add mail list record
    addMail(state, action: PayloadAction<Email>) {
      const newMailRecord = action.payload
      if (state.mail !== null) {
        state.mail.unshift(newMailRecord)
      } else {
        state.mail = [newMailRecord]
      }
    },

    // delete mail list record
    deleteMail(state, action: PayloadAction<number[]>) {
      if (state.mail !== null) {
        state.mail = state.mail.filter(
          (item) => !action.payload.includes(item.id)
        )
      }
    },

    // update mail list
    editMail(state, action: PayloadAction<Email>) {
      const mailRecord = action.payload
      if (state.mail !== null) {
        const findMailIndex = state.mail.findIndex(
          (item) => item.id === mailRecord.id
        )
        if (findMailIndex !== -1) {
          state.mail[findMailIndex] = mailRecord
        }
      }
    },

    setCurrentEmail(state, action: PayloadAction<Email>) {
      state.currentEmail = action.payload
    },
  },
})

export const { getMail, addMail, deleteMail, editMail, setCurrentEmail } =
  ProjectSlice.actions
export default ProjectSlice.reducer
