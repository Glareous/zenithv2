import { CategoryItems } from '@src/dtos'
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
import { NEXT_PUBLIC_CATEGORY_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import {
  addCategoryList,
  deleteCategoryList,
  editCategoryList,
  getCategoryList,
} from './reducer'

const CUSTOMER_LIST_API = NEXT_PUBLIC_CATEGORY_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get customer list
export const getCategoryData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = (await getLocalStorage('d-category-list')) as
        | CategoryItems[]
        | null
      if (!responseData) {
        const response = await api.get(CUSTOMER_LIST_API)
        const { data } = response
        createLocalStorage('d-category-list', data)
        dispatch(getCategoryList(data))
      } else {
        dispatch(getCategoryList(responseData || []))
      }
    } else {
      const response = await api.get(CUSTOMER_LIST_API)
      const { data } = response
      dispatch(getCategoryList(data))
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

// add record
export const addCategoryData =
  (newRecord: CategoryItems) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(
        CUSTOMER_LIST_API,
        newRecord,
        'category'
      )
      const { data, message } = response
      toast.success(message || 'Category List added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-category-list', { ...data })
      dispatch(addCategoryList(data))
    } catch (error) {
      let errorMessage = 'Category List addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Category List addition failed:', error)
    }
  }

// edit data
export const editCategoryData =
  (category: CategoryItems) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(CUSTOMER_LIST_API, category, 'category')
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-category-list',
        data as unknown as LocalStorageRecord
      )
      dispatch(editCategoryList(data))
    } catch (error) {
      let errorMessage = 'Category List updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Category List updation failed:', error)
    }
  }

// delete data
export const deleteCategoryData =
  (categorys: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = categorys.map(async (id) => {
        const response = await customDelete(CUSTOMER_LIST_API, id, 'category')
        const { message } = response
        toast.success(message || 'Category List deleted successfully', {
          autoClose: 3000,
        })
        return response.data
      })
      const deletedcategorys = await Promise.all(deletePromises)
      dispatch(deleteCategoryList(deletedcategorys))
      deleteLocalStorageRecord({
        key: 'd-category-list',
        listRecord: categorys,
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
