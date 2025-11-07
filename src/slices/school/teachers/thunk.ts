import { TeacherListList } from '@src/dtos'
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
import { NEXT_PUBLIC_SCHOOL_TEACHER_LIST_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import {
  addTeacherList,
  deleteTeacherList,
  editTeacherList,
  getTeacherList,
} from './reducer'

const SCHOOL_TEACHER_LIST_API = NEXT_PUBLIC_SCHOOL_TEACHER_LIST_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get teacher list
export const getTeacherListData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = (await getLocalStorage('d-teacher-list')) as
        | TeacherListList[]
        | null
      if (!responseData) {
        const response = await api.get(SCHOOL_TEACHER_LIST_API)
        const { data } = response
        createLocalStorage('d-teacher-list', data)
        dispatch(getTeacherList(data))
      } else {
        if (responseData) {
          dispatch(getTeacherList(responseData))
        } else {
          throw new Error('Invalid data format from local storage')
        }
      }
    } else {
      const response = await api.get(SCHOOL_TEACHER_LIST_API)
      const { data } = response
      dispatch(getTeacherList(data))
    }
  } catch (error) {
    let errorMessage = 'teacher List Fetch Failed'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
    }
    toast.error(errorMessage, { autoClose: 3000 })
    console.error('student record updation failed:', error)
  }
}

// add teacher record
export const addTeacherListData =
  (newRecord: TeacherListList) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(
        SCHOOL_TEACHER_LIST_API,
        newRecord,
        'teacher List'
      )
      const { data, message } = response
      toast.success(message || 'Teacher record added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-teacher-list', { ...data })
      dispatch(addTeacherList(data))
    } catch (error) {
      let errorMessage = 'Teacher addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('Teacher addition failed:', error)
    }
  }

// edit teacher record
export const editTeacherListData =
  (teacher: TeacherListList) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(
        SCHOOL_TEACHER_LIST_API,
        teacher,
        'teacher List'
      )
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-teacher-list',
        data as unknown as LocalStorageRecord
      )
      dispatch(editTeacherList(data))
    } catch (error) {
      let errorMessage = 'teacher record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('teacher record updation failed:', error)
    }
  }

// delete teacher record
export const deleteTeacherListData =
  (teacher: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = teacher.map(async (id) => {
        const response = await customDelete(
          SCHOOL_TEACHER_LIST_API,
          id,
          'teacher List'
        )
        const { message } = response
        toast.success(message || 'teacher record deleted successfully', {
          autoClose: 3000,
        })
        return response.data
      })
      const deletedProducts = await Promise.all(deletePromises)
      dispatch(deleteTeacherList(deletedProducts))
      deleteLocalStorageRecord({
        key: 'd-teacher-list',
        listRecord: teacher,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'teacher record deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('teacher record deletion failed:', error)
    }
  }
