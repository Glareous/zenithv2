import { GroupChatMessage, GroupChatRecord } from '@src/dtos'
import { AppDispatch } from '@src/slices/reducer'
import api, { customDelete, customPost, customPut } from '@src/utils/axios_api'
import {
  LocalStorageRecord,
  addLocalStorageRecord,
  createLocalStorage,
  deleteLocalStorageRecord,
  getLocalStorage,
  updateLocalStorageRecord,
} from '@src/utils/crud_functions'
import { NEXT_PUBLIC_GROUP_CHAT_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import {
  addGroupChatListRecord,
  addNewGroupChatMessage,
  deleteGroupChatListRecord,
  deleteGroupChatMessage,
  editGroupChatListRecord,
  getGroupChatList,
  setCurrentGroupChatRecord,
} from './reducer'

const DEFAULT_GROUP_CHAT_LIST_API = NEXT_PUBLIC_GROUP_CHAT_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get customer list
export const getGroupChatData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = (await getLocalStorage('d-group-chat')) as
        | GroupChatRecord[]
        | null
      if (!responseData) {
        const response = await api.get(DEFAULT_GROUP_CHAT_LIST_API)
        const { data } = response
        createLocalStorage('d-group-chat', data)
        dispatch(getGroupChatList(data))
      } else {
        dispatch(getGroupChatList(responseData || []))
      }
    } else {
      const response = await api.get(DEFAULT_GROUP_CHAT_LIST_API)
      const { data } = response
      dispatch(getGroupChatList(data))
    }
  } catch (error) {
    let errorMessage = 'Group Chat List Fetch Failed'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
      toast.error(errorMessage, { autoClose: 3000 })
    }
    console.error('Group Chat List Fetch Failed:', error)
  }
}

// set current chat record
export const setCurrentGroupChatListRecord =
  (chat: GroupChatRecord) => async (dispatch: AppDispatch) => {
    try {
      const response = { data: chat }
      dispatch(setCurrentGroupChatRecord(response.data))
    } catch (error) {
      console.error('Error setting current chat record:', error)
    }
  }

// add new Chat
export const addGroupChatRecordData =
  (newRecord: GroupChatRecord) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(
        DEFAULT_GROUP_CHAT_LIST_API,
        newRecord,
        'Group Chat'
      )
      const { data, message } = response
      toast.success(message || 'Chat record added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-group-chat', { ...data })
      dispatch(addGroupChatListRecord(data))
    } catch (error) {
      let errorMessage = 'Group Chat record addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Group Chat record addition failed:', error)
    }
  }

// delete current chat
export const deleteGroupChatRecordData =
  (chat: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = chat.map(async (id: number) => {
        const response = await customDelete(
          DEFAULT_GROUP_CHAT_LIST_API,
          id,
          'Group Chat'
        )
        const { message, data } = response
        toast.success(message || 'Group Chat record deleted successfully', {
          autoClose: 3000,
        })
        return data
      })
      const deletedCustomers = await Promise.all(deletePromises)
      dispatch(deleteGroupChatListRecord(deletedCustomers))
      deleteLocalStorageRecord({
        key: 'd-group-chat',
        listRecord: chat,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'Group Chat record deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Group Chat record deletion failed:', error)
    }
  }

// edit customer record
export const editGroupChatListRecordData =
  (chat: GroupChatRecord) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(
        DEFAULT_GROUP_CHAT_LIST_API,
        chat,
        'Group Chat'
      )
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-group-chat',
        data as unknown as LocalStorageRecord
      )
      dispatch(editGroupChatListRecord(data))
    } catch (error) {
      let errorMessage = 'Group Chat record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Group Chat record updation failed:', error)
    }
  }

// add new message
export const addGroupChatMessageRecord =
  (userid: number, newMessage: GroupChatMessage) =>
  async (dispatch: AppDispatch) => {
    try {
      const response = { id: userid, message: newMessage }
      dispatch(
        addNewGroupChatMessage({ id: response.id, message: response.message })
      )
    } catch (error) {
      let errorMessage = 'Chat record addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Chat record addition failed:', error)
    }
  }

// delete message
export const deleteGroupChatMessageRecord =
  (userid: number, deletedMessage: GroupChatMessage) =>
  async (dispatch: AppDispatch) => {
    try {
      const response = { id: userid, message: deletedMessage }
      dispatch(
        deleteGroupChatMessage({ id: response.id, message: response.message })
      )
    } catch (error) {
      let errorMessage = 'Error deleting record'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Error deleting record:', error)
    }
  }
