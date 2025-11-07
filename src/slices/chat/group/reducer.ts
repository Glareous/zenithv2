import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { GroupChatMessage, GroupChatRecord } from '@src/dtos'
import { initStore } from '@src/utils/init_store'

interface DefaultChatState {
  groupChatList: GroupChatRecord[] | null
  isLoading: boolean
  currentGroupChatRecord: GroupChatRecord | null
}

const initialState: DefaultChatState = {
  groupChatList: initStore('d-group-chat') as GroupChatRecord[] | null,
  isLoading: false,
  currentGroupChatRecord: null,
}

const ListSlice = createSlice({
  name: 'group_chat_list',
  initialState,
  reducers: {
    // get default chat list
    getGroupChatList(state, action: PayloadAction<GroupChatRecord[]>) {
      state.groupChatList = action.payload
    },

    // set current chat record
    setCurrentGroupChatRecord(state, action: PayloadAction<GroupChatRecord>) {
      state.currentGroupChatRecord = action.payload
    },

    // delete default chat record
    deleteGroupChatListRecord(state, action: PayloadAction<number[]>) {
      if (state.groupChatList !== null) {
        state.groupChatList = state.groupChatList.filter(
          (item) => !action.payload.includes(item.id)
        )
        state.currentGroupChatRecord =
          state.groupChatList[action.payload[0] - 1]
      }
    },

    // edit chat record
    editGroupChatListRecord(state, action: PayloadAction<GroupChatRecord>) {
      const chat = action.payload
      if (state.groupChatList !== null) {
        const findChatIndex = state.groupChatList.findIndex(
          (item) => item.id === chat.id
        )
        if (findChatIndex !== -1) {
          state.groupChatList[findChatIndex] = chat
          state.currentGroupChatRecord = chat
        }
      }
    },

    // add customer product list
    addGroupChatListRecord(state, action: PayloadAction<GroupChatRecord>) {
      const newGroupChat = action.payload
      if (state.groupChatList !== null) {
        state.groupChatList.unshift(newGroupChat)
        state.currentGroupChatRecord = newGroupChat
      } else {
        state.groupChatList = [newGroupChat]
        state.currentGroupChatRecord = newGroupChat
      }
    },

    // delete message record
    deleteGroupChatMessage(
      state,
      action: PayloadAction<{ id: number; message: GroupChatMessage }>
    ) {
      const { id, message } = action.payload
      if (state.groupChatList !== null) {
        const findRecordIndex = state.groupChatList.findIndex(
          (item: GroupChatRecord) => item.id === id
        )
        const findRecord = state.groupChatList.find(
          (item: GroupChatRecord) => item.id === id
        )
        if (findRecordIndex !== -1 && findRecord) {
          const updatedMessages =
            findRecord.messages.filter(
              (msg: GroupChatMessage) => msg.id !== message.id
            ) || []
          state.groupChatList[findRecordIndex] = {
            ...findRecord,
            messages: updatedMessages,
          }
          state.currentGroupChatRecord = {
            ...findRecord,
            messages: updatedMessages,
          }
        }
      }
    },

    // add new message
    addNewGroupChatMessage(
      state,
      action: PayloadAction<{ id: number; message: GroupChatMessage }>
    ) {
      const { id, message } = action.payload
      if (state.groupChatList !== null) {
        const findRecordIndex = state.groupChatList.findIndex(
          (item: GroupChatRecord) => item.id === id
        )
        const findRecord = state.groupChatList.find(
          (item: GroupChatRecord) => item.id === id
        )
        if (findRecordIndex !== -1 && findRecord) {
          const updatedMessages = [...findRecord.messages, message]
          state.groupChatList[findRecordIndex] = {
            ...findRecord,
            messages: updatedMessages,
          }
          state.currentGroupChatRecord = {
            ...findRecord,
            messages: updatedMessages,
          }
        }
      }
    },
  },
})

export const {
  getGroupChatList,
  setCurrentGroupChatRecord,
  deleteGroupChatListRecord,
  editGroupChatListRecord,
  addGroupChatListRecord,
  deleteGroupChatMessage,
  addNewGroupChatMessage,
} = ListSlice.actions
export default ListSlice.reducer
