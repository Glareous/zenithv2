import { Patients } from '@src/dtos'
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
import { NEXT_PUBLIC_HOSPITAL_PATIENTS_LIST_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import {
  addPatients,
  deletePatients,
  editPatients,
  getPatients,
  setCurrentPatients,
} from './reducer'

const HOSPITAL_PATINETS_API = NEXT_PUBLIC_HOSPITAL_PATIENTS_LIST_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get patients data
export const getPatientsData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = (await getLocalStorage(
        'd-hospital-patients-list'
      )) as Patients[] | null
      if (!responseData) {
        const response = await api.get(HOSPITAL_PATINETS_API)
        const { data } = response
        createLocalStorage('d-hospital-patients-list', data)
        dispatch(getPatients(data))
      } else {
        dispatch(getPatients(responseData || []))
      }
    } else {
      const response = await api.get(HOSPITAL_PATINETS_API)
      const { data } = response
      dispatch(getPatients(data))
    }
  } catch (error) {
    let errorMessage = 'patients List Fetch Failed'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
    }
    toast.error(errorMessage, { autoClose: 3000 })
    console.error('patients List Fetch Failed:', error)
  }
}
// add new patients
export const addPatientsData =
  (newRecord: Patients) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(
        HOSPITAL_PATINETS_API,
        newRecord,
        'patients'
      )
      const { data, message } = response
      toast.success(message || 'patients record added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-hospital-patients-list', { ...data })
      dispatch(addPatients(data))
    } catch (error) {
      let errorMessage = 'patients addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('patients addition failed:', error)
    }
  }

// edit patients
export const editPatientsData =
  (patient: Patients) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(
        HOSPITAL_PATINETS_API,
        patient,
        'patient'
      )
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-hospital-patients-list',
        data as unknown as LocalStorageRecord
      )
      dispatch(editPatients(data))
    } catch (error) {
      let errorMessage = 'patient record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('patient record updation failed:', error)
    }
  }

// delete patients
export const deletePatientsData =
  (patient: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = patient.map(async (id) => {
        const response = await customDelete(
          HOSPITAL_PATINETS_API,
          id,
          'patient'
        )
        const { message } = response
        toast.success(message || 'patient deleted successfully', {
          autoClose: 3000,
        })
        return response.data
      })
      const deletedProducts = await Promise.all(deletePromises)
      dispatch(deletePatients(deletedProducts))
      deleteLocalStorageRecord({
        key: 'd-hospital-patients-list',
        listRecord: patient,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'patient deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('patient deletion failed:', error)
    }
  }

// update current patients
export const modifyCurrentPatients =
  (modifyPatint: Patients, patientMode: boolean) =>
  async (dispatch: AppDispatch) => {
    try {
      const response = { data: modifyPatint, editeMode: patientMode }
      dispatch(
        setCurrentPatients({ patient: response.data, mode: response.editeMode })
      )
    } catch (error) {
      console.error(error)
    }
  }
