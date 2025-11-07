import { ProjectList } from '@src/dtos'
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
import { NEXT_PUBLIC_PROJECT_LIST_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import {
  addProjectList,
  deleteProjectList,
  editProjectList,
  getProjectList,
} from './reducer'

const PROJECT_LIST_API = NEXT_PUBLIC_PROJECT_LIST_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

// get data
export const getProjectListData = () => async (dispatch: AppDispatch) => {
  try {
    if (!IsApi) {
      const responseData = (await getLocalStorage('d-project-list')) as
        | ProjectList[]
        | null
      if (!responseData) {
        const response = await api.get(PROJECT_LIST_API)
        const { data } = response
        createLocalStorage('d-project-list', data)
        dispatch(getProjectList(data))
      } else {
        dispatch(getProjectList(responseData || []))
      }
    } else {
      const response = await api.get(PROJECT_LIST_API)
      const { data } = response
      dispatch(getProjectList(data))
    }
  } catch (error: unknown) {
    let errorMessage = 'Projects List Fetch failed'
    if (error instanceof AxiosError && error.response?.data) {
      const apiError = error.response.data
      errorMessage = apiError.message || errorMessage
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    toast.error(errorMessage, { autoClose: 3000 })
    console.error('Error fetching project list data:', error)
  }
}

// add record
export const addProjectListData =
  (newRecord: ProjectList) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(PROJECT_LIST_API, newRecord, 'Project')
      const { data, message } = response
      toast.success(message || 'Project record added successfully', {
        autoClose: 3000,
      })
      addLocalStorageRecord('d-project-list', { ...data })
      dispatch(addProjectList(data))
    } catch (error: unknown) {
      let errorMessage = 'Project record addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data
        errorMessage = apiError.message || errorMessage
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('Error adding record:', error)
    }
  }

// edit data
export const editProjectData =
  (project: ProjectList) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(PROJECT_LIST_API, project, 'project')
      const { data, message } = response
      toast.success(message || 'Project record updated successfully', {
        autoClose: 3000,
      })
      updateLocalStorageRecord(
        'd-project-list',
        data as unknown as LocalStorageRecord
      )
      dispatch(editProjectList(data))
    } catch (error: unknown) {
      let errorMessage = 'Project record update failed'
      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data
        errorMessage = apiError.message || errorMessage
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('Error updating record:', error)
    }
  }

// delete data
export const deleteProjectListData =
  (projects: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = projects.map(async (id) => {
        const response = await customDelete(PROJECT_LIST_API, id, 'project')
        const { message } = response
        toast.success(message || 'Project record deleted successfully', {
          autoClose: 3000,
        })
        return response.data
      })
      const deletedProjects = await Promise.all(deletePromises)
      dispatch(deleteProjectList(deletedProjects))
      deleteLocalStorageRecord({
        key: 'd-project-list',
        listRecord: projects,
        multipleRecords: true,
      })
    } catch (error: unknown) {
      let errorMessage = 'Project record deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data
        errorMessage = apiError.message || errorMessage
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      toast.error(errorMessage, { autoClose: 3000 })
      console.error('Error deleting records:', error)
    }
  }
