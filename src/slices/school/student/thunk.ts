import { StudentList } from '@src/dtos'
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
import { NEXT_PUBLIC_SCHOOL_STUDENT_LIST_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import {
  addStudentList,
  deleteStudentList,
  editStudentList,
  getStudentList,
  setCurrentStudent,
} from './reducer'

const SCHOOL_STUDENT_LIST_API = NEXT_PUBLIC_SCHOOL_STUDENT_LIST_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get student data
export const getStudentListData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = (await getLocalStorage('d-students-list')) as
        | StudentList[]
        | null
      if (!responseData) {
        const response = await api.get(SCHOOL_STUDENT_LIST_API)
        const { data } = response
        createLocalStorage('d-students-list', data)
        dispatch(getStudentList(data))
      } else {
        dispatch(getStudentList(responseData || []))
      }
    } else {
      const response = await api.get(SCHOOL_STUDENT_LIST_API)
      const { data } = response
      dispatch(getStudentList(data))
    }
  } catch (error) {
    let errorMessage = 'student List Fetch Failed'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
    }
    toast.error(errorMessage, { autoClose: 3000 })
    console.error('Error fetching project grid data:', error)
  }
}

// add new student
export const addStudentListData =
  (newRecord: StudentList) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(
        SCHOOL_STUDENT_LIST_API,
        newRecord,
        'student'
      )
      const { data, message } = response
      toast.success(message || 'student record added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-students-list', { ...data })
      dispatch(addStudentList(data))
    } catch (error) {
      let errorMessage = 'student List Fetch Failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('student List Fetch Failed:', error)
    }
  }

// edit student
export const editStudentListData =
  (student: StudentList) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(
        SCHOOL_STUDENT_LIST_API,
        student,
        'student'
      )
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-students-list',
        data as unknown as LocalStorageRecord
      )
      dispatch(editStudentList(data))
    } catch (error) {
      let errorMessage = 'student record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('student record updation failed:', error)
    }
  }

// delete student
export const deleteStudentListData =
  (student: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = student.map(async (id) => {
        const response = await customDelete(
          SCHOOL_STUDENT_LIST_API,
          id,
          'student'
        )
        const { message } = response
        toast.success(message || 'student deleted successfully', {
          autoClose: 3000,
        })
        return response.data
      })
      const deletedProducts = await Promise.all(deletePromises)
      dispatch(deleteStudentList(deletedProducts))
      deleteLocalStorageRecord({
        key: 'd-students-list',
        listRecord: student,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'student deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('student deletion failed:', error)
    }
  }

// update current student
export const modifyCurrentStudent =
  (modifyStudent: StudentList, studentMode: boolean) =>
  async (dispatch: AppDispatch) => {
    try {
      const response = { data: modifyStudent, editeMode: studentMode }
      dispatch(
        setCurrentStudent({ student: response.data, mode: response.editeMode })
      )
    } catch (error) {
      console.error(error)
    }
  }
