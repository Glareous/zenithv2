import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { WishListProduct } from '@src/dtos'
import { initStore } from '@src/utils/init_store'

interface WishListState {
  wishListData: WishListProduct[] | null
  isLoading: boolean
}

const initialState: WishListState = {
  wishListData: initStore('d-wishlist') as WishListProduct[],
  isLoading: false,
}

const WishListSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // get wishlist data
    getWishListData(state, action: PayloadAction<WishListProduct[]>) {
      state.wishListData = action.payload
    },

    addWishListProduct(state, action: PayloadAction<WishListProduct>) {
      const newProduct = action.payload
      if (state.wishListData !== null) {
        state.wishListData.unshift(newProduct)
      } else {
        state.wishListData = [newProduct]
      }
    },

    // update list product quantity record
    modifyWishListProductQuantity(
      state,
      action: PayloadAction<WishListProduct>
    ) {
      const updatedWishListRecord = action.payload
      if (state.wishListData !== null) {
        const findWishListRecordIndex = state.wishListData.findIndex(
          (item) => item.id === updatedWishListRecord.id
        )
        const findWishListRecord = state.wishListData.find(
          (item) => item.id === updatedWishListRecord.id
        )
        if (findWishListRecordIndex !== -1 && findWishListRecord) {
          state.wishListData[findWishListRecordIndex] = updatedWishListRecord
        }
      }
    },

    // delete wishlist product record
    removeWishListProduct(state, action: PayloadAction<number[]>) {
      if (state.wishListData !== null) {
        state.wishListData = state.wishListData.filter(
          (item) => !action.payload.includes(item.id)
        )
      }
    },
  },
})

export const {
  getWishListData,
  addWishListProduct,
  modifyWishListProductQuantity,
  removeWishListProduct,
} = WishListSlice.actions
export default WishListSlice.reducer
