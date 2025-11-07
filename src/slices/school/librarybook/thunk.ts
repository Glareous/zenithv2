import { LibraryBook } from '@src/dtos'
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
import { NEXT_PUBLIC_SCHOOL_LIBRARY_BOOK_LIST } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import {
  addBookList,
  deleteBookList,
  editBookList,
  getBookList,
} from './reducer'

const SCHOOL_LIBRARY_BOOK_LIST = NEXT_PUBLIC_SCHOOL_LIBRARY_BOOK_LIST
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get book list
export const getBookListData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = (await getLocalStorage('d-library-books')) as
        | LibraryBook[]
        | null
      if (!responseData) {
        const response = await api.get(SCHOOL_LIBRARY_BOOK_LIST)
        const { data } = response
        createLocalStorage('d-library-books', data)
        dispatch(getBookList(data))
      } else {
        dispatch(getBookList(responseData || []))
      }
    } else {
      const response = await api.get(SCHOOL_LIBRARY_BOOK_LIST)
      const { data } = response
      dispatch(getBookList(data))
    }
  } catch (error) {
    let errorMessage = 'Error fetching book List data'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error?.response?.data?.message || error?.message || errorMessage
    }
    toast.error(errorMessage, { autoClose: 3000 })
    console.error('Exam question updation failed', error)
  }
}

// add book record
export const addBookListData =
  (newRecord: LibraryBook) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(
        SCHOOL_LIBRARY_BOOK_LIST,
        newRecord,
        'book'
      )
      const { data, message } = response
      toast.success(message || 'book added successfully', { autoClose: 3000 })
      addLocalStorageRecord('d-library-books', { ...data })
      dispatch(addBookList(data))
    } catch (error) {
      let errorMessage = 'exam question updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error?.response?.data?.message || error?.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('Error adding record', error)
    }
  }

// edit book record
export const editBookListData =
  (book: LibraryBook) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(SCHOOL_LIBRARY_BOOK_LIST, book, 'book')
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-library-books',
        data as unknown as LocalStorageRecord
      )
      dispatch(editBookList(data))
    } catch (error) {
      let errorMessage = 'Error adding record'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error?.response?.data?.message || error?.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('Exam question updation failed', error)
    }
  }

// delete book record
export const deleteBookListData =
  (book: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = book.map(async (id) => {
        const response = await customDelete(
          SCHOOL_LIBRARY_BOOK_LIST,
          id,
          'book'
        )
        const { message } = response
        toast.success(message || 'book record deleted successfully', {
          autoClose: 3000,
        })
        return response.data
      })
      const deletedProducts = await Promise.all(deletePromises)
      dispatch(deleteBookList(deletedProducts))
      deleteLocalStorageRecord({
        key: 'd-library-books',
        listRecord: book,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'exam question updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error?.response?.data?.message || error?.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('Error in deleting products', error)
    }
  }
