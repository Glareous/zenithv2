import { Attendance } from '@src/dtos'
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
import { NEXT_PUBLIC_HOSPITAL_STAFF_ATTENDANCE_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import {
  addAttendanceList,
  deleteAttendanceList,
  editAttendanceList,
  getAttendanceList,
} from './reducer'

const HOSPITAL_STAFF_ATTENDANCE_API = NEXT_PUBLIC_HOSPITAL_STAFF_ATTENDANCE_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

//get staff attendance list
export const getAttendanceData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = (await getLocalStorage(
        'd-hospital-staff-attendance'
      )) as Attendance[] | null
      if (!responseData) {
        const response = await api.get(HOSPITAL_STAFF_ATTENDANCE_API)
        const { data } = response
        createLocalStorage('d-hospital-staff-attendance', data)
        dispatch(getAttendanceList(data))
      } else {
        dispatch(getAttendanceList(responseData || []))
      }
    } else {
      const response = await api.get(HOSPITAL_STAFF_ATTENDANCE_API)
      const { data } = response
      dispatch(getAttendanceList(data))
    }
  } catch (error) {
    let errorMessage = 'attendance List Fetch Failed'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
    }
    toast.error(errorMessage, { autoClose: 3000 })
    console.error('attendance List Fetch Failed:', error)
  }
}

//add attendance record
export const addAttendanceData =
  (newRecord: Attendance) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(
        HOSPITAL_STAFF_ATTENDANCE_API,
        newRecord,
        'attendance'
      )
      const { data, message } = response
      toast.success(message || 'staff record added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-hospital-staff-attendance', { ...data })
      dispatch(addAttendanceList(data))
    } catch (error) {
      let errorMessage = 'attendance addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('attendance addition failed:', error)
    }
  }

// edit attendance record
export const editAttendanceData =
  (staff: Attendance) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(
        HOSPITAL_STAFF_ATTENDANCE_API,
        staff,
        'attendance'
      )
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-hospital-staff-attendance',
        data as unknown as LocalStorageRecord
      )
      dispatch(editAttendanceList(data))
    } catch (error) {
      let errorMessage = 'attendance record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('attendance record updation failed:', error)
    }
  }

// delete attendance record
export const deleteAttendanceData =
  (staff: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = staff.map(async (id) => {
        const response = await customDelete(
          HOSPITAL_STAFF_ATTENDANCE_API,
          id,
          'attendance'
        )
        const { message } = response
        toast.success(message || 'attendance deleted successfully', {
          autoClose: 3000,
        })
        return response.data
      })
      const deletedProducts = await Promise.all(deletePromises)
      dispatch(deleteAttendanceList(deletedProducts))
      deleteLocalStorageRecord({
        key: 'd-hospital-staff-attendance',
        listRecord: staff,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'attendance deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('attendance deletion failed:', error)
    }
  }
