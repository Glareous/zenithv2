import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { ExamQuestion } from '@src/dtos'
import { initStore } from '@src/utils/init_store'

interface ExamQuestionState {
  examQuestion: ExamQuestion[] | null
  isLoading: boolean
}

const initialState: ExamQuestionState = {
  examQuestion: initStore('d-exam-question') as ExamQuestion[] | null,
  isLoading: false,
}

const questionSlice = createSlice({
  name: 'examQuestion',
  initialState,
  reducers: {
    //get Question List
    getQuestionList(state, action: PayloadAction<ExamQuestion[]>) {
      state.examQuestion = action.payload
    },

    //add Question
    addQuestionList(state, action: PayloadAction<ExamQuestion>) {
      const newQustion = action.payload
      if (state.examQuestion !== null) {
        state.examQuestion.unshift(newQustion)
      } else {
        state.examQuestion = [newQustion]
      }
    },

    //edit Question
    editQuestionList(state, action: PayloadAction<ExamQuestion>) {
      const question = action.payload
      if (state.examQuestion !== null) {
        const findExamIndex = state.examQuestion.findIndex(
          (item) => item.id === question.id
        )
        const findExamRecord = state.examQuestion.find(
          (item) => item.id === question.id
        )
        if (findExamIndex !== -1 && findExamRecord) {
          state.examQuestion[findExamIndex] = question
        }
      }
    },

    //delete Question
    deleteQuestionList(state, action: PayloadAction<number[]>) {
      if (state.examQuestion !== null) {
        state.examQuestion = state.examQuestion.filter(
          (item) => !action.payload.includes(item.id)
        )
      }
    },
  },
})

export const {
  getQuestionList,
  addQuestionList,
  editQuestionList,
  deleteQuestionList,
} = questionSlice.actions

export default questionSlice.reducer
