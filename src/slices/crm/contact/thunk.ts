import { CrmContactItems } from '@src/dtos/apps/crm'
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
import { NEXT_PUBLIC_CRM_CONTACT_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import {
  addContactList,
  deleteContactList,
  editContactList,
  getContactList,
} from './reducer'

const CONTACT_LIST_API = NEXT_PUBLIC_CRM_CONTACT_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get contact
export const getContactData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = (await getLocalStorage('d-crm-contact-list')) as
        | CrmContactItems[]
        | null
      if (!responseData) {
        const response = await api.get(CONTACT_LIST_API)
        const { data } = response
        createLocalStorage('d-crm-contact-list', data)
        dispatch(getContactList(data))
      } else {
        dispatch(getContactList(responseData || []))
      }
    } else {
      const response = await api.get(CONTACT_LIST_API)
      const { data } = response
      dispatch(getContactList(data))
    }
  } catch (error) {
    let errorMessage = 'Error fetching contact data'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
      toast.error(errorMessage, { autoClose: 3000 })
    }
    console.error('Error fetching contact data:', error)
  }
}

// add contact record
export const addContactListData =
  (newRecord: CrmContactItems) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(CONTACT_LIST_API, newRecord, 'contact')
      const { data, message } = response
      toast.success(message || 'contact record added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-crm-contact-list', { ...data })
      dispatch(addContactList(data))
    } catch (error) {
      let errorMessage = 'contact record addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('contact record addition failed:', error)
    }
  }

// edit contact record
export const editContactListData =
  (contact: CrmContactItems) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(CONTACT_LIST_API, contact, 'contact')
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-crm-contact-list',
        data as unknown as LocalStorageRecord
      )
      dispatch(editContactList(data))
    } catch (error) {
      let errorMessage = 'contact record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('contact record updation failed:', error)
    }
  }

// delete customer record
export const deleteContactListData =
  (products: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = products.map(async (id: number) => {
        const response = await customDelete(CONTACT_LIST_API, id, 'contact')
        const { data, message } = response
        toast.success(message || 'Contact record deleted successfully', {
          autoClose: 3000,
        })
        return data
      })
      const deletedProducts = await Promise.all(deletePromises)
      dispatch(deleteContactList(deletedProducts))
      deleteLocalStorageRecord({
        key: 'd-crm-contact-list',
        listRecord: products,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'Error in deleting products'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Error in deleting products:', error)
    }
  }
