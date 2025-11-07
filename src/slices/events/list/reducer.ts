import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { EventList } from '@src/dtos'
import { initStore } from '@src/utils/init_store'

interface EventState {
  eventList: EventList[] | null
  isLoading: boolean
}

const initialState: EventState = {
  eventList: initStore('d-events-list') as EventList[] | null,
  isLoading: false,
}

const EventListSlice = createSlice({
  name: 'eventList',
  initialState,
  reducers: {
    // get event list data
    getEventList(state, action: PayloadAction<EventList[]>) {
      state.eventList = action.payload
    },

    // add new event list
    addEventList(state, action: PayloadAction<EventList>) {
      const newEvent = action.payload
      if (state.eventList !== null) {
        state.eventList.unshift(newEvent)
      } else {
        state.eventList = [newEvent]
      }
    },

    // update event list
    editEventList(state, action: PayloadAction<EventList>) {
      const events = action.payload
      if (state.eventList !== null) {
        const findEventIndex = state.eventList.findIndex(
          (item) => item.id === events.id
        )
        const findEventRecord = state.eventList.find(
          (item) => item.id === events.id
        )
        if (findEventIndex !== -1 && findEventRecord) {
          state.eventList[findEventIndex] = events
        }
      }
    },

    // delete event list
    deleteEventList(state, action: PayloadAction<number[]>) {
      if (state.eventList !== null) {
        state.eventList = state.eventList.filter(
          (item) => !action.payload.includes(item.id)
        )
      }
    },
  },
})

export const { getEventList, addEventList, editEventList, deleteEventList } =
  EventListSlice.actions
export default EventListSlice.reducer
