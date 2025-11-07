import { CheckoutProductAddress } from '@src/dtos'
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
import { NEXT_PUBLIC_CHECKOUT_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import {
  addCheckoutListRecord,
  deleteCheckoutListRecord,
  editCheckoutListRecord,
  getCheckoutList,
} from './reducer'

const USER_CHECKOUT_API = NEXT_PUBLIC_CHECKOUT_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get checkout data
export const getCheckoutAddressData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage('d-address-list')
      if (!responseData) {
        const response = await api.get(USER_CHECKOUT_API)
        const { data } = response
        createLocalStorage('d-address-list', data)
        dispatch(getCheckoutList(data))
      } else {
        dispatch(getCheckoutList(responseData))
      }
    } else {
      const response = await api.get(USER_CHECKOUT_API)
      const { data } = response
      dispatch(getCheckoutList(data))
    }
  } catch (error) {
    let errorMessage = 'Error fetching category data'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
      toast.error(errorMessage, { autoClose: 3000 })
    }
    console.error('Error fetching category data:', error)
  }
}

// add new address
export const addCheckoutListData =
  (newRecord: CheckoutProductAddress) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(USER_CHECKOUT_API, newRecord, 'Address')
      const { data, message } = response
      toast.success(message || 'New Address Added Successfully.', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-address-list', { ...data })
      dispatch(addCheckoutListRecord(data))
    } catch (error) {
      let errorMessage = 'Address addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Address addition failed:', error)
    }
  }

// edit existing address
export const editCheckoutListData =
  (wishListRecord: CheckoutProductAddress) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(
        USER_CHECKOUT_API,
        wishListRecord,
        'Address'
      )
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-address-list',
        data as unknown as LocalStorageRecord
      )
      dispatch(editCheckoutListRecord(data))
    } catch (error) {
      let errorMessage = 'Address updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Address updation failed:', error)
    }
  }

// delete address
export const deleteCheckoutListData =
  (wishListRecords: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = wishListRecords.map(async (id) => {
        const response = await customDelete(USER_CHECKOUT_API, id, 'Address')
        const { message, data } = response
        toast.success(message || 'Address deleted successfully', {
          autoClose: 3000,
        })
        return data
      })
      const deletedWishList: number[] = await Promise.all(deletePromises)
      const deletedIds = deletedWishList
      dispatch(deleteCheckoutListRecord(deletedIds))
      deleteLocalStorageRecord({
        key: 'd-address-list',
        listRecord: wishListRecords,
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
