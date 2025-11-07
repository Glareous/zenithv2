import { ExamQuestion } from '@src/dtos'
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
import { NEXT_PUBLIC_SCHOOL_EXAM_QUESTION_LIST } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import {
  addQuestionList,
  deleteQuestionList,
  editQuestionList,
  getQuestionList,
} from './reducer'

const SCHOOL_EXAM_QUESTION_LIST = NEXT_PUBLIC_SCHOOL_EXAM_QUESTION_LIST
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get question list
export const getQuestionListData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = (await getLocalStorage('d-exam-question')) as
        | ExamQuestion[]
        | null
      if (!responseData) {
        const response = await api.get(SCHOOL_EXAM_QUESTION_LIST)
        const { data } = response
        createLocalStorage('d-exam-question', data)
        dispatch(getQuestionList(data))
      } else {
        dispatch(getQuestionList(responseData || []))
      }
    } else {
      const response = await api.get(SCHOOL_EXAM_QUESTION_LIST)
      const { data } = response
      dispatch(getQuestionList(data))
    }
  } catch (error) {
    let errorMessage = 'Exam question Fetch Failed'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage = error.response.data.message || errorMessage
    }
    toast.error(errorMessage, { autoClose: 3000 })
    console.error('Error fetching project grid data:', error)
  }
}

// add question record
export const addQuestionListData =
  (newRecord: ExamQuestion) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(
        SCHOOL_EXAM_QUESTION_LIST,
        newRecord,
        'exam question'
      )
      const { data, message } = response
      toast.success(message || 'Question added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-exam-question', { ...data })
      dispatch(addQuestionList(data))
    } catch (error) {
      let errorMessage = 'Exam question addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage = error.response.data.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('Error fetching project grid data:', error)
    }
  }

// edit question record
export const editQuestionListData =
  (question: ExamQuestion) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(
        SCHOOL_EXAM_QUESTION_LIST,
        question,
        'exam question'
      )
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-exam-question',
        data as unknown as LocalStorageRecord
      )
      dispatch(editQuestionList(data))
    } catch (error) {
      let errorMessage = 'Exam question updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error?.response?.data?.message || error?.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('Error fetching project grid data:', error)
    }
  }

// delete question record
export const deleteQuestionListData =
  (question: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = question.map(async (id) => {
        const response = await customDelete(
          SCHOOL_EXAM_QUESTION_LIST,
          id,
          'exam question'
        )
        const { message } = response
        toast.success(message || 'Exam question deleted successfully', {
          autoClose: 3000,
        })
        return response.data
      })
      const deletedProducts = await Promise.all(deletePromises)
      dispatch(deleteQuestionList(deletedProducts))
      deleteLocalStorageRecord({
        key: 'd-exam-question',
        listRecord: question,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'Exam Question Deletion Failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error?.response?.data?.message || error?.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('Error fetching project grid data:', error)
    }
  }
