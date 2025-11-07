import { ExamSchedule } from '@src/dtos'
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
import { NEXT_PUBLIC_SCHOOL_EXAM_SCHEDULE_LIST } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import {
  addExamList,
  deleteExamList,
  editExamList,
  getExamList,
} from './reducer'

const SCHOOL_EXAM_LIST = NEXT_PUBLIC_SCHOOL_EXAM_SCHEDULE_LIST
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get exam list

export const getExamListData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage('d-exam-schedule')
      if (!responseData) {
        const response = await api.get(SCHOOL_EXAM_LIST)
        const { data } = response
        createLocalStorage('d-exam-schedule', data)
        dispatch(getExamList(data))
      } else {
        if (Array.isArray(responseData)) {
          dispatch(getExamList(responseData))
        } else {
          console.error('Invalid data format for exam schedule:', responseData)
          toast.error('Failed to load exam schedule data', { autoClose: 3000 })
        }
      }
    } else {
      const response = await api.get(SCHOOL_EXAM_LIST)
      const { data } = response
      dispatch(getExamList(data))
    }
  } catch (error) {
    let errorMessage = 'Exam question updation failed'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error?.response?.data?.message || error?.message || errorMessage
    }
    toast.error(errorMessage, { autoClose: 3000 })
    console.error('Exam question updation failed', error)
  }
}

// add exam record
export const addExamListData =
  (newRecord: ExamSchedule) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(
        SCHOOL_EXAM_LIST,
        newRecord,
        'exam-list'
      )
      const { data, message } = response
      toast.success(message || 'Exam added successfully', { autoClose: 3000 })
      addLocalStorageRecord('d-exam-schedule', { ...data })
      dispatch(addExamList(data))
    } catch (error) {
      let errorMessage = 'Exam addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error?.response?.data?.message || error?.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('Error adding record', error)
    }
  }

// edit exam record
export const editExamListData =
  (exam: ExamSchedule) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(SCHOOL_EXAM_LIST, exam, 'exam-list')
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-exam-schedule',
        data as unknown as LocalStorageRecord
      )
      dispatch(editExamList(data))
    } catch (error) {
      let errorMessage = 'Exam record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error?.response?.data?.message || error?.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('Exam record updation failed', error)
    }
  }

// delete exam record
export const deleteExamListData =
  (book: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = book.map(async (id) => {
        const response = await customDelete(SCHOOL_EXAM_LIST, id, 'exam-list')
        const { message } = response
        toast.success(message || 'Exam record deleted successfully', {
          autoClose: 3000,
        })
        return response.data
      })
      const deletedProducts = await Promise.all(deletePromises)
      dispatch(deleteExamList(deletedProducts))
      deleteLocalStorageRecord({
        key: 'd-exam-schedule',
        listRecord: book,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'Exam record deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error?.response?.data?.message || error?.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('Exam record deletion failed', error)
    }
  }
