import { EventGrid } from '@src/dtos'
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
import { NEXT_PUBLIC_EVENT_GRID_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import {
  addEventGrid,
  deleteEventgrid,
  editEventGrid,
  getEventGrid,
} from './reducer'

const EVENT_GRID_API = NEXT_PUBLIC_EVENT_GRID_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get event grid data
export const getEventGridData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage<EventGrid[]>('d-events-grid')
      if (!responseData) {
        const response = await api.get(EVENT_GRID_API)
        const { data } = response
        createLocalStorage('d-events-grid', data)
        dispatch(getEventGrid(data))
      } else {
        dispatch(getEventGrid(responseData))
      }
    } else {
      const response = await api.get(EVENT_GRID_API)
      const { data } = response
      dispatch(getEventGrid(data))
    }
  } catch (error) {
    let errorMessage = 'Staff List Fetch Failed'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
      toast.error(errorMessage, { autoClose: 3000 })
    }
    console.error('Staff List Fetch Failed:', error)
  }
}

// add new event grid
export const addEventGridData =
  (newRecord: EventGrid) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(EVENT_GRID_API, newRecord, 'event grid')
      const { data, message } = response
      toast.success(message || 'event grid added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-events-grid', { ...data })
      dispatch(addEventGrid(data))
    } catch (error) {
      let errorMessage = 'event grid addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('event grid addition failed:', error)
    }
  }

// edit event grid
export const editEventGridData =
  (event: EventGrid) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(EVENT_GRID_API, event, 'event grid')
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-events-grid',
        data as unknown as LocalStorageRecord
      )
      dispatch(editEventGrid(data))
    } catch (error) {
      let errorMessage = 'event grid record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('event grid record updation failed:', error)
    }
  }

// delete event grid
export const deleteEventGridtData =
  (event: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = event.map(async (id) => {
        const response = await customDelete(EVENT_GRID_API, id, 'event grid')
        const { message } = response
        toast.success(message || 'event grid deleted successfully', {
          autoClose: 3000,
        })
        return response.data
      })
      const deletedProducts = await Promise.all(deletePromises)
      dispatch(deleteEventgrid(deletedProducts))
      deleteLocalStorageRecord({
        key: 'd-events-grid',
        listRecord: event,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'event grid deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('event grid deletion failed:', error)
    }
  }
