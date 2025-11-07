import { ContactChatRecord } from '@src/dtos'
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
import { NEXT_PUBLIC_CONTACT_CHAT_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import {
  addContactChatRecord,
  deleteContactChatList,
  editContactChatRecord,
  getContactChatList,
} from './reducer'

const CONTACT_CHAT_LIST_API = NEXT_PUBLIC_CONTACT_CHAT_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get contact list
export const getContactChatData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage<ContactChatRecord[]>(
        'd-contact-chat-list'
      )
      if (!responseData) {
        const response = await api.get(CONTACT_CHAT_LIST_API)
        const { data } = response
        createLocalStorage('d-contact-chat-list', data)
        dispatch(getContactChatList(data))
      } else {
        dispatch(getContactChatList(responseData))
      }
    } else {
      const response = await api.get(CONTACT_CHAT_LIST_API)
      const { data } = response
      dispatch(getContactChatList(data))
    }
  } catch (error) {
    let errorMessage = 'Contact List Fetch Failed'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
      toast.error(errorMessage, { autoClose: 3000 })
    }
    console.error('Contact List Fetch Failed:', error)
  }
}

// delete contact record
export const deleteContactChatData =
  (contacts: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = contacts.map(async (id) => {
        const response = await customDelete(
          CONTACT_CHAT_LIST_API,
          id,
          'Contact'
        )
        const { message, data } = response
        toast.success(message || 'Contact record deleted successfully', {
          autoClose: 3000,
        })
        return data
      })
      const deleteContacts = await Promise.all(deletePromises)
      dispatch(deleteContactChatList(deleteContacts))
      deleteLocalStorageRecord({
        key: 'd-contact-chat-list',
        listRecord: contacts,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'Contact record deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Contact record deletion failed:', error)
    }
  }

// edit contact record
export const editContactChatRecordData =
  (customer: ContactChatRecord) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(
        CONTACT_CHAT_LIST_API,
        customer,
        'Contact'
      )
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-contact-chat-list',
        data as unknown as LocalStorageRecord
      )
      dispatch(editContactChatRecord(data))
    } catch (error) {
      let errorMessage = 'Contact record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Contact record updation failed:', error)
    }
  }

// add contact record
export const addContactChatRecordData =
  (newRecord: ContactChatRecord) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(
        CONTACT_CHAT_LIST_API,
        newRecord,
        'Contact'
      )
      const { data, message } = response
      toast.success(message || 'Contact record added successfully', {
        autoClose: 3000,
      })
      const transformedData = { ...data } as Omit<LocalStorageRecord, 'id'>
      addLocalStorageRecord('d-contact-chat-list', transformedData)
      dispatch(addContactChatRecord(data))
    } catch (error) {
      let errorMessage = 'Contact record addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Contact record addition failed:', error)
    }
  }
