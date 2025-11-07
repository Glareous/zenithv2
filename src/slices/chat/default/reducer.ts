import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { UserChatMessageRecord, UserChatRecord } from '@src/dtos'
import { initStore } from '@src/utils/init_store'

interface DefaultChatState {
  defaultChatList: UserChatRecord[] | null
  isLoading: boolean
  currentContactChat: UserChatRecord | null
}

const initialState: DefaultChatState = {
  defaultChatList: initStore('d-default-chat') as UserChatRecord[] | null,
  isLoading: false,
  currentContactChat: null,
}

const ListSlice = createSlice({
  name: 'default_chat_list',
  initialState,
  reducers: {
    // get default chat list
    getChatList(state, action: PayloadAction<UserChatRecord[]>) {
      state.defaultChatList = action.payload
    },

    // set current chat record
    setCurrentChatRecord(state, action: PayloadAction<UserChatRecord>) {
      state.currentContactChat = action.payload
    },

    // delete default chat record
    deleteDefaultChatListRecord(state, action: PayloadAction<number[]>) {
      if (state.defaultChatList !== null) {
        state.defaultChatList = state.defaultChatList.filter(
          (item) => !action.payload.includes(item.id)
        )
        state.currentContactChat = state.defaultChatList[action.payload[0] - 1]
      }
    },

    // edit chat record
    editDefaultChatListRecord(state, action: PayloadAction<UserChatRecord>) {
      const chat = action.payload
      if (state.defaultChatList !== null) {
        const findChatIndex = state.defaultChatList.findIndex(
          (item) => item.id === chat.id
        )
        if (findChatIndex !== -1) {
          state.defaultChatList[findChatIndex] = chat
          state.currentContactChat = chat
        }
      }
    },

    // add customer product list
    addChatListRecord(state, action: PayloadAction<UserChatRecord>) {
      const newContact = action.payload
      if (state.defaultChatList !== null) {
        state.defaultChatList.unshift(newContact)
        state.currentContactChat = newContact
      } else {
        state.defaultChatList = [newContact]
        state.currentContactChat = newContact
      }
    },

    // delete message record
    deleteChatMessageRecord(
      state,
      action: PayloadAction<{ id: number; message: UserChatMessageRecord }>
    ) {
      const { id, message } = action.payload
      if (state.defaultChatList !== null) {
        const findRecordIndex = state.defaultChatList.findIndex(
          (item: UserChatRecord) => item.id === id
        )
        const findRecord = state.defaultChatList.find(
          (item: UserChatRecord) => item.id === id
        )
        if (findRecordIndex !== -1 && findRecord) {
          const updatedMessages =
            findRecord.messages.filter(
              (msg: UserChatMessageRecord) => msg.id !== message.id
            ) || []
          state.defaultChatList[findRecordIndex] = {
            ...findRecord,
            messages: updatedMessages,
          }
          state.currentContactChat = {
            ...findRecord,
            messages: updatedMessages,
          }
        }
      }
    },

    // add new message
    addChatNewMessageRecord(
      state,
      action: PayloadAction<{ id: number; message: UserChatMessageRecord }>
    ) {
      const { id, message } = action.payload
      if (state.defaultChatList !== null) {
        const findRecordIndex = state.defaultChatList.findIndex(
          (item: UserChatRecord) => item.id === id
        )
        const findRecord = state.defaultChatList.find(
          (item: UserChatRecord) => item.id === id
        )
        if (findRecordIndex !== -1 && findRecord) {
          const updatedMessages = [...findRecord.messages, message]
          state.defaultChatList[findRecordIndex] = {
            ...findRecord,
            messages: updatedMessages,
          }
          state.currentContactChat = {
            ...findRecord,
            messages: updatedMessages,
          }
        }
      }
    },
  },
})

export const {
  getChatList,
  setCurrentChatRecord,
  deleteDefaultChatListRecord,
  editDefaultChatListRecord,
  addChatListRecord,
  deleteChatMessageRecord,
  addChatNewMessageRecord,
} = ListSlice.actions
export default ListSlice.reducer
