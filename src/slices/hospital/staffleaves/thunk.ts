import { StaffLeaves } from '@src/dtos'
import { AppDispatch } from '@src/slices/reducer'
import api, { customPut } from '@src/utils/axios_api'
import {
  LocalStorageRecord,
  createLocalStorage,
  getLocalStorage,
  updateLocalStorageRecord,
} from '@src/utils/crud_functions'
import { NEXT_PUBLIC_HOSPITAL_STAFF_LEAVE_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import { editStaffLeaveList, getStaffLeaveList } from './reducer'

const HOSPITAL_STAFF_LEAVE_API = NEXT_PUBLIC_HOSPITAL_STAFF_LEAVE_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

export const getStaffLeaveData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage<StaffLeaves[]>(
        'd-hospital-staff-leave'
      )
      if (!responseData) {
        const response = await api.get(HOSPITAL_STAFF_LEAVE_API)
        const { data } = response
        createLocalStorage('d-hospital-staff-leave', data)
        dispatch(getStaffLeaveList(data))
      } else {
        dispatch(getStaffLeaveList(responseData))
      }
    } else {
      const response = await api.get(HOSPITAL_STAFF_LEAVE_API)
      const { data } = response
      dispatch(getStaffLeaveList(data))
    }
  } catch (error) {
    let errorMessage = 'Satff Leave Fetch Failed'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
    }
    toast.error(errorMessage, { autoClose: 3000 })
    console.error('Satff Leave Fetch Failed:', error)
  }
}

export const editStaffLeaveData =
  (staff: StaffLeaves) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(
        HOSPITAL_STAFF_LEAVE_API,
        staff,
        'staff Leave'
      )
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-hospital-staff-leave',
        data as unknown as LocalStorageRecord
      )
      dispatch(editStaffLeaveList(data))
    } catch (error) {
      let errorMessage = 'staff Leave record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('staff Leave record updation failed:', error)
    }
  }
