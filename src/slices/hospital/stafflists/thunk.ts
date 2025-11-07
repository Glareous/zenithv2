import { StaffList } from '@src/dtos'
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
import { NEXT_PUBLIC_HOSPITAL_STAFF_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import {
  addStaffList,
  deleteStaffList,
  editStaffList,
  getStaffList,
} from './reducer'

const HOSPITAL_STAFF_API = NEXT_PUBLIC_HOSPITAL_STAFF_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get staff list
export const getStaffListData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage('d-hospital-staff-list')
      if (!responseData) {
        const response = await api.get(HOSPITAL_STAFF_API)
        const { data } = response
        createLocalStorage('d-hospital-staff-list', data)
        dispatch(getStaffList(data))
      } else {
        dispatch(getStaffList((responseData as StaffList[]) || []))
      }
    } else {
      const response = await api.get(HOSPITAL_STAFF_API)
      const { data } = response
      dispatch(getStaffList(data))
    }
  } catch (error) {
    let errorMessage = 'Satff List Fetch Failed'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
    }
    toast.error(errorMessage, { autoClose: 3000 })
    console.error('Satff List Fetch Failed:', error)
  }
}

// add staff member record
export const addStaffListData =
  (newRecord: StaffList) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(
        HOSPITAL_STAFF_API,
        newRecord,
        'staff member'
      )
      const { data, message } = response
      toast.success(message || 'staff record added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-hospital-staff-list', { ...data })
      dispatch(addStaffList(data))
    } catch (error) {
      let errorMessage = 'staff member addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('staff member addition failed:', error)
    }
  }

// edit customer record
export const editStaffListData =
  (staff: StaffList) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(
        HOSPITAL_STAFF_API,
        staff,
        'staff member'
      )
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-hospital-staff-list',
        data as unknown as LocalStorageRecord
      )
      dispatch(editStaffList(data))
    } catch (error) {
      let errorMessage = 'staff member record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('staff member record updation failed:', error)
    }
  }

// delete customer record
export const deleteStaffListData =
  (staff: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = staff.map(async (id) => {
        const response = await customDelete(
          HOSPITAL_STAFF_API,
          id,
          'staff member'
        )
        const { message } = response
        toast.success(message || 'customer record deleted successfully', {
          autoClose: 3000,
        })
        return response.data
      })
      const deletedProducts = await Promise.all(deletePromises)
      dispatch(deleteStaffList(deletedProducts))
      deleteLocalStorageRecord({
        key: 'd-hospital-staff-list',
        listRecord: staff,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'customer record deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('customer record deletion failed:', error)
    }
  }
