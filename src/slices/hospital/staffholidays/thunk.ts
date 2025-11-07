import { Holidays } from '@src/dtos/apps/holidays'
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
import { NEXT_PUBLIC_HOSPITAL_HOLIDAYS_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import {
  addHolidays,
  deleteHolidays,
  editHolidays,
  getHolidays,
} from './reducer'

const HOSPITAL_HOLIDAYS_API = NEXT_PUBLIC_HOSPITAL_HOLIDAYS_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

//get Holidays
export const getHolidaysData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData =
        ((await getLocalStorage('d-hospital-holidays')) as Holidays[]) || []
      if (!responseData) {
        const response = await api.get(HOSPITAL_HOLIDAYS_API)
        const { data } = response
        createLocalStorage('d-hospital-holidays', data)
        dispatch(getHolidays(data))
      } else {
        dispatch(getHolidays(responseData))
      }
    } else {
      const response = await api.get(HOSPITAL_HOLIDAYS_API)
      const { data } = response
      dispatch(getHolidays(data))
    }
  } catch (error) {
    let errorMessage = 'Holidays Fetch Failed'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
    }
    toast.error(errorMessage, { autoClose: 3000 })
    console.error('Invoice record addition failed:', error)
  }
}

//add Holidays
export const addHolidaysData =
  (newRecord: Holidays) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(
        HOSPITAL_HOLIDAYS_API,
        newRecord,
        'Holidays'
      )
      const { data, message } = response
      toast.success(message || 'Holidays added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-hospital-holidays', { ...data })
      dispatch(addHolidays(data))
    } catch (error) {
      let errorMessage = 'Holidays addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('Holidays addition failed:', error)
    }
  }

//edit Holidays
export const editHolidaysData =
  (staff: Holidays) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(HOSPITAL_HOLIDAYS_API, staff, 'Holidays')
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-hospital-holidays',
        data as unknown as LocalStorageRecord
      )
      dispatch(editHolidays(data))
    } catch (error) {
      let errorMessage = 'Holidays record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('Holidays record updation failed:', error)
    }
  }

// delete Holidays
export const deleteHolidaysData =
  (Holidays: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = Holidays.map(async (id) => {
        const response = await customDelete(
          HOSPITAL_HOLIDAYS_API,
          id,
          'Holidays'
        )
        const { message } = response
        toast.success(message || 'Holidays record deleted successfully', {
          autoClose: 3000,
        })
        return response.data
      })
      const deletedProducts = await Promise.all(deletePromises)
      dispatch(deleteHolidays(deletedProducts))
      deleteLocalStorageRecord({
        key: 'd-hospital-holidays',
        listRecord: Holidays,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'Holidays record deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('Holidays record deletion failed:', error)
    }
  }
