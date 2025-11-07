import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { TeacherPayroll } from '@src/dtos'
import { initStore } from '@src/utils/init_store'

interface PayrollState {
  payroll: TeacherPayroll[] | null
  isLoading: boolean
}

const initialState: PayrollState = {
  payroll: initStore('d-teacher-payroll') as TeacherPayroll[] | null,
  isLoading: false,
}

const payrollSlice = createSlice({
  name: 'teacher_payroll',
  initialState,
  reducers: {
    //get teacher payroll data
    getPayrollList(state, action: PayloadAction<TeacherPayroll[]>) {
      state.payroll = action.payload
    },

    //add teacher payroll data
    addPayrollList(state, action: PayloadAction<TeacherPayroll>) {
      const newPayroll = action.payload
      if (state.payroll !== null) {
        state.payroll.unshift(newPayroll)
      } else {
        state.payroll = [newPayroll]
      }
    },

    //edite teacher payroll data
    editPayrollList(state, action: PayloadAction<TeacherPayroll>) {
      const payroll = action.payload
      if (state.payroll !== null) {
        const findPayrollIndex = state.payroll.findIndex(
          (item) => item.id === payroll.id
        )
        const findPayrollRecord = state.payroll.find(
          (item) => item.id === payroll.id
        )
        if (findPayrollIndex !== -1 && findPayrollRecord) {
          state.payroll[findPayrollIndex] = payroll
        }
      }
    },

    //delete teacher payroll data
    deletePayrollList(state, action: PayloadAction<number[]>) {
      if (state.payroll !== null) {
        state.payroll = state.payroll.filter(
          (item) => !action.payload.includes(item.id)
        )
      }
    },
  },
})

export const {
  getPayrollList,
  addPayrollList,
  editPayrollList,
  deletePayrollList,
} = payrollSlice.actions

export default payrollSlice.reducer
