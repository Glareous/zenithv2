import { InvoiceList } from '@src/dtos'
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
import { NEXT_PUBLIC_INVOICE_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import {
  addInvoiceRecord,
  deleteInvoiceRecord,
  editInvoiceRecord,
  getInvoiceList,
  setCurrentInvoiceRecord,
} from './reducer'

const INVOICE_LIST_API = NEXT_PUBLIC_INVOICE_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get invoice list
export const getInvoiceListData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData: InvoiceList[] | null =
        await getLocalStorage('d-invoice-list')
      if (!responseData) {
        const response = await api.get(INVOICE_LIST_API)
        const { data } = response
        createLocalStorage('d-invoice-list', data)
        dispatch(getInvoiceList(data))
      } else {
        dispatch(getInvoiceList(responseData || []))
      }
    } else {
      const response = await api.get(INVOICE_LIST_API)
      const { data } = response
      dispatch(getInvoiceList(data))
    }
  } catch (error) {
    let errorMessage = 'Invoice List Fetch failed'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
    }
    toast.error(errorMessage, { autoClose: 3000 })
    console.error('student record updation failed:', error)
  }
}

// delete invoice record
export const deleteInvoiceListRecordData =
  (invoices: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = invoices.map(async (id) => {
        const response = await customDelete(INVOICE_LIST_API, id, 'Invoice')
        const { message, data } = response
        toast.success(message || 'Invoice record deleted successfully', {
          autoClose: 3000,
        })
        return data
      })
      const deletedInvoices = await Promise.all(deletePromises)
      dispatch(deleteInvoiceRecord(deletedInvoices))
      deleteLocalStorageRecord({
        key: 'd-invoice-list',
        listRecord: invoices,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'Invoice record deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('Invoice record deletion failed:', error)
    }
  }

// edit invoice record
export const editInvoiceListRecordData =
  (invoiceRecord: InvoiceList) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(
        INVOICE_LIST_API,
        invoiceRecord,
        'Invoice'
      )
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-invoice-list',
        data as unknown as LocalStorageRecord
      )
      dispatch(editInvoiceRecord(data))
    } catch (error) {
      let errorMessage = 'Invoice record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('Invoice record updation failed:', error)
    }
  }

// add invoice record
export const addInvoiceListRecordData =
  (newInvoiceRecord: InvoiceList) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(
        INVOICE_LIST_API,
        newInvoiceRecord,
        'Invoice'
      )
      const { data, message } = response
      toast.success(message || 'Invoice record added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-invoice-list', { ...data })
      dispatch(addInvoiceRecord(data))
    } catch (error) {
      let errorMessage = 'Invoice record addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('Invoice record addition failed:', error)
    }
  }

// set current invoice record
export const setCurrentInvoiceListRecord =
  (isOpen: boolean, invoice: InvoiceList) => async (dispatch: AppDispatch) => {
    try {
      const response = { mode: isOpen, data: invoice }
      dispatch(
        setCurrentInvoiceRecord({ mode: response.mode, list: response.data })
      )
    } catch (error) {
      console.error('Error setting current invoice record:', error)
    }
  }
