import { OrderListItem } from '@src/dtos'
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
import { NEXT_PUBLIC_ORDER_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import {
  addOrderList,
  deleteOrderList,
  editOrderList,
  getOrderList,
} from './reducer'

const ORDER_LIST_API = NEXT_PUBLIC_ORDER_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get order list
export const getOrderData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = (await getLocalStorage('d-order-list')) as
        | OrderListItem[]
        | null
      if (!responseData) {
        const response = await api.get(ORDER_LIST_API)
        const { data } = response
        createLocalStorage('d-order-list', data)
        dispatch(getOrderList(data))
      } else {
        dispatch(getOrderList(responseData || []))
      }
    } else {
      const response = await api.get(ORDER_LIST_API)
      const { data } = response
      dispatch(getOrderList(data))
    }
  } catch (error) {
    let errorMessage = 'Order List Fetch Failed'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
      toast.error(errorMessage, { autoClose: 3000 })
    }
    console.error('Order List Fetch Failed:', error)
  }
}

// add record
export const addOrderData =
  (newRecord: OrderListItem) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(ORDER_LIST_API, newRecord, 'order')
      const { data, message } = response
      toast.success(message || 'Order List added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-order-list', { ...data })
      dispatch(addOrderList(data))
    } catch (error) {
      let errorMessage = 'Order List addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Order List addition failed:', error)
    }
  }

// edit data
export const editOrderData =
  (order: OrderListItem) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(ORDER_LIST_API, order, 'order')
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-order-list',
        data as unknown as LocalStorageRecord
      )
      dispatch(editOrderList(data))
    } catch (error) {
      let errorMessage = 'Order List updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Order List updation failed:', error)
    }
  }

// delete data
export const deleteOrderData =
  (orders: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = orders.map(async (id) => {
        const response = await customDelete(ORDER_LIST_API, id, 'order')
        const { message } = response
        toast.success(message || 'Order List deleted successfully', {
          autoClose: 3000,
        })
        return response.data
      })
      const deletedorders = await Promise.all(deletePromises)
      dispatch(deleteOrderList(deletedorders))
      deleteLocalStorageRecord({
        key: 'd-order-list',
        listRecord: orders,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'Order List deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Order List deletion failed:', error)
    }
  }
