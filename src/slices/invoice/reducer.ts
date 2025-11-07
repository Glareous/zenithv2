import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { InvoiceList } from '@src/dtos'
import { initStore } from '@src/utils/init_store'

interface InvoiceState {
  invoiceList: InvoiceList[] | null
  isLoading: boolean
  isEditMode: boolean
  currentInvoiceRecord: InvoiceList | null
}

const initialState: InvoiceState = {
  invoiceList: initStore('d-invoice-list') as InvoiceList[] | null,
  isLoading: false,
  isEditMode: false,
  currentInvoiceRecord: null,
}

const ListSlice = createSlice({
  name: 'invoice_list',
  initialState,
  reducers: {
    // get invoice list
    getInvoiceList(state, action: PayloadAction<InvoiceList[]>) {
      state.invoiceList = action.payload
    },

    // delete invoice list record
    deleteInvoiceRecord(state, action: PayloadAction<number[]>) {
      if (state.invoiceList !== null) {
        state.invoiceList = state.invoiceList.filter(
          (item) => !action.payload.includes(item.id)
        )
      }
    },

    // edit invoice list record
    editInvoiceRecord(state, action: PayloadAction<InvoiceList>) {
      const invoiceRecord = action.payload
      if (state.invoiceList !== null) {
        const findInvoiceRecordIndex = state.invoiceList.findIndex(
          (item) => item.id === invoiceRecord.id
        )
        if (findInvoiceRecordIndex !== -1) {
          state.invoiceList[findInvoiceRecordIndex] = invoiceRecord
        }
      }
    },

    // add invoice list record
    addInvoiceRecord(state, action: PayloadAction<InvoiceList>) {
      const newInvoiceRecord = action.payload
      if (state.invoiceList !== null) {
        state.invoiceList.unshift(newInvoiceRecord)
      } else {
        state.invoiceList = [newInvoiceRecord]
      }
    },

    // set current invoice record
    setCurrentInvoiceRecord(
      state,
      action: PayloadAction<{ mode: boolean; list: InvoiceList }>
    ) {
      state.isEditMode = action.payload.mode
      state.currentInvoiceRecord = action.payload.list
    },
  },
})

export const {
  getInvoiceList,
  deleteInvoiceRecord,
  editInvoiceRecord,
  addInvoiceRecord,
  setCurrentInvoiceRecord,
} = ListSlice.actions
export default ListSlice.reducer
