import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { ExamSchedule } from '@src/dtos'
import { initStore } from '@src/utils/init_store'

interface ExamScheduleState {
  examSchedule: ExamSchedule[] | null
  isLoading: boolean
}

const initialState: ExamScheduleState = {
  examSchedule: initStore('d-exam-schedule') as ExamSchedule[] | null,
  isLoading: false,
}

const examScheduleSlice = createSlice({
  name: 'examSchedule',
  initialState,
  reducers: {
    //get book List
    getExamList(state, action: PayloadAction<ExamSchedule[]>) {
      state.examSchedule = action.payload
    },

    //add book
    addExamList(state, action: PayloadAction<ExamSchedule>) {
      const newExam = action.payload
      if (state.examSchedule !== null) {
        state.examSchedule.unshift(newExam)
      } else {
        state.examSchedule = [newExam]
      }
    },

    //edit book
    editExamList(state, action: PayloadAction<ExamSchedule>) {
      const exam = action.payload
      if (state.examSchedule !== null) {
        const findExamIndex = state.examSchedule.findIndex(
          (item) => item.id === exam.id
        )
        const findExamRecord = state.examSchedule.find(
          (item) => item.id === exam.id
        )
        if (findExamIndex !== -1 && findExamRecord) {
          state.examSchedule[findExamIndex] = exam
        }
      }
    },

    //delete book
    deleteExamList(state, action: PayloadAction<number[]>) {
      if (state.examSchedule !== null) {
        state.examSchedule = state.examSchedule.filter(
          (item) => !action.payload.includes(item.id)
        )
      }
    },
  },
})

export const { getExamList, addExamList, editExamList, deleteExamList } =
  examScheduleSlice.actions

export default examScheduleSlice.reducer
