import { DealItem } from '@src/dtos'
import { AppDispatch } from '@src/slices/reducer'
import api, { customDelete } from '@src/utils/axios_api'
import {
  createLocalStorage,
  deleteLocalStorageRecord,
  getLocalStorage,
} from '@src/utils/crud_functions'
import { NEXT_PUBLIC_CRM_DEAL_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { deleteDealList, getDealList } from './reducer'

const DEAL_LIST_API = NEXT_PUBLIC_CRM_DEAL_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get data
export const getDealData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = (await getLocalStorage('d-crm-deal-list')) as
        | DealItem[]
        | null
      if (!responseData || !Array.isArray(responseData)) {
        const response = await api.get(DEAL_LIST_API)
        const { data } = response
        createLocalStorage('d-crm-deal-list', data)
        dispatch(getDealList(data))
      } else {
        dispatch(getDealList(responseData))
      }
    } else {
      const response = await api.get(DEAL_LIST_API)
      const { data } = response
      dispatch(getDealList(data))
    }
  } catch (error) {
    let errorMessage = 'Error fetching contact data'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
      toast.error(errorMessage, { autoClose: 3000 })
    }
    console.error('Error fetching contact data:', error)
  }
}

// delete customer record
export const deleteDealListData =
  (products: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = products.map(async (id: number) => {
        const response = await customDelete(DEAL_LIST_API, id, 'deal')
        const { data, message } = response
        toast.success(message || 'Deal record deleted successfully', {
          autoClose: 3000,
        })
        return data
      })
      const deletedProducts = await Promise.all(deletePromises)
      dispatch(deleteDealList(deletedProducts))
      deleteLocalStorageRecord({
        key: 'd-crm-deal-list',
        listRecord: products,
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
