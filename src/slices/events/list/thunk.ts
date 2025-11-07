import { EventList } from '@src/dtos'
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
import { NEXT_PUBLIC_EVENT_LIST_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import {
  addEventList,
  deleteEventList,
  editEventList,
  getEventList,
} from './reducer'

const EVENT_lIST_API = NEXT_PUBLIC_EVENT_LIST_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get event list data
export const getEventListData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = (await getLocalStorage('d-events-list')) as
        | EventList[]
        | null
      if (!responseData) {
        const response = await api.get(EVENT_lIST_API)
        const { data } = response
        createLocalStorage('d-events-list', data)
        dispatch(getEventList(data))
      } else {
        dispatch(getEventList(responseData || []))
      }
    } else {
      const response = await api.get(EVENT_lIST_API)
      const { data } = response
      dispatch(getEventList(data))
    }
  } catch (error) {
    let errorMessage = 'Error fetching Satff data'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
      toast.error(errorMessage, { autoClose: 3000 })
    }
    console.error('Error fetching Satff data:', error)
  }
}

// add new event list
export const addEventListData =
  (newRecord: EventList) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(EVENT_lIST_API, newRecord, 'event')
      const { data, message } = response
      toast.success(message || 'event added successfully', { autoClose: 3000 })
      addLocalStorageRecord('d-events-list', { ...data })
      dispatch(addEventList(data))
    } catch (error) {
      let errorMessage = 'Error adding record'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Error adding record:', error)
    }
  }

// edit event list
export const editEventListData =
  (event: EventList) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(EVENT_lIST_API, event, 'event')
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-events-list',
        data as unknown as LocalStorageRecord
      )
      dispatch(editEventList(data))
    } catch (error) {
      let errorMessage = 'event record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('event record updation failed:', error)
    }
  }

// delete event list
export const deleteEventListData =
  (event: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = event.map(async (id) => {
        const response = await customDelete(EVENT_lIST_API, id, 'event')
        const { message } = response
        toast.success(message || 'event deleted successfully', {
          autoClose: 3000,
        })
        return response.data
      })
      const deletedProducts = await Promise.all(deletePromises)
      dispatch(deleteEventList(deletedProducts))
      deleteLocalStorageRecord({
        key: 'd-events-list',
        listRecord: event,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'event record deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('event record deletion failed:', error)
    }
  }
