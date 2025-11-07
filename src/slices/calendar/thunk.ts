import { EventItem } from '@src/dtos'
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
import { NEXT_PUBLIC_CALENDAR_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import {
  addCalendarList,
  deleteCalendarList,
  editCalendarList,
  getCalendarList,
} from './reducer'

const CALENDAR_LIST_API = NEXT_PUBLIC_CALENDAR_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get calendar data
export const getCalendarData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = (await getLocalStorage('d-calendar-list')) as
        | EventItem[]
        | null
      if (!responseData) {
        const response = await api.get(CALENDAR_LIST_API)
        const { data } = response
        createLocalStorage('d-calendar-list', data)
        dispatch(getCalendarList(data))
      } else {
        dispatch(getCalendarList(responseData || []))
      }
    } else {
      const response = await api.get(CALENDAR_LIST_API)
      const { data } = response
      dispatch(getCalendarList(data))
    }
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Calendar List Fetch Failed'
      toast.error(errorMessage, { autoClose: 3000 })
    }
    console.error('Error fetching calendar data:', error)
  }
}

// add new calendar
export const addCalendarData =
  (newRecord: EventItem) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(
        CALENDAR_LIST_API,
        newRecord,
        'calendar'
      )
      const { data, message } = response
      toast.success(message || 'Calendar Event added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-calendar-list', { ...data })
      dispatch(addCalendarList(data))
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Calendar Event addition failed'
        toast.error(errorMessage || 'Calendar Event addition failed', {
          autoClose: 3000,
        })
      }
      console.error('Error adding record:', error)
    }
  }

// edit calendar
export const editCalendarData =
  (calendar: EventItem) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(CALENDAR_LIST_API, calendar, 'calendar')
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-calendar-list',
        data as unknown as LocalStorageRecord
      )
      dispatch(editCalendarList(data))
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Calendar event updation failed'
        toast.error(errorMessage || 'Calendar event updation failed', {
          autoClose: 3000,
        })
      }
      console.error('Error adding record:', error)
    }
  }

// delete calendar
export const deleteCalendarData =
  (calendars: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = calendars.map(async (id) => {
        const response = await customDelete(CALENDAR_LIST_API, id, 'calendar')
        const { data, message } = response
        toast.success(message || 'Calendar Events Deleted Successfully', {
          autoClose: 3000,
        })
        return data
      })
      const deletedCalendars = await Promise.all(deletePromises)
      dispatch(deleteCalendarList(deletedCalendars))
      deleteLocalStorageRecord({
        key: 'd-calendar-list',
        listRecord: calendars,
        multipleRecords: true,
      })
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Calendar Events Deletion Failed'
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Error in deleting products: ', error)
    }
  }
