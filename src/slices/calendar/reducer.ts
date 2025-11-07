import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { EventItem } from '@src/dtos'
import { initStore } from '@src/utils/init_store'

interface CalendarState {
  calendar: EventItem[]
  isLoading: boolean
}

const initialState: CalendarState = {
  calendar: initStore('d-calendar-list') as EventItem[],
  isLoading: false,
}

const CalendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    // get calendar data
    getCalendarList(state, action: PayloadAction<EventItem[]>) {
      state.calendar = action.payload
    },

    // delete calendar data
    deleteCalendarList(state, action: PayloadAction<number[]>) {
      if (state.calendar !== null) {
        state.calendar = state.calendar.filter(
          (item) => !action.payload.includes(item.id as number)
        )
      }
    },

    // edit calendar data
    editCalendarList(state, action: PayloadAction<EventItem>) {
      const calendar = action.payload
      if (state.calendar !== null) {
        const findCalendarIndex = state.calendar.findIndex(
          (item) => item.id === calendar.id
        )
        const findCalendarRecord = state.calendar.find(
          (item) => item.id === calendar.id
        )
        if (findCalendarIndex !== -1 && findCalendarRecord) {
          state.calendar[findCalendarIndex] = calendar
        }
      }
    },

    // add new calendar data
    addCalendarList(state, action: PayloadAction<EventItem>) {
      const newCalendar = action.payload
      if (state.calendar !== null) {
        state.calendar.push(newCalendar)
      } else {
        state.calendar = [newCalendar]
      }
    },
  },
})

export const {
  getCalendarList,
  addCalendarList,
  editCalendarList,
  deleteCalendarList,
} = CalendarSlice.actions
export default CalendarSlice.reducer
