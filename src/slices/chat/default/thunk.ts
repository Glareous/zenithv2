import { UserChatMessageRecord, UserChatRecord } from '@src/dtos'
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
import { NEXT_PUBLIC_DEFAULT_CHAT_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import {
  addChatListRecord,
  addChatNewMessageRecord,
  deleteChatMessageRecord,
  deleteDefaultChatListRecord,
  editDefaultChatListRecord,
  getChatList,
  setCurrentChatRecord,
} from './reducer'

const DEFAULT_CHAT_LIST_API = NEXT_PUBLIC_DEFAULT_CHAT_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get customer list
export const getDefaultChatData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = (await getLocalStorage('d-default-chat')) as
        | UserChatRecord[]
        | null
      if (!responseData) {
        const response = await api.get(DEFAULT_CHAT_LIST_API)
        const { data } = response
        createLocalStorage('d-default-chat', data)
        dispatch(getChatList(data))
      } else {
        dispatch(getChatList(responseData || []))
      }
    } else {
      const response = await api.get(DEFAULT_CHAT_LIST_API)
      const { data } = response
      dispatch(getChatList(data))
    }
  } catch (error) {
    let errorMessage = 'Error fetching chat data:'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
      toast.error(errorMessage, { autoClose: 3000 })
    }
    console.error('Error fetching chat data::', error)
  }
}

// set current chat record
export const setCurrentChatListRecord =
  (chat: UserChatRecord) => async (dispatch: AppDispatch) => {
    try {
      const response = { data: chat }
      dispatch(setCurrentChatRecord(response.data))
    } catch (error) {
      console.error('Error setting current chat record:', error)
    }
  }

// add new Chat
export const addDefaultChatRecordData =
  (newRecord: UserChatRecord) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(
        DEFAULT_CHAT_LIST_API,
        newRecord,
        'Chat'
      )
      const { data, message } = response
      toast.success(message || 'Chat record added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-default-chat', { ...data })
      dispatch(addChatListRecord(data))
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

// delete current chat
export const deleteDefaultChatRecordData =
  (chat: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = chat.map(async (id: number) => {
        const response = await customDelete(DEFAULT_CHAT_LIST_API, id, 'Chat')
        const { message, data } = response
        toast.success(message || 'Chat record deleted successfully', {
          autoClose: 3000,
        })
        return data
      })
      const deletedCustomers = await Promise.all(deletePromises)
      dispatch(deleteDefaultChatListRecord(deletedCustomers))
      deleteLocalStorageRecord({
        key: 'd-default-chat',
        listRecord: chat,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'Chat record deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Chat record deletion failed:', error)
    }
  }

// edit customer record
export const editDefaultChatListRecordData =
  (chat: UserChatRecord) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(DEFAULT_CHAT_LIST_API, chat, 'Chat')
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-default-chat',
        data as unknown as LocalStorageRecord
      )
      dispatch(editDefaultChatListRecord(data))
    } catch (error) {
      let errorMessage = 'Chat record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Chat record updation failed:', error)
    }
  }

// delete message
export const deleteDefaultChatMessageRecord =
  (userid: number, deletedMessage: UserChatMessageRecord) =>
  async (dispatch: AppDispatch) => {
    try {
      const response = { id: userid, message: deletedMessage }
      dispatch(
        deleteChatMessageRecord({ id: response.id, message: response.message })
      )
    } catch (error) {
      let errorMessage = 'Chat record deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Chat record deletion failed:', error)
    }
  }

// add new message
export const addDefaultChatMessageRecord =
  (userid: number, newMessage: UserChatMessageRecord) =>
  async (dispatch: AppDispatch) => {
    try {
      const response = { id: userid, message: newMessage }
      dispatch(
        addChatNewMessageRecord({ id: response.id, message: response.message })
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
