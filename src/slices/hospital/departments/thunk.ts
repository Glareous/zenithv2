import { departments } from '@src/dtos'
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
import { NEXT_PUBLIC_HOSPITAL_DEPARTMENT_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import {
  addDepartment,
  deleteDepartment,
  editDepartment,
  getDepartment,
} from './reducer'

const HOSPITAL_DEPARTMENT_API = NEXT_PUBLIC_HOSPITAL_DEPARTMENT_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

//get department data
export const getDepartmentsData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = (await getLocalStorage('d-hospital-department')) as
        | departments[]
        | null
      if (!responseData) {
        const response = await api.get(HOSPITAL_DEPARTMENT_API)
        const { data } = response
        createLocalStorage('d-hospital-department', data)
        dispatch(getDepartment(data))
      } else {
        dispatch(getDepartment(responseData || []))
      }
    } else {
      const response = await api.get(HOSPITAL_DEPARTMENT_API)
      const { data } = response
      dispatch(getDepartment(data))
    }
  } catch (error) {
    let errorMessage = 'Error fetching department data'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
    }
    toast.error(errorMessage, { autoClose: 3000 })
    console.error('Error fetching department data:', error)
  }
}

//add department
export const addDepartmentsData =
  (newRecord: departments) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(
        HOSPITAL_DEPARTMENT_API,
        newRecord,
        'departments'
      )
      const { data, message } = response
      toast.success(message || 'department added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-hospital-department', { ...data })
      dispatch(addDepartment(data))
    } catch (error) {
      let errorMessage = 'departments addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('departments addition failed:', error)
    }
  }

//edite department
export const editDepartmentsData =
  (staff: departments) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(
        HOSPITAL_DEPARTMENT_API,
        staff,
        'departments'
      )
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-hospital-department',
        data as unknown as LocalStorageRecord
      )
      dispatch(editDepartment(data))
    } catch (error) {
      let errorMessage = 'department record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('department record updation failed:', error)
    }
  }

//delete department
export const deleteDepartmentsData =
  (staff: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = staff.map(async (id) => {
        const response = await customDelete(
          HOSPITAL_DEPARTMENT_API,
          id,
          'departmanent'
        )
        const { message } = response
        toast.success(message || 'department deleted successfully', {
          autoClose: 3000,
        })
        return response.data
      })
      const deletedProducts = await Promise.all(deletePromises)
      dispatch(deleteDepartment(deletedProducts))
      deleteLocalStorageRecord({
        key: 'd-hospital-department',
        listRecord: staff,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'department deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('department deletion failed:', error)
    }
  }
