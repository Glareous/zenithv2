import { TodayAppointments } from '@src/dtos'
import { AppointmentList } from '@src/dtos'
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
import {
  NEXT_PUBLIC_HOSPITAL_APPOINTMENT_API,
  NEXT_PUBLIC_HOSPITAL_TODAY_APPOINTMENT_API,
} from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import {
  addAppointmentsList,
  addTodaysAppointments,
  deleteAppointmentsList,
  deleteTodaysAppointments,
  editAppointmentsList,
  editTodaysAppointments,
  getAppointmentsList,
  getTodaysAppointments,
} from './reducer'

const HOSPITAL_APPOINTMENT_API = NEXT_PUBLIC_HOSPITAL_APPOINTMENT_API
const HOSTPITA_TODAY_APPOINTMENT_APT =
  NEXT_PUBLIC_HOSPITAL_TODAY_APPOINTMENT_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get todays appointments list data
export const getTodayAppointmentsData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage(
        'd-hospital-appointments-todaylist'
      )
      if (!responseData) {
        const response = await api.get(HOSTPITA_TODAY_APPOINTMENT_APT)
        const { data } = response
        createLocalStorage('d-hospital-appointments-todaylist', data)
        dispatch(getTodaysAppointments(data))
      } else {
        const validResponseData: TodayAppointments[] = Array.isArray(
          responseData
        )
          ? responseData
          : []
        dispatch(getTodaysAppointments(validResponseData))
      }
    } else {
      const response = await api.get(HOSTPITA_TODAY_APPOINTMENT_APT)
      const { data } = response
      dispatch(getTodaysAppointments(data))
    }
  } catch (error) {
    let errorMessage = 'Error fetching appointments data'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
    }
    toast.error(errorMessage, { autoClose: 3000 })
    console.error('Error fetching appointments data:', error)
  }
}
// add new todays appointments data
export const addTodayAppointmentsData =
  (newRecord: TodayAppointments) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(
        HOSTPITA_TODAY_APPOINTMENT_APT,
        newRecord,
        'appointments'
      )
      const { data, message } = response
      toast.success(message || 'appointments added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-hospital-appointments-todaylist', { ...data })
      dispatch(addTodaysAppointments(data))
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

// edit todays appointments data
export const editTodayAppointmentsData =
  (appintment: TodayAppointments) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(
        HOSTPITA_TODAY_APPOINTMENT_APT,
        appintment,
        'appointments'
      )
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-hospital-appointments-todaylist',
        data as unknown as LocalStorageRecord
      )
      dispatch(editTodaysAppointments(data))
    } catch (error) {
      let errorMessage = 'appointments record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('appointments record updation failed:', error)
    }
  }

// delete todays appointments data
export const deleteTodayAppointmentsData =
  (staff: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = staff.map(async (id) => {
        const response = await customDelete(
          HOSTPITA_TODAY_APPOINTMENT_APT,
          id,
          'appointments'
        )
        const { message } = response
        toast.success(message || 'appointments record deleted successfully', {
          autoClose: 3000,
        })
        return response.data
      })
      const deletedProducts = await Promise.all(deletePromises)
      dispatch(deleteTodaysAppointments(deletedProducts))
      deleteLocalStorageRecord({
        key: 'd-hospital-appointments-todaylist',
        listRecord: staff,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'appointments record deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('appointments record deletion failed:', error)
    }
  }

//appintment

// get appointments List data
export const getAppointmentsListData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage('d-hospital-appointments-list')
      if (!responseData) {
        const response = await api.get(HOSPITAL_APPOINTMENT_API)
        const { data } = response
        createLocalStorage('d-hospital-appointments-list', data)
        dispatch(getAppointmentsList(data))
      } else {
        const validResponseData: AppointmentList[] = Array.isArray(responseData)
          ? responseData
          : []
        dispatch(getAppointmentsList(validResponseData))
      }
    } else {
      const response = await api.get(HOSPITAL_APPOINTMENT_API)
      const { data } = response
      dispatch(getAppointmentsList(data))
    }
  } catch (error) {
    let errorMessage = 'appointment data Fetch failed'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
    }
    toast.error(errorMessage, { autoClose: 3000 })
    console.error('appointment data Fetch failed:', error)
  }
}

// add new appointments list data
export const addAppointmentsListData =
  (newRecord: AppointmentList) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(
        HOSPITAL_APPOINTMENT_API,
        newRecord,
        'appointment'
      )
      const { data, message } = response
      toast.success(message || 'appointment added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-hospital-appointments-list', { ...data })
      dispatch(addAppointmentsList(data))
    } catch (error) {
      let errorMessage = 'appointment addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('appointment addition failed:', error)
    }
  }

// edit appointments list data
export const editAppointmentsListData =
  (appointment: AppointmentList) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(
        HOSPITAL_APPOINTMENT_API,
        appointment,
        'appointments'
      )
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-hospital-appointments-list',
        data as unknown as LocalStorageRecord
      )
      dispatch(editAppointmentsList(data))
    } catch (error) {
      let errorMessage = 'appointments record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('appointments record updation failed:', error)
    }
  }

// delete appointments list data
export const deleteAppointmentsListData =
  (appintment: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = appintment.map(async (id) => {
        const response = await customDelete(
          HOSPITAL_APPOINTMENT_API,
          id,
          'appointments'
        )
        const { message } = response
        toast.success(message || 'appointments deleted successfully', {
          autoClose: 3000,
        })
        return response.data
      })
      const deletedProducts = await Promise.all(deletePromises)
      dispatch(deleteAppointmentsList(deletedProducts))
      deleteLocalStorageRecord({
        key: 'd-hospital-appointments-list',
        listRecord: appintment,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'appointments deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('appointments deletion failed:', error)
    }
  }
