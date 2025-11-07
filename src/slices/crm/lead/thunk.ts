import { LeadItem } from '@src/dtos'
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
import { NEXT_PUBLIC_CRM_LEAD_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import {
  addLeadList,
  deleteLeadList,
  editLeadList,
  getLeadList,
} from './reducer'

const LEAD_LIST_API = NEXT_PUBLIC_CRM_LEAD_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get data
export const getLeadData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = (await getLocalStorage('d-crm-lead-list')) as
        | LeadItem[]
        | null
      if (!responseData) {
        const response = await api.get(LEAD_LIST_API)
        const { data } = response
        createLocalStorage('d-crm-lead-list', data)
        dispatch(getLeadList(data))
      } else {
        dispatch(getLeadList(responseData || []))
      }
    } else {
      const response = await api.get(LEAD_LIST_API)
      const { data } = response
      dispatch(getLeadList(data))
    }
  } catch (error) {
    let errorMessage = 'lead List Fetch Failed'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
      toast.error(errorMessage, { autoClose: 3000 })
    }
    console.error('lead List Fetch Failed:', error)
  }
}

// add lead record
export const addLeadData =
  (newRecord: LeadItem) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(LEAD_LIST_API, newRecord, 'lead')
      const { data, message } = response
      toast.success(message || 'lead record added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-crm-lead-list', { ...data })
      dispatch(addLeadList(data))
    } catch (error) {
      let errorMessage = 'Error adding record'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Error adding record:', error)
    }
  }

// edit lead record
export const editLeadData =
  (lead: LeadItem) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(LEAD_LIST_API, lead, 'lead')
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-crm-lead-list',
        data as unknown as LocalStorageRecord
      )
      dispatch(editLeadList(data))
    } catch (error) {
      let errorMessage = 'lead record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('lead record updation failed:', error)
    }
  }

// delete customer record
export const deleteLeadData =
  (products: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = products.map(async (id) => {
        const response = await customDelete(LEAD_LIST_API, id, 'lead')
        const { message } = response
        toast.success(message || 'lead record deleted successfully', {
          autoClose: 3000,
        })
        return response.data
      })
      const deletedProducts = await Promise.all(deletePromises)
      dispatch(deleteLeadList(deletedProducts))
      deleteLocalStorageRecord({
        key: 'd-crm-lead-list',
        listRecord: products,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'ead record deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('ead record deletion failed:', error)
    }
  }
