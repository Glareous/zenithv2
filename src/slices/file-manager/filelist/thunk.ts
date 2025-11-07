import { FileListRecord } from '@src/dtos/apps/filemanager'
import { AppDispatch } from '@src/slices/reducer'
import api, { customDelete, customPut } from '@src/utils/axios_api'
import {
  LocalStorageRecord,
  createLocalStorage,
  deleteLocalStorageRecord,
  getLocalStorage,
  updateLocalStorageRecord,
} from '@src/utils/crud_functions'
import { NEXT_PUBLIC_FILE_MANAGER_API } from '@src/utils/url_helper'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

import { deleteFileList, editFileList, getFileList } from './reducer'

const FILE_LIST_API = NEXT_PUBLIC_FILE_MANAGER_API
const IsApi = process.env.NEXT_PUBLIC_IS_API_ACTIVE === 'true'

export const getFileListData = () => async (dispatch: AppDispatch) => {
  try {
    if (IsApi === false) {
      const responseData = (await getLocalStorage('d-file-list')) as
        | FileListRecord[]
        | null
      if (!responseData) {
        const response = await api.get(FILE_LIST_API)
        const { data } = response
        createLocalStorage('d-file-list', data)
        dispatch(getFileList(data))
      } else {
        dispatch(getFileList(responseData))
      }
    } else {
      const response = await api.get(FILE_LIST_API)
      const { data } = response
      dispatch(getFileList(data))
    }
  } catch (error) {
    let errorMessage = 'Error fetching file data'
    if (error instanceof AxiosError && error.response?.data) {
      errorMessage =
        error.response.data.message || error.message || errorMessage
      toast.error(errorMessage, { autoClose: 3000 })
    }
    console.error('Error fetching file data:', error)
  }
}

//  delete file
export const deleteFileData =
  (file: number[]) => async (dispatch: AppDispatch) => {
    try {
      const deletePromises = file.map(async (id) => {
        const response = await customDelete(FILE_LIST_API, id, 'File')
        const { message, data } = response
        // DeleteToast(message)
        toast.success(message || 'file deleted successfully', {
          autoClose: 3000,
        })
        return data
      })
      const deletedFile = await Promise.all(deletePromises)
      dispatch(deleteFileList(deletedFile))
      deleteLocalStorageRecord({
        key: 'd-file-list',
        listRecord: file,
        multipleRecords: true,
      })
    } catch (error) {
      let errorMessage = 'file record deletion failed'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('file record deletion failed:', error)
    }
  }

// edit customer record
export const editFileRecordData =
  (file: FileListRecord) => async (dispatch: AppDispatch) => {
    try {
      const response = await customPut(FILE_LIST_API, file, 'customer')
      const { data, message } = response
      updateLocalStorageRecord(
        'd-file-list',
        data as unknown as LocalStorageRecord
      )
      dispatch(editFileList(data))
      // setTimeout(() => {
      //     UpdateToast(message)
      // }, 2000);
      toast.success(message || 'file updated successfully', {
        autoClose: 3000,
      })
    } catch (error) {
      let errorMessage = 'Error adding record'
      if (error instanceof AxiosError && error.response?.data) {
        errorMessage =
          error.response.data.message || error.message || errorMessage
        toast.error(errorMessage, { autoClose: 3000 })
      }
      console.error('file record updation failed', error)
    }
  }
