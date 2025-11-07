import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { StudentList } from '@src/dtos'
import { initStore } from '@src/utils/init_store'

interface StudentState {
  studentList: StudentList[] | null
  isLoading: boolean
  editeMode: boolean
  currentStudent: StudentList | null
}

const initialState: StudentState = {
  studentList: initStore('d-students-list') as StudentList[] | null,
  isLoading: false,
  editeMode: false,
  currentStudent: null,
}

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    //get student List
    getStudentList(state, action: PayloadAction<StudentList[]>) {
      state.studentList = action.payload
    },

    //add student list
    addStudentList(state, action: PayloadAction<StudentList>) {
      const newStudent = action.payload
      if (state.studentList !== null) {
        state.studentList.unshift(newStudent)
      } else {
        state.studentList = [newStudent]
      }
    },

    //edite student list
    editStudentList(state, action: PayloadAction<StudentList>) {
      const student = action.payload
      if (state.studentList !== null) {
        const findStudentIndex = state.studentList.findIndex(
          (item) => item.id === student.id
        )
        const findStudentRecord = state.studentList.find(
          (item) => item.id === student.id
        )
        if (findStudentIndex !== -1 && findStudentRecord) {
          state.studentList[findStudentIndex] = student
        }
      }
    },

    //delete student list
    deleteStudentList(state, action: PayloadAction<number[]>) {
      if (state.studentList !== null) {
        state.studentList = state.studentList.filter(
          (item) => !action.payload.includes(item.id)
        )
      }
    },

    setCurrentStudent(
      state,
      action: PayloadAction<{ student: StudentList; mode: boolean }>
    ) {
      const { student, mode } = action.payload
      if (student !== null && student !== undefined && mode !== undefined) {
        state.editeMode = mode
        state.currentStudent = student
      }
    },
  },
})

export const {
  getStudentList,
  addStudentList,
  editStudentList,
  deleteStudentList,
  setCurrentStudent,
} = studentSlice.actions

export default studentSlice.reducer
