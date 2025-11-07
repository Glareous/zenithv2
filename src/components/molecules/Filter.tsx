'use client'

import React, { ChangeEvent, useState } from 'react'

import { RootState } from '@src/slices/reducer'
import { api } from '@src/trpc/react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useSelector } from 'react-redux'

interface FilterDrawerProps {
  isDrawerOpen: boolean
  closeDrawer: () => void
  onFilterChange: (data: { categories: string[]; colors: string[] }) => void
  updateCountCategory: (count: number) => void
  updateCountColor: (count: number) => void
  selectedCategories: string[]
  selectedColors: string[]
  setSelectedCategories: (categories: string[]) => void
  setSelectedColors: (colors: string[]) => void
  search: string
  setSearch: (search: string) => void
}

const Filter: React.FC<FilterDrawerProps> = ({
  isDrawerOpen,
  closeDrawer,
  onFilterChange,
  updateCountCategory,
  updateCountColor,
  selectedCategories = [],
  selectedColors = [],
  setSelectedCategories,
  setSelectedColors,
  setSearch,
  search,
}) => {
  console.log('🔍 Filter component rendered, isDrawerOpen:', isDrawerOpen)

  const currentProject = useSelector(
    (state: RootState) => state.Project.currentProject
  )

  const { data: categoriesData } = api.projectCategory.getAll.useQuery(
    {
      projectId: currentProject?.id || '',
      type: 'PRODUCT',
      page: 1,
      limit: 100,
    },
    {
      enabled: !!currentProject?.id && isDrawerOpen,
    }
  )

  const categories = categoriesData?.categories?.map(
    (cat: any) => cat.name
  ) || ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys']

  const handleCategoryChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    console.log('📝 Category changed:', value)

    const newCategories = selectedCategories.includes(value)
      ? selectedCategories.filter((cat) => cat !== value)
      : [...selectedCategories, value]

    console.log(' New categories:', newCategories)
    setSelectedCategories(newCategories)
    updateCountCategory(newCategories.length)
  }

  const applyFilters = () => {
    console.log('✅ Applying filters:', selectedCategories)
    const categoryFilter =
      selectedCategories.length > 0 ? selectedCategories[0] : undefined

    onFilterChange({
      categories: selectedCategories,
      colors: [],
    })
    closeDrawer()
  }

  const clearFilters = () => {
    console.log('🗑️ Clearing filters')
    setSelectedCategories([])
    updateCountCategory(0)
  }

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    console.log('🔍 Search changed:', value)
    setSearch(value)
  }

  if (!isDrawerOpen) {
    return null
  }

  console.log('🎯 Rendering Filter component')

  return (
    <div className="fixed inset-0 z-[9999]  backdrop-blur-sm">
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <div className="rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden card">
          {/* Header */}
          <div className="flex items-center justify-between card-header">
            <h3 className="text-xl font-semibold">Filter & Sorting</h3>
            <button
              onClick={closeDrawer}
              className="btn btn-outline-red btn-xs">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                className="ltr:pl-9 rtl:pr-9 form-input ltr:group-[&.right]/form:pr-9 rtl:group-[&.right]/form:pl-9 ltr:group-[&.right]/form:pl-4 rtl:group-[&.right]/form:pr-4"
                placeholder="Search products..."
                value={search}
                onChange={handleSearchChange}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            {/* Categories */}
            <div>
              <h6 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                Categories ({selectedCategories.length})
              </h6>
              <div className="space-y-3">
                {categories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <input
                      type="checkbox"
                      className="input-check input-check-primary"
                      value={category}
                      checked={selectedCategories.includes(category)}
                      onChange={handleCategoryChange}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {category}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="card-footer flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-outline-red "
              onClick={clearFilters}>
              <X className="w-4 h-4 inline mr-2" />
              Reset
            </button>
            <button
              type="button"
              className="btn btn-primary "
              onClick={applyFilters}>
              <SlidersHorizontal className="w-4 h-4 inline mr-2" />
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Filter
