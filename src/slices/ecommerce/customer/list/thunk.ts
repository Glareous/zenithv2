import { CustomerRecord } from '@src/dtos'
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
import { NEXT_PUBLIC_CUSTOMER_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import {
  addCustomerProductRecord,
  deleteCustomerProductList,
  editCustomerProductRecord,
  getCustomerProductList,
} from './reducer'

const CUSTOMER_LIST_API = NEXT_PUBLIC_CUSTOMER_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get customer list
export const getCustomerProductData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData =
        await getLocalStorage<CustomerRecord[]>('d-customer-list')
      if (!responseData) {
        const response = await api.get(CUSTOMER_LIST_API)
        const { data } = response
        createLocalStorage('d-customer-list', data)
        dispatch(getCustomerProductList(data))
      } else {
        dispatch(getCustomerProductList(responseData))
      }
    } else {
      const response = await api.get(CUSTOMER_LIST_API)
      const { data } = response
      dispatch(getCustomerProductList(data))
    }
  } catch (error) {
    let errorMessage = 'Error fetching customer data'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
      toast.error(errorMessage, { autoClose: 3000 })
    }
    console.error('Error fetching customer data:', error)
  }
}

// delete customer record
export const deleteCustomerProductListData =
  (customers: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = customers.map(async (id) => {
        const response = await customDelete(CUSTOMER_LIST_API, id, 'Customer')
        const { message, data } = response
        toast.success(message || 'customer record deleted successfully', {
          autoClose: 3000,
        })
        return data
      })
      const deletedCustomers = await Promise.all(deletePromises)
      dispatch(deleteCustomerProductList(deletedCustomers))
      deleteLocalStorageRecord({
        key: 'd-customer-list',
        listRecord: customers,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'Error in deleting customer record'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Error in deleting customer record:', error)
    }
  }

// edit customer record
export const editCustomerProductRecordData =
  (customer: CustomerRecord) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(CUSTOMER_LIST_API, customer, 'Customer')
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-customer-list',
        data as unknown as LocalStorageRecord
      )
      dispatch(editCustomerProductRecord(data))
    } catch (error) {
      let errorMessage = 'Customer record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Customer record updation failed:', error)
    }
  }

// add customer record
export const addCustomerProductRecordData =
  (newRecord: CustomerRecord) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(
        CUSTOMER_LIST_API,
        newRecord,
        'Customer'
      )
      const { data, message } = response
      toast.success(message || 'Customer record added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-customer-list', { ...data })
      dispatch(addCustomerProductRecord(data))
    } catch (error) {
      let errorMessage = 'Customer record addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Customer record addition failed:', error)
    }
  }
