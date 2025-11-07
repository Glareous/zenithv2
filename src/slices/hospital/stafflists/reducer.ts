import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { StaffList } from '@src/dtos'
import { initStore } from '@src/utils/init_store'

interface StaffListState {
  staffList: StaffList[] | null
  isLoading: boolean
}

const initialState: StaffListState = {
  staffList: initStore('d-hospital-staff-list') as StaffList[] | null,
  isLoading: false,
}

const StaffListSlice = createSlice({
  name: 'staffList',
  initialState,
  reducers: {
    getStaffList(state, action: PayloadAction<StaffList[]>) {
      state.staffList = action.payload
    },

    addStaffList(state, action: PayloadAction<StaffList>) {
      const newStaff = action.payload
      if (state.staffList !== null) {
        state.staffList.unshift(newStaff)
      } else {
        state.staffList = [newStaff]
      }
    },
    editStaffList(state, action: PayloadAction<StaffList>) {
      const staff = action.payload
      if (state.staffList !== null) {
        const findStaffIndex = state.staffList.findIndex(
          (item) => item.id === staff.id
        )
        const findStaffRecord = state.staffList.find(
          (item) => item.id === staff.id
        )
        if (findStaffIndex !== -1 && findStaffRecord) {
          state.staffList[findStaffIndex] = staff
        }
      }
    },

    deleteStaffList(state, action: PayloadAction<number[]>) {
      if (state.staffList !== null) {
        state.staffList = state.staffList.filter(
          (item) => !action.payload.includes(item.id)
        )
      }
    },
  },
})

export const { getStaffList, addStaffList, editStaffList, deleteStaffList } =
  StaffListSlice.actions

export default StaffListSlice.reducer
