import { WishListProduct } from '@src/dtos'
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
import { NEXT_PUBLIC_WISHLIST_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import {
  addWishListProduct,
  getWishListData,
  modifyWishListProductQuantity,
  removeWishListProduct,
} from './reducer'

const USER_WISHLIST_API = NEXT_PUBLIC_WISHLIST_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

//  get wishlist data
export const getWishList = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = (await getLocalStorage('d-wishlist')) as
        | WishListProduct[]
        | null
      if (!responseData || !Array.isArray(responseData)) {
        const response = await api.get(USER_WISHLIST_API)
        const { data } = response
        createLocalStorage('d-wishlist', data)
        dispatch(getWishListData(data))
      } else {
        dispatch(getWishListData(responseData))
      }
    } else {
      const response = await api.get(USER_WISHLIST_API)
      const { data } = response
      dispatch(getWishListData(data))
    }
  } catch (error) {
    let errorMessage = 'Error fetching whish list data'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
      toast.error(errorMessage, { autoClose: 3000 })
    }
    console.error('Error fetching whish list data:', error)
  }
}

// add customer record
export const addWishListProductRecord =
  (newRecord: WishListProduct) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(
        USER_WISHLIST_API,
        newRecord,
        'wishlist record'
      )
      const { data, message } = response
      toast.success(message || 'wishlist record added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-wishlist', { ...data })
      dispatch(addWishListProduct(data))
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

// update wishlist record
export const updateWishListProductQuantity =
  (wishListRecord: WishListProduct) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(
        USER_WISHLIST_API,
        wishListRecord,
        'wishlist record'
      )
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-wishlist',
        data as unknown as LocalStorageRecord
      )
      dispatch(modifyWishListProductQuantity(data))
    } catch (error) {
      let errorMessage = 'wishlist record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('wishlist record updation failed:', error)
    }
  }

// delete wishlist record from wishlist
export const deleteWishListProduct =
  (wishListRecords: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = wishListRecords.map(async (id) => {
        const response = await customDelete(
          USER_WISHLIST_API,
          id,
          'wishlist record'
        )
        const { message, data } = response
        toast.success(message || 'wishlist record deleted successfully', {
          autoClose: 3000,
        })
        return data
      })
      const deletedWishList = await Promise.all(deletePromises)
      dispatch(removeWishListProduct(deletedWishList))
      deleteLocalStorageRecord({
        key: 'd-wishlist',
        listRecord: wishListRecords,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'wishlist record deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('wishlist record deletion failed:', error)
    }
  }
