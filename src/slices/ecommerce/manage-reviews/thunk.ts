import { UserReviewRecord } from '@src/dtos'
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
import { NEXT_PUBLIC_MANAGE_REVIEWS_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import {
  addManageReview,
  deleteManageReview,
  getManageReviews,
  updateManageReview,
} from './reducer'

const USER_REVIEW_LIST_API = NEXT_PUBLIC_MANAGE_REVIEWS_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get manage reviews data
export const getManageReviewData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = (await getLocalStorage('d-user-review-list')) as
        | UserReviewRecord[]
        | null
      if (!responseData) {
        const response = await api.get(USER_REVIEW_LIST_API)
        const { data } = response
        createLocalStorage('d-user-review-list', data)
        dispatch(getManageReviews(data))
      } else {
        dispatch(getManageReviews(responseData || []))
      }
    } else {
      const response = await api.get(USER_REVIEW_LIST_API)
      const { data } = response
      dispatch(getManageReviews(data))
    }
  } catch (error) {
    let errorMessage = 'Error fetching user reviews data'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
      toast.error(errorMessage, { autoClose: 3000 })
    }
    console.error('Error fetching user reviews data:', error)
  }
}

// add customer record
export const addUserReviewRecord =
  (newRecord: UserReviewRecord) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(
        USER_REVIEW_LIST_API,
        newRecord,
        'user review'
      )
      const { data, message } = response
      toast.success(message || 'user review added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-user-review-list', { ...data })
      dispatch(addManageReview(data))
    } catch (error) {
      let errorMessage = 'user review addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('user review addition failed:', error)
    }
  }

// edit review record
export const updateUserReviewRecord =
  (customer: UserReviewRecord) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(
        USER_REVIEW_LIST_API,
        customer,
        'user review'
      )
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-user-review-list',
        data as unknown as LocalStorageRecord
      )
      dispatch(updateManageReview(data))
    } catch (error) {
      let errorMessage = 'user review updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('user review updation failed:', error)
    }
  }

// delete review record
export const deleteUserReviewRecord =
  (reviews: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = reviews.map(async (id) => {
        const response = await customDelete(
          USER_REVIEW_LIST_API,
          id,
          'user review'
        )
        const { message, data } = response
        toast.success(message || 'user review deleted successfully', {
          autoClose: 3000,
        })
        return data
      })
      const deletedReviews = await Promise.all(deletePromises)
      dispatch(deleteManageReview(deletedReviews))
      deleteLocalStorageRecord({
        key: 'd-user-review-list',
        listRecord: reviews,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'Error in deleting user review record'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Error in deleting user review record:', error)
    }
  }
