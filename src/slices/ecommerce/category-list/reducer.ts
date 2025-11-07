import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { CategoryItems } from '@src/dtos'
import { initStore } from '@src/utils/init_store'

interface CustomerState {
  categoryList: CategoryItems[]
  isLoading: boolean
}

const initialState: CustomerState = {
  categoryList: initStore('d-category-list') as CategoryItems[],
  isLoading: false,
}

const CategoryListSlice = createSlice({
  name: 'categoryList',
  initialState,
  reducers: {
    // get category list
    getCategoryList(state, action: PayloadAction<CategoryItems[]>) {
      state.categoryList = action.payload
    },

    // delete Category list
    deleteCategoryList(state, action: PayloadAction<number[]>) {
      if (state.categoryList !== null) {
        state.categoryList = state.categoryList.filter(
          (item) => !action.payload.includes(item.id)
        )
      }
    },

    // edit Category list
    editCategoryList(state, action: PayloadAction<CategoryItems>) {
      const categoryList = action.payload
      if (state.categoryList !== null) {
        const findProjectIndex = state.categoryList.findIndex(
          (item) => item.id === categoryList.id
        )
        const findProjectRecord = state.categoryList.find(
          (item) => item.id === categoryList.id
        )
        if (findProjectIndex !== -1 && findProjectRecord) {
          state.categoryList[findProjectIndex] = categoryList
        }
      }
    },

    // add Category list
    addCategoryList(state, action: PayloadAction<CategoryItems>) {
      const newCategory = action.payload
      if (state.categoryList !== null) {
        state.categoryList.unshift(newCategory)
      } else {
        state.categoryList = [newCategory]
      }
    },
  },
})

export const {
  getCategoryList,
  addCategoryList,
  editCategoryList,
  deleteCategoryList,
} = CategoryListSlice.actions
export default CategoryListSlice.reducer
