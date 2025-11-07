import { FolderListRecord } from '@src/dtos/apps/filemanager'
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
import { NEXT_PUBLIC_FILE_MANAGER_FOLDER_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import {
  addFolderList,
  deleteFolderList,
  editFolderList,
  getFolderList,
} from './reducer'

const FOLDER_LIST_API = NEXT_PUBLIC_FILE_MANAGER_FOLDER_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

export const getFolderListData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = (await getLocalStorage('d-folder-list')) as
        | FolderListRecord[]
        | null
      if (!responseData || !Array.isArray(responseData)) {
        const response = await api.get(FOLDER_LIST_API)
        if (response.status !== 200)
          throw new Error('Unexpected error occurred')
        const data = response.data
        createLocalStorage('d-folder-list', data)
        dispatch(getFolderList(data))
      } else {
        dispatch(getFolderList(responseData))
      }
    } else {
      const response = await api.get(FOLDER_LIST_API)
      const { data } = response
      dispatch(getFolderList(data))
    }
  } catch (error) {
    let errorMessage = 'Error feach record'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
      toast.error(errorMessage, { autoClose: 3000 })
    }
    console.error('Error feach record:', error)
  }
}

//  delete Folder
export const deleteFolderData =
  (folder: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = folder.map(async (id) => {
        const response = await customDelete(FOLDER_LIST_API, id, 'Folder')
        if (!response.data) throw new Error(response.message)
        const data = response.data
        toast.success(response.message || 'folder deleted successfully', {
          autoClose: 3000,
        })
        return data
      })
      const deletedFolder = await Promise.all(deletePromises)
      dispatch(deleteFolderList(deletedFolder))

      deleteLocalStorageRecord({
        key: 'd-folder-list',
        listRecord: folder,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'Folder record deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('Folder record deletion failed:', error)
    }
  }

// edit folder record
export const editFolderRecordData =
  (folder: FolderListRecord) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(FOLDER_LIST_API, folder, 'folder')
      const { data, message } = response
      toast.success(message || 'folder updated successfully', {
        autoClose: 3000,
      })
      updateLocalStorageRecord(
        'd-folder-list',
        data as unknown as LocalStorageRecord
      )
      dispatch(editFolderList(data))
    } catch (error) {
      let errorMessage = 'customer record updation failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('customer record updation failed:', error)
    }
  }

// add folder record
export const addFolderRecordData =
  (newRecord: FolderListRecord) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPost(FOLDER_LIST_API, newRecord, 'folder')
      const { data, message } = response
      addLocalStorageRecord('d-folder-list', { ...data })
      dispatch(addFolderList(data))
      toast.success(message || 'folder added successfully', {
        autoClose: 3000,
      })
    } catch (error) {
      let errorMessage = 'folder record addition failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('folder record addition failed:', error)
    }
  }
