import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { ProductListItem } from '@src/dtos'
import { initStore } from '@src/utils/init_store'

interface ListState {
  productList: ProductListItem[]
  currentProduct: ProductListItem | null
  isLoading: boolean
  editMode: boolean
}

const initialState: ListState = {
  productList: initStore('d-product-list') as ProductListItem[],
  currentProduct: null,
  isLoading: false,
  editMode: false,
}

const ListSlice = createSlice({
  name: 'product_list',
  initialState,
  reducers: {
    // get product list data
    getProductList(state, action: PayloadAction<ProductListItem[]>) {
      state.productList = action.payload
    },

    // set current product record
    setCurrentProduct(state, action: PayloadAction<ProductListItem>) {
      state.currentProduct = action.payload
    },

    // set current edit mode
    setCurrentEditMode(state, action: PayloadAction<boolean>) {
      state.editMode = action.payload
    },

    // update product list record status
    changeStatusProductList(state, action: PayloadAction<ProductListItem>) {
      const productIndex = state.productList?.findIndex(
        (productItem: ProductListItem) => productItem.id === action.payload.id
      )
      const activeProduct = state.productList?.find(
        (productItem: ProductListItem) => productItem.id === action.payload.id
      )
      if (productIndex !== -1 && activeProduct) {
        if (state.productList) {
          if (activeProduct) {
            activeProduct.status =
              action.payload.status === 'Published' ? 'Inactive' : 'Published'
            state.productList![productIndex!] = activeProduct
          }
        }
      }
    },

    // add new product list record
    addProductList(state, action: PayloadAction<ProductListItem>) {
      if (state.productList !== null) {
        state.productList.unshift(action.payload)
      } else {
        state.productList = [action.payload]
      }
    },

    // update product list record
    editProductList(state, action: PayloadAction<ProductListItem>) {
      const updatedProduct = action.payload
      if (state.productList !== null) {
        const existingProductIndex = state.productList.findIndex(
          (productItem: ProductListItem) => productItem.id === updatedProduct.id
        )
        if (existingProductIndex !== -1) {
          state.productList[existingProductIndex] = updatedProduct
          state.currentProduct = updatedProduct
        }
      }
    },

    // delete shop cart product
    deleteProductList(state, action: PayloadAction<number[]>) {
      if (state.productList !== null) {
        state.productList = state.productList.filter(
          (item) => !action.payload.includes(item.id)
        )
      }
    },
  },
})

export const {
  getProductList,
  setCurrentProduct,
  changeStatusProductList,
  setCurrentEditMode,
  addProductList,
  editProductList,
  deleteProductList,
} = ListSlice.actions
export default ListSlice.reducer
