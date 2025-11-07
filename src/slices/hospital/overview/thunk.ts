import { Appointments, Medicine, Reports } from '@src/dtos'
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
  NEXT_PUBLIC_HOSPITAL_APPOINTMENT_APT,
  NEXT_PUBLIC_HOSPITAL_MEDICINE_APT,
  NEXT_PUBLIC_HOSPITAL_REPORTS_APT,
} from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import {
  addAppointments,
  addMedicine,
  addReport,
  deleteAppointments,
  deleteMedicine,
  deleteReport,
  editAppointments,
  editMedicine,
  editReport,
  getAppointments,
  getMedicine,
  getReport,
} from './reducer'

const HOSPITAL_REPORTS_API = NEXT_PUBLIC_HOSPITAL_REPORTS_APT
const HOSPITAL_MEDICINE_API = NEXT_PUBLIC_HOSPITAL_MEDICINE_APT
const HOSPITAL_APPOINTMENT_API = NEXT_PUBLIC_HOSPITAL_APPOINTMENT_APT
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get reports data
export const getReportstData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage('d-hospital-reports')
      if (!responseData) {
        const response = await api.get(HOSPITAL_REPORTS_API)
        const { data } = response
        createLocalStorage('d-hospital-reports', data)
        dispatch(getReport(data))
      } else if (Array.isArray(responseData)) {
        dispatch(getReport(responseData as Reports[]))
      } else {
        throw new Error('Invalid data format in local storage for reports')
      }
    } else {
      const response = await api.get(HOSPITAL_REPORTS_API)
      const { data } = response
      dispatch(getReport(data))
    }
  } catch (error) {
    let errorMessage = 'Patients List  Fetch Failed'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
    }
    toast.error(errorMessage, { autoClose: 3000 })
    console.error('Patients List  Fetch Failed:', error)
  }
}

// add new report
export const addReportstData =
  (newRecord: Reports) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(
        HOSPITAL_REPORTS_API,
        newRecord,
        'reports'
      )
      const { data, message } = response
      toast.success(message || 'reports added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-hospital-reports', { ...data })
      dispatch(addReport(data))
    } catch (error) {
      let errorMessage = 'reports addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('reports addition failed:', error)
    }
  }

//edite reports data
export const editReportstData =
  (reports: Reports) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(HOSPITAL_REPORTS_API, reports, 'reports')
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-hospital-reports',
        data as unknown as LocalStorageRecord
      )
      dispatch(editReport(data))
    } catch (error) {
      let errorMessage = 'reports record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('reports record updation failed:', error)
    }
  }

export const deleteReportstData =
  (reports: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = reports.map(async (id) => {
        const response = await customDelete(HOSPITAL_REPORTS_API, id, 'reports')
        const { message } = response
        toast.success(message || 'reports record deleted successfully', {
          autoClose: 3000,
        })
        return response.data
      })
      const deletedProducts = await Promise.all(deletePromises)
      dispatch(deleteReport(deletedProducts))
      deleteLocalStorageRecord({
        key: 'd-hospital-reports',
        listRecord: reports,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'reports record deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('reports record deletion failed:', error)
    }
  }

//madicin

//get madicine data

export const getMedicineData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage('d-hospital-madicine')
      if (!responseData) {
        const response = await api.get(HOSPITAL_MEDICINE_API)
        const { data } = response
        createLocalStorage('d-hospital-madicine', data)
        dispatch(getMedicine(data))
      } else {
        dispatch(getMedicine(responseData as Medicine[]))
      }
    } else {
      const response = await api.get(HOSPITAL_MEDICINE_API)
      const { data } = response
      dispatch(getMedicine(data))
    }
  } catch (error) {
    let errorMessage = 'Error fetching madicine data'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
    }
    toast.error(errorMessage, { autoClose: 3000 })
    console.error('Error fetching madicine data:', error)
  }
}

//add madicine data
export const addMedicineData =
  (newRecord: Medicine) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(
        HOSPITAL_MEDICINE_API,
        newRecord,
        'madicine'
      )
      const { data, message } = response
      toast.success(message || 'madicine record added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-hospital-madicine', { ...data })
      dispatch(addMedicine(data))
    } catch (error) {
      let errorMessage = 'madicine addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('madicine addition failed:', error)
    }
  }

//edite madicine data
export const editMedicineData =
  (staff: Medicine) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(HOSPITAL_MEDICINE_API, staff, 'madicine')
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-hospital-madicine',
        data as unknown as LocalStorageRecord
      )
      dispatch(editMedicine(data))
    } catch (error) {
      let errorMessage = 'madicine record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('madicine record updation failed:', error)
    }
  }

// delete madicine data
export const deleteMedicineData =
  (madicine: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = madicine.map(async (id) => {
        const response = await customDelete(
          HOSPITAL_MEDICINE_API,
          id,
          'madicine'
        )
        const { message } = response
        toast.success(message || 'madicine record deleted successfully', {
          autoClose: 3000,
        })
        return response.data
      })
      const deletedProducts = await Promise.all(deletePromises)
      dispatch(deleteMedicine(deletedProducts))
      deleteLocalStorageRecord({
        key: 'd-hospital-staff-list',
        listRecord: madicine,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'madicine record deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('madicine record deletion failed:', error)
    }
  }

//Appointments

// get appointments data
export const getAppointmentsData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage('d-hospital-appointments')
      if (!responseData) {
        const response = await api.get(HOSPITAL_APPOINTMENT_API)
        const { data } = response
        createLocalStorage('d-hospital-appointments', data)
        dispatch(getAppointments(data))
      } else {
        dispatch(getAppointments(responseData as Appointments[]))
      }
    } else {
      const response = await api.get(HOSPITAL_APPOINTMENT_API)
      const { data } = response
      dispatch(getAppointments(data))
    }
  } catch (error) {
    let errorMessage = 'Appointments Fetch Failed'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
    }
    toast.error(errorMessage, { autoClose: 3000 })
    console.error('Appointments Fetch Failed:', error)
  }
}

// add new appointments
export const addAppointmentsData =
  (newRecord: Appointments) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(
        HOSPITAL_APPOINTMENT_API,
        newRecord,
        'appointments'
      )
      const { data, message } = response
      toast.success(message || 'appointments added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-hospital-appointments', { ...data })
      dispatch(addAppointments(data))
    } catch (error) {
      let errorMessage = 'appointments addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('appointments addition failed:', error)
    }
  }

export const editAppointmentsData =
  (appointments: Appointments) => async (dispatch: AppDispatch) => {
    // edit appointments
    try {
      const response = await customPut(
        HOSPITAL_APPOINTMENT_API,
        appointments,
        'appointments'
      )
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-hospital-appointments',
        data as unknown as LocalStorageRecord
      )
      dispatch(editAppointments(data))
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

// delete appointments
export const deleteAppointmentsData =
  (staff: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = staff.map(async (id) => {
        const response = await customDelete(
          HOSPITAL_APPOINTMENT_API,
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
      dispatch(deleteAppointments(deletedProducts))
      deleteLocalStorageRecord({
        key: 'd-hospital-appointments',
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
