import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { FileListRecord } from '@src/dtos/apps/filemanager'
import { initStore } from '@src/utils/init_store'

interface FileStates {
  fileList: FileListRecord[] | null
  isLoading: boolean
}

const initialState: FileStates = {
  fileList: initStore('d-file-list') as FileListRecord[] | null,
  isLoading: false,
}

const FileListSlice = createSlice({
  name: 'fileList',
  initialState,
  reducers: {
    // get FileList data
    getFileList(state, action: PayloadAction<FileListRecord[]>) {
      state.fileList = action.payload
    },

    // delete files
    deleteFileList(state, action: PayloadAction<number[]>) {
      if (state.fileList !== null) {
        state.fileList = state.fileList.filter(
          (item) => !action.payload.includes(item.id)
        )
      }
    },

    // edit FileList data
    editFileList(state, action: PayloadAction<FileListRecord>) {
      const file = action.payload
      if (state.fileList !== null) {
        const findFileIndex = state.fileList.findIndex(
          (item) => item.id === file.id
        )
        const findFileRecord = state.fileList.find(
          (item) => item.id === file.id
        )
        if (findFileIndex !== -1 && findFileRecord) {
          state.fileList[findFileIndex] = file
        }
      }
    },

    // Add files
    addFileList(state, action: PayloadAction<FileListRecord>) {
      const newRecord = action.payload
      if (newRecord !== null) {
        state.fileList?.unshift(newRecord)
      } else {
        state.fileList = [newRecord]
      }
    },
  },
})

export const { getFileList, deleteFileList, editFileList, addFileList } =
  FileListSlice.actions
export default FileListSlice.reducer
