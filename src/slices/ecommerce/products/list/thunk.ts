import { ProductListItem } from '@src/dtos'
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
import { NEXT_PUBLIC_PRODUCT_List_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import {
  addProductList,
  changeStatusProductList,
  deleteProductList,
  editProductList,
  getProductList,
  setCurrentEditMode,
  setCurrentProduct,
} from './reducer'

const PRODUCT_LIST_API = NEXT_PUBLIC_PRODUCT_List_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get product list
export const getProductListData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = (await getLocalStorage('d-product-list')) as
        | ProductListItem[]
        | null
      if (!responseData) {
        const response = await api.get(PRODUCT_LIST_API)
        const { data } = response
        createLocalStorage('d-product-list', data)
        dispatch(getProductList(data))
      } else {
        dispatch(getProductList(responseData || []))
      }
    } else {
      const response = await api.get(PRODUCT_LIST_API)
      const { data } = response
      dispatch(getProductList(data))
    }
  } catch (error) {
    let errorMessage = 'Error fetching Product data'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
      toast.error(errorMessage, { autoClose: 3000 })
    }
    console.error('Error fetching Product data:', error)
  }
}

// set product list
export const setProductListStatus =
  (product: ProductListItem) => async (dispatch: AppDispatch) => {
    try {
      const response = { data: product }
      dispatch(changeStatusProductList(response.data))
      return response.data
    } catch (error) {
      return error
    }
  }

// set edit mode for product
export const setEditModeProductList =
  (editMode: boolean) => async (dispatch: AppDispatch) => {
    try {
      const response = { data: editMode }
      dispatch(setCurrentEditMode(response.data))
      return response.data
    } catch (error) {
      return error
    }
  }

// set current product
export const setCurrentProductList =
  (product: ProductListItem) => async (dispatch: AppDispatch) => {
    try {
      const response = { data: product }
      dispatch(setCurrentProduct(response.data))
      return response.data
    } catch (error) {
      return error
    }
  }

// add product
export const addProductListData =
  (newRecord: ProductListItem) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(PRODUCT_LIST_API, newRecord, 'Product')
      const { data } = response
      toast.success('Product transferred to cart.', { autoClose: 3000 })
      addLocalStorageRecord('d-product-list', { ...data })
      dispatch(addProductList(data))
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

// edit product
export const editProductListData =
  (wishListRecord: ProductListItem) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(
        PRODUCT_LIST_API,
        wishListRecord,
        'Product'
      )
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-product-list',
        data as unknown as LocalStorageRecord
      )
      dispatch(editProductList(data))
    } catch (error) {
      let errorMessage = 'Product record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Product record updation failed:', error)
    }
  }

// delete ProductList
export const deleteProductListData =
  (productListRecords: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = productListRecords.map(async (id) => {
        const response = await customDelete(PRODUCT_LIST_API, id, 'Product')
        const { message, data } = response
        toast.success(message || 'Product record deleted successfully', {
          autoClose: 3000,
        })
        return data
      })
      const deletedProductList = await Promise.all(deletePromises)
      dispatch(deleteProductList(deletedProductList))
      deleteLocalStorageRecord({
        key: 'd-product-list',
        listRecord: productListRecords,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'Product record deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Product record deletion failed:', error)
    }
  }
