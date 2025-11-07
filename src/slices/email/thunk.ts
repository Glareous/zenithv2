import { Email } from '@src/dtos'
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
import { NEXT_PUBLIC_EMAIL_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import {
  addMail,
  deleteMail,
  editMail,
  getMail,
  setCurrentEmail,
} from './reducer'

const EMAIL_LIST_API = NEXT_PUBLIC_EMAIL_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get mail data
export const getMailData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage('d-email-list')
      if (!responseData) {
        const response = await api.get(EMAIL_LIST_API)
        const { data } = response
        createLocalStorage('d-email-list', data)
        dispatch(getMail(data))
      } else {
        dispatch(getMail(responseData))
      }
    } else {
      const response = await api.get(EMAIL_LIST_API)
      const { data } = response
      dispatch(getMail(data))
    }
  } catch (error) {
    let errorMessage = 'Error fetching Email data'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
      toast.error(errorMessage, { autoClose: 3000 })
    }
    console.error('Error fetching Email data:', error)
  }
}

// delete mail record
export const deleteMailData =
  (products: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = products.map(async (id: number) => {
        const response = await customDelete(EMAIL_LIST_API, id, 'Email')
        const { data, message } = response
        toast.success(message || 'Email deleted successfully', {
          autoClose: 3000,
        })
        return data
      })
      const deletedProducts = await Promise.all(deletePromises)
      dispatch(deleteMail(deletedProducts))
      deleteLocalStorageRecord({
        key: 'd-email-list',
        listRecord: products,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'Email record deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Email record deletion failed:', error)
    }
  }

// add email record
export const addEmailListRecordData =
  (newEmailRecord: Email) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(EMAIL_LIST_API, newEmailRecord, 'Email')
      const { data, message } = response
      toast.success(message || 'Email record added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-email-list', { ...data })
      dispatch(addMail(data))
    } catch (error) {
      let errorMessage = 'Email record addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Email record addition failed:', error)
    }
  }

// edit mail record
export const editEmailListRecordData =
  (email: Email) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(EMAIL_LIST_API, email, 'Email')
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-email-list',
        data as unknown as LocalStorageRecord
      )
      dispatch(editMail(data))
    } catch (error) {
      let errorMessage = 'Email record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Email record updation failed:', error)
    }
  }

// set current email record
export const setCurrentEmailRecordData =
  (email: Email) => async (dispatch: AppDispatch) => {
    try {
      const response = { data: email }
      const { data } = response
      dispatch(setCurrentEmail(data))
    } catch (error) {
      let errorMessage = 'Email record current set failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Email record current set failed:', error)
    }
  }
