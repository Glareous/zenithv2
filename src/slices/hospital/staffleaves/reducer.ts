import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { StaffLeaves } from '@src/dtos'
import { initStore } from '@src/utils/init_store'

interface StaffLeaveState {
  staffLeave: StaffLeaves[]
  isLoading: boolean
}

const initialState: StaffLeaveState = {
  staffLeave: initStore('d-hospital-staff-leave') as StaffLeaves[],
  isLoading: false,
}

const StaffLeavesListSlice = createSlice({
  name: 'staffleave',
  initialState,
  reducers: {
    getStaffLeaveList(state, action: PayloadAction<StaffLeaves[]>) {
      state.staffLeave = action.payload
    },
    addStaffLeaveList(state, action: PayloadAction<StaffLeaves>) {
      if (state.staffLeave !== null) {
        state.staffLeave.unshift(action.payload)
      } else {
        state.staffLeave = [action.payload]
      }
    },
    editStaffLeaveList(state, action: PayloadAction<StaffLeaves>) {
      const staffLeave = action.payload
      if (state.staffLeave !== null) {
        const findStaffIndex = state.staffLeave.findIndex(
          (item) => item.id === staffLeave.id
        )
        const findStaffRecord = state.staffLeave.find(
          (item) => item.id === staffLeave.id
        )
        if (findStaffIndex !== -1 && findStaffRecord) {
          state.staffLeave[findStaffIndex] = staffLeave
        }
      }
    },
    deleteStaffLeaveList(state, action: PayloadAction<number[]>) {
      if (state.staffLeave !== null) {
        state.staffLeave = state.staffLeave.filter(
          (item) => !action.payload.includes(item.id)
        )
      }
    },
  },
})

export const {
  getStaffLeaveList,
  addStaffLeaveList,
  editStaffLeaveList,
  deleteStaffLeaveList,
} = StaffLeavesListSlice.actions
export default StaffLeavesListSlice.reducer
