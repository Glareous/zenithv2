import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { TeacherListList } from '@src/dtos'
import { initStore } from '@src/utils/init_store'

interface TeacherListState {
  teacherList: TeacherListList[] | null
  isLoading: boolean
}

const initialState: TeacherListState = {
  teacherList: initStore('d-teacher-list') as TeacherListList[] | null,
  isLoading: false,
}

const teacherListSlice = createSlice({
  name: 'teacherList',
  initialState,
  reducers: {
    //get teacher list
    getTeacherList(state, action: PayloadAction<TeacherListList[]>) {
      state.teacherList = action.payload
    },

    //add teacher
    addTeacherList(state, action: PayloadAction<TeacherListList>) {
      const newStaff = action.payload
      if (state.teacherList !== null) {
        state.teacherList.unshift(newStaff)
      } else {
        state.teacherList = [newStaff]
      }
    },

    //edit teacher list
    editTeacherList(state, action: PayloadAction<TeacherListList>) {
      const teacher = action.payload
      if (state.teacherList !== null) {
        const findTeacherIndex = state.teacherList.findIndex(
          (item) => item.id === teacher.id
        )
        const findTeacherRecord = state.teacherList.find(
          (item) => item.id === teacher.id
        )
        if (findTeacherIndex !== -1 && findTeacherRecord) {
          state.teacherList[findTeacherIndex] = teacher
        }
      }
    },

    //delete teacher record
    deleteTeacherList(state, action: PayloadAction<number[]>) {
      if (state.teacherList !== null) {
        state.teacherList = state.teacherList.filter(
          (item) => !action.payload.includes(item.id)
        )
      }
    },
  },
})

export const {
  getTeacherList,
  addTeacherList,
  editTeacherList,
  deleteTeacherList,
} = teacherListSlice.actions

export default teacherListSlice.reducer
