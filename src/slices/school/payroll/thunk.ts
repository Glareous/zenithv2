import { TeacherPayroll } from '@src/dtos'
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
import { NEXT_PUBLIC_SCHOOL_TEACHER_PAYROLL_LIST_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import {
  addPayrollList,
  deletePayrollList,
  editPayrollList,
  getPayrollList,
} from './reducer'

const SCHOOL_TEACHER_PAYROLL_API = NEXT_PUBLIC_SCHOOL_TEACHER_PAYROLL_LIST_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get teacher payroll list
export const getPayrollListData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = (await getLocalStorage('d-teacher-payroll')) as
        | TeacherPayroll[]
        | null
      if (!responseData) {
        const response = await api.get(SCHOOL_TEACHER_PAYROLL_API)
        const { data } = response
        createLocalStorage('d-teacher-payroll', data)
        dispatch(getPayrollList(data))
      } else {
        dispatch(getPayrollList(responseData || []))
      }
    } else {
      const response = await api.get(SCHOOL_TEACHER_PAYROLL_API)
      const { data } = response
      dispatch(getPayrollList(data))
    }
  } catch (error) {
    let errorMessage = 'exam question updation failed'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error?.response?.data?.message || error?.message || errorMessage
    }
    toast.error(errorMessage, { autoClose: 3000 })
    console.error('Exam question updation failed', error)
  }
}

// add teacher payroll record
export const addPayrollListData =
  (newRecord: TeacherPayroll) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(
        SCHOOL_TEACHER_PAYROLL_API,
        newRecord,
        'Payroll'
      )
      const { data, message } = response
      toast.success(message || 'Teacher Payroll record added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-teacher-payroll', { ...data })
      dispatch(addPayrollList(data))
    } catch (error) {
      let errorMessage = 'Teacher Payroll addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error?.response?.data?.message || error?.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('Exam question updation failed', error)
    }
  }

// edit teacher payroll record
export const editPayrollListData =
  (payroll: TeacherPayroll) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(
        SCHOOL_TEACHER_PAYROLL_API,
        payroll,
        'Payroll'
      )
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-teacher-payroll',
        data as unknown as LocalStorageRecord
      )
      console.log('data -----', data)
      dispatch(editPayrollList(data))
    } catch (error) {
      let errorMessage = 'Teacher Payroll record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error?.response?.data?.message || error?.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('Exam question updation failed', error)
    }
  }

// delete customer record
export const deletepayrollListData =
  (parents: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = parents.map(async (id) => {
        const response = await customDelete(
          SCHOOL_TEACHER_PAYROLL_API,
          id,
          'Payroll'
        )
        const { message } = response
        toast.success(
          message || 'Teacher Payroll record deleted successfully',
          { autoClose: 3000 }
        )
        return response.data
      })
      const deletedProducts = await Promise.all(deletePromises)
      dispatch(deletePayrollList(deletedProducts))
      deleteLocalStorageRecord({
        key: 'd-teacher-payroll',
        listRecord: parents,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'Teacher Payroll record deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error?.response?.data?.message || error?.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('Exam question updation failed', error)
    }
  }
