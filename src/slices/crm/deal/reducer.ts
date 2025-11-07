import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { DealItem } from '@src/dtos'
import { initStore } from '@src/utils/init_store'

interface DealState {
  deal: DealItem[]
  isLoading: boolean
}

const initialState: DealState = {
  deal: initStore('d-crm-deal-list') as DealItem[],
  isLoading: false,
}

const DealSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    // get contact list data
    getDealList(state, action: PayloadAction<DealItem[]>) {
      state.deal = action.payload
    },
    deleteDealList(state, action: PayloadAction<number[]>) {
      if (state.deal !== null) {
        state.deal = state.deal.filter(
          (item) => !action.payload.includes(item.id)
        )
      }
    },
  },
})

export const { getDealList, deleteDealList } = DealSlice.actions
export default DealSlice.reducer
