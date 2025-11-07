import { employeeSalary } from '@src/dtos'
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
import { NEXT_PUBLIC_HOSPITAL_EMPLOYEE_SALARY } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import {
  addEmaployeeSalary,
  deleteEmaployeeSalary,
  editEmaployeeSalary,
  getEmaployeeSalary,
} from './reducer'

const HOSPITAL_EMPLOYEE_SALARY_API = NEXT_PUBLIC_HOSPITAL_EMPLOYEE_SALARY
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

//get salary records
export const getEmployeeSalaryData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage('d-hospital-employee-salary')
      if (!responseData) {
        const response = await api.get(HOSPITAL_EMPLOYEE_SALARY_API)
        const { data } = response
        createLocalStorage('d-hospital-employee-salary', data)
        dispatch(getEmaployeeSalary(data))
      } else {
        dispatch(getEmaployeeSalary(responseData as employeeSalary[]))
      }
    } else {
      const response = await api.get(HOSPITAL_EMPLOYEE_SALARY_API)
      const { data } = response
      dispatch(getEmaployeeSalary(data))
    }
  } catch (error) {
    let errorMessage = 'Employee Salary Fetch Failed'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
    }
    toast.error(errorMessage, { autoClose: 3000 })
    console.error('Employee Salary Fetch Failed:', error)
  }
}

//add salary records
export const addEmployeeSalaryData =
  (newRecord: employeeSalary) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(
        HOSPITAL_EMPLOYEE_SALARY_API,
        newRecord,
        'salary'
      )
      const { data, message } = response
      toast.success(message || 'salary record added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-hospital-employee-salary', { ...data })
      dispatch(addEmaployeeSalary(data))
    } catch (error) {
      let errorMessage = 'Employee Salary Fetch Failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('Employee Salary Fetch Failed:', error)
    }
  }

// edite salary records
export const editEmployeeSalaryData =
  (salary: employeeSalary) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(
        HOSPITAL_EMPLOYEE_SALARY_API,
        salary,
        'salary member'
      )
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-hospital-employee-salary',
        data as unknown as LocalStorageRecord
      )
      dispatch(editEmaployeeSalary(data))
    } catch (error) {
      let errorMessage = 'Salary Reacod updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('Salary Reacod updation failed:', error)
    }
  }

//delete salary records
export const deleteEmployeeSalaryData =
  (salary: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = salary.map(async (id) => {
        const response = await customDelete(
          HOSPITAL_EMPLOYEE_SALARY_API,
          id,
          'salary'
        )
        const { message } = response
        toast.success(message || 'salary record deleted successfully', {
          autoClose: 3000,
        })
        return response.data
      })
      const deletedProducts = await Promise.all(deletePromises)
      dispatch(deleteEmaployeeSalary(deletedProducts))
      deleteLocalStorageRecord({
        key: 'd-hospital-employee-salary',
        listRecord: salary,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'Error in deleting products'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('Error in deleting products:', error)
    }
  }
