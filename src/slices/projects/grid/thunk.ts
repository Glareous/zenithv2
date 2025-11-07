import { ProjectList } from '@src/dtos/apps/projects'
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
import { NEXT_PUBLIC_PROJECT_GRID_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import {
  addProjectGrid,
  deleteProjectGrid,
  editProjectGrid,
  getProjectGrid,
} from './reducer'

const PROJECT_GRID_API = NEXT_PUBLIC_PROJECT_GRID_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get data
export const getProjectGridData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = await getLocalStorage('d-project-grid')
      if (!responseData) {
        const response = await api.get(PROJECT_GRID_API)
        const { data } = response
        createLocalStorage('d-project-grid', data)
        dispatch(getProjectGrid(data))
      } else {
        dispatch(getProjectGrid((responseData as ProjectList[]) || []))
      }
    } else {
      const response = await api.get(PROJECT_GRID_API)
      const { data } = response
      dispatch(getProjectGrid(data))
    }
  } catch (error) {
    let errorMessage = 'Projects Grid Fetch failed'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage = error.response.data.message || errorMessage
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    toast.error(errorMessage, { autoClose: 3000 })
    console.error('Error fetching project grid data:', error)
  }
}

// add record
export const addProjectGridData =
  (newRecord: ProjectList) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(PROJECT_GRID_API, newRecord, 'project')
      const { data, message } = response
      toast.success(message || 'Project record added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-project-grid', { ...data })
      dispatch(addProjectGrid(data))
    } catch (error: unknown) {
      let errorMessage = 'Project record addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage = error.response.data.message || errorMessage
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      toast.error(errorMessage || 'Project record addition failed', {
        autoClose: 3000,
      })
      console.error('Error adding record:', error)
    }
  }

// edit data
export const editProjectGridData =
  (project: ProjectList) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(PROJECT_GRID_API, project, 'project')
      const { data, message } = response
      toast.success(message, { autoClose: 3000 })
      updateLocalStorageRecord(
        'd-project-grid',
        data as unknown as LocalStorageRecord
      )
      dispatch(editProjectGrid(data))
    } catch (error: unknown) {
      let errorMessage = 'Project record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage = error.response.data.message || errorMessage
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      toast.error(errorMessage || 'Project record updation failed', {
        autoClose: 3000,
      })
      console.error('Error adding record:', error)
    }
  }

// delete data
export const deleteProjectGridData =
  (projects: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = projects.map(async (id) => {
        const response = await customDelete(PROJECT_GRID_API, id, 'project')
        const { data, message } = response
        toast.success(message || 'Project record deleted successfully', {
          autoClose: 3000,
        })
        return data
      })
      const deletedProjects = await Promise.all(deletePromises)
      dispatch(deleteProjectGrid(deletedProjects))
      deleteLocalStorageRecord({
        key: 'd-project-grid',
        listRecord: projects,
        multipleRecords: true,
      })
    } catch (error: unknown) {
      let errorMessage = 'Project record deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage = error.response.data.message || errorMessage
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('Error in deleting products: ', error)
    }
  }
