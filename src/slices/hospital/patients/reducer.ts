import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { Patients } from '@src/dtos'
import { initStore } from '@src/utils/init_store'

interface patientsState {
  patients: Patients[] | null
  isLoading: boolean
  editeMode: boolean
  currentPatients: Patients | null
}

const initialState: patientsState = {
  patients: initStore('d-hospital-patients-list') as Patients[] | null,
  isLoading: false,
  editeMode: false,
  currentPatients: null,
}

const PatientsListSlice = createSlice({
  name: 'patient-list',
  initialState,
  reducers: {
    // get event list data
    getPatients(state, action: PayloadAction<Patients[]>) {
      state.patients = action.payload
    },

    // add new event list
    addPatients(state, action: PayloadAction<Patients>) {
      const newPatients = action.payload
      if (state.patients !== null) {
        state.patients.unshift(newPatients)
      } else {
        state.patients = [newPatients]
      }
    },

    // edit event list
    editPatients(state, action: PayloadAction<Patients>) {
      const patinets = action.payload
      if (state.patients !== null) {
        const findPatientsIndex = state.patients.findIndex(
          (item) => item.id === patinets.id
        )
        const findPatientsRecord = state.patients.find(
          (item) => item.id === patinets.id
        )
        if (findPatientsIndex !== -1 && findPatientsRecord) {
          state.patients[findPatientsIndex] = patinets
        }
      }
    },

    // delete event list
    deletePatients(state, action: PayloadAction<number[]>) {
      if (state.patients !== null) {
        state.patients = state.patients.filter(
          (item) => !action.payload.includes(item.id)
        )
      }
    },

    // set current event list
    setCurrentPatients(
      state,
      action: PayloadAction<{ patient: Patients; mode: boolean }>
    ) {
      const { patient, mode } = action.payload
      if (patient !== null && patient !== undefined && mode !== undefined) {
        state.editeMode = mode
        state.currentPatients = patient
      }
    },
  },
})

export const {
  getPatients,
  addPatients,
  editPatients,
  deletePatients,
  setCurrentPatients,
} = PatientsListSlice.actions
export default PatientsListSlice.reducer
