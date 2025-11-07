import { Parents } from '@src/dtos'
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
import { NEXT_PUBLIC_SCHOOL_PARENTS_LIST } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import {
  addParentsList,
  deleteParentsList,
  editParentsList,
  getParentsList,
} from './reducer'

const SCHOOL_PARENTS_API = NEXT_PUBLIC_SCHOOL_PARENTS_LIST
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get Parents list
export const getParentsListData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage('d-parents-list')
      if (!responseData) {
        const response = await api.get(SCHOOL_PARENTS_API)
        const { data } = response
        createLocalStorage('d-parents-list', data)
        dispatch(getParentsList(data))
      } else {
        dispatch(getParentsList((responseData as Parents[]) || []))
      }
    } else {
      const response = await api.get(SCHOOL_PARENTS_API)
      const { data } = response
      dispatch(getParentsList(data))
    }
  } catch (error) {
    let errorMessage = 'error fetching Parents data'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error?.response?.data?.message || error?.message || errorMessage
    }
    toast.error(errorMessage, { autoClose: 3000 })
    console.error('rror fetching Parents data', error)
  }
}

// add Parents record
export const addParentsListData =
  (newRecord: Parents) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(
        SCHOOL_PARENTS_API,
        newRecord,
        'Parents'
      )
      const { data, message } = response
      toast.success(message || 'parent record added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-parents-list', { ...data })
      dispatch(addParentsList(data))
    } catch (error) {
      let errorMessage = 'parents addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error?.response?.data?.message || error?.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('parents addition failed', error)
    }
  }

// edit parents record
export const editParentsListData =
  (parents: Parents) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(SCHOOL_PARENTS_API, parents, 'parents')
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-parents-list',
        data as unknown as LocalStorageRecord
      )
      dispatch(editParentsList(data))
    } catch (error) {
      let errorMessage = 'Parents record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error?.response?.data?.message || error?.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('Parents record updation failed', error)
    }
  }

// delete customer record
export const deleteParentsListData =
  (parents: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = parents.map(async (id) => {
        const response = await customDelete(SCHOOL_PARENTS_API, id, 'parents')
        const { message } = response
        toast.success(message || 'parents record deleted successfully', {
          autoClose: 3000,
        })
        return response.data
      })
      const deletedProducts = await Promise.all(deletePromises)
      dispatch(deleteParentsList(deletedProducts))
      deleteLocalStorageRecord({
        key: 'd-parents-list',
        listRecord: parents,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'parent record deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error?.response?.data?.message || error?.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('parent record deletion failed', error)
    }
  }
