import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { CustomerRecord } from '@src/dtos'
import { initStore } from '@src/utils/init_store'

interface CustomerState {
  customerList: CustomerRecord[] | null
  isLoading: boolean
}

const initialState: CustomerState = {
  customerList: initStore('d-customer-list') as CustomerRecord[] | null,
  isLoading: false,
}

const ListSlice = createSlice({
  name: 'customer_list',
  initialState,
  reducers: {
    // get customer product list
    getCustomerProductList(state, action: PayloadAction<CustomerRecord[]>) {
      state.customerList = action.payload
    },

    // delete customer product list
    deleteCustomerProductList(state, action: PayloadAction<number[]>) {
      if (state.customerList !== null) {
        state.customerList = state.customerList.filter(
          (item) => !action.payload.includes(item.id)
        )
      }
    },

    // edit customer product list
    editCustomerProductRecord(state, action: PayloadAction<CustomerRecord>) {
      const customer = action.payload
      if (state.customerList !== null) {
        const findCustomerIndex = state.customerList.findIndex(
          (item) => item.id === customer.id
        )
        if (findCustomerIndex !== -1) {
          state.customerList[findCustomerIndex] = customer
        }
      }
    },

    // add customer product list
    addCustomerProductRecord(state, action: PayloadAction<CustomerRecord>) {
      const newCustomer = action.payload
      if (state.customerList !== null) {
        state.customerList.unshift(newCustomer)
      } else {
        state.customerList = [newCustomer]
      }
    },
  },
})

export const {
  getCustomerProductList,
  deleteCustomerProductList,
  editCustomerProductRecord,
  addCustomerProductRecord,
} = ListSlice.actions
export default ListSlice.reducer
