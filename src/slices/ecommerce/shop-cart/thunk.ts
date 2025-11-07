import { ShopCartProduct } from '@src/dtos'
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
import { NEXT_PUBLIC_SHOP_CART_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import {
  addShopProduct,
  getEcommerceShopCartList,
  modifyProduct,
  removeShopProduct,
} from './reducer'

const USER_SHOP_CART_API = NEXT_PUBLIC_SHOP_CART_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get ecommerce shop cart data
export const getEcommerceShopCartData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage('d-shop-cart-list')
      if (!responseData) {
        const response = await api.get(USER_SHOP_CART_API)
        const { data } = response
        createLocalStorage('d-shop-cart-list', data)
        dispatch(getEcommerceShopCartList(data))
      } else {
        dispatch(
          getEcommerceShopCartList((responseData as ShopCartProduct[]) || [])
        )
      }
    } else {
      const response = await api.get(USER_SHOP_CART_API)
      const { data } = response
      dispatch(getEcommerceShopCartList(data))
    }
  } catch (error) {
    let errorMessage = 'Shop Cart List Fetch Failed'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
      toast.error(errorMessage, { autoClose: 3000 })
    }
    console.error('Shop Cart List Fetch Failed:', error)
  }
}

// add product to shop
export const addNewShopProduct =
  (newRecord: ShopCartProduct) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(
        USER_SHOP_CART_API,
        newRecord,
        'Shop cart'
      )
      const { data } = response
      toast.success('Product transferred to cart.', { autoClose: 3000 })
      addLocalStorageRecord('d-shop-cart-list', { ...data })
      dispatch(addShopProduct(data))
    } catch (error) {
      let errorMessage = 'Shop cart record addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Shop cart record addition failed:', error)
    }
  }

// update wishlist record
export const updateShopCartProduct =
  (wishListRecord: ShopCartProduct) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(
        USER_SHOP_CART_API,
        wishListRecord,
        'Shop cart'
      )
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-shop-cart-list',
        data as unknown as LocalStorageRecord
      )
      dispatch(modifyProduct(data))
    } catch (error) {
      let errorMessage = 'shop cart record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('shop cart record updation failed:', error)
    }
  }

// delete wishlist record from wishlist
export const deleteShopProduct =
  (wishListRecords: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = wishListRecords.map(async (id) => {
        const response = await customDelete(USER_SHOP_CART_API, id, 'Shop cart')
        const { message, data } = response
        toast.success(message || 'shop cart record deleted successfully', {
          autoClose: 3000,
        })
        return data
      })
      const deletedWishList = await Promise.all(deletePromises)
      dispatch(removeShopProduct(deletedWishList))
      deleteLocalStorageRecord({
        key: 'd-shop-cart-list',
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
