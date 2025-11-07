'use client'

import React, { useEffect, useState } from 'react'

import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import { Modal } from '@src/components/custom/modal/modal'
import type { WorkflowProduct } from '@src/server/api/routers/projectAgentWorkflow'
import { api } from '@src/trpc/react'
import { Filter, Package } from 'lucide-react'
import { toast } from 'react-toastify'

interface DialogAddProductProps {
  isOpen: boolean
  onClose: () => void
  onAddProducts: (products: WorkflowProduct[]) => void
  selectedProductIds?: string[]
  projectId: string
}

const DialogAddProduct: React.FC<DialogAddProductProps> = ({
  isOpen,
  onClose,
  onAddProducts,
  selectedProductIds = [],
  projectId,
}) => {
  const [selectedProductIdsSet, setSelectedProductIdsSet] = useState<
    Set<string>
  >(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])

  // Query categories
  const { data: categoriesData } = api.projectCategory.getAll.useQuery(
    {
      projectId,
      page: 1,
      limit: 100,
      type: 'PRODUCT',
      isActive: true,
    },
    { enabled: !!projectId && isOpen }
  )

  const categories = categoriesData?.categories || []

  const { data: productsData, isLoading } = api.projectProduct.getAll.useQuery(
    {
      projectId,
      page: 1,
      limit: 100,
      isActive: true,
    },
    { enabled: !!projectId && isOpen }
  )

  const availableProducts = productsData?.products || []

  // Filter by selected categories
  const filteredProducts =
    selectedCategoryIds.length > 0
      ? availableProducts.filter((product) =>
          product.categories?.some((cat) =>
            selectedCategoryIds.includes(cat.categoryId)
          )
        )
      : availableProducts

  const availableNewProducts = filteredProducts.filter(
    (product) => !selectedProductIds.includes(product.id)
  )
  const hasNewProductsAvailable = availableNewProducts.length > 0

  useEffect(() => {
    if (isOpen) {
      setSelectedProductIdsSet(new Set())
      setSelectedCategoryIds([])
    }
  }, [isOpen])

  const handleProductToggle = (productId: string) => {
    if (selectedProductIds.includes(productId)) {
      return
    }

    const newSelection = new Set(selectedProductIdsSet)
    if (newSelection.has(productId)) {
      newSelection.delete(productId)
    } else {
      newSelection.add(productId)
    }
    setSelectedProductIdsSet(newSelection)
  }

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleSelectAll = () => {
    // Use filtered products (based on selected categories) instead of all products
    if (
      selectedProductIdsSet.size === availableNewProducts.length &&
      availableNewProducts.length > 0
    ) {
      setSelectedProductIdsSet(new Set())
    } else {
      setSelectedProductIdsSet(
        new Set(availableNewProducts.map((product) => product.id))
      )
    }
  }

  const onSubmit = async () => {
    setIsSubmitting(true)
    try {
      const newlySelectedProducts = availableProducts
        .filter((product) => selectedProductIdsSet.has(product.id))
        .map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description || undefined,
          price: product.price || undefined,
          categories:
            product.categories?.map((cat) => ({
              name: cat.category.name,
            })) || [],
        }))

      onAddProducts(newlySelectedProducts)
      toast.success(
        `${newlySelectedProducts.length} product(s) added successfully`
      )
      onClose()
    } catch (error) {
      console.error('Failed to add products:', error)
      toast.error('Failed to add products. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  const content = (
    <div className="space-y-4">
      {/* Header with select all */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={
              selectedProductIdsSet.size === availableNewProducts.length &&
              availableNewProducts.length > 0
            }
            onChange={handleSelectAll}
            disabled={
              isSubmitting || isLoading || availableNewProducts.length === 0
            }
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Select All ({selectedProductIdsSet.size}/
            {availableNewProducts.length})
          </span>
        </div>

        {/* Filter Dropdown */}
        <Dropdown position="right">
          <DropdownButton>
            <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
              <Filter className="w-4 h-4" />
              Categories
              {selectedCategoryIds.length > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium text-white bg-purple-600 rounded-full">
                  {selectedCategoryIds.length}
                </span>
              )}
            </div>
          </DropdownButton>
          <DropdownMenu menuClass="w-64 max-h-56 overflow-y-auto card mt-2 z-999">
            <div className="p-2" onClick={(e) => e.stopPropagation()}>
              {categories.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No categories available
                </div>
              ) : (
                <div className="space-y-1">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategoryIds.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 truncate">
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </DropdownMenu>
        </Dropdown>
      </div>

      {/* Products List */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-3">Loading products...</p>
          </div>
        ) : availableProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No products available</p>
            <p className="text-xs text-gray-400 mt-1">
              Create products in your project first
            </p>
          </div>
        ) : !hasNewProductsAvailable ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              All available products are already added
            </p>
            <p className="text-xs text-gray-400 mt-1">No new products to add</p>
          </div>
        ) : (
          <div className="space-y-2 mr-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductToggle(product.id)}
                className={`
                  flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200
                  ${
                    selectedProductIds.includes(product.id)
                      ? 'border-green-300 bg-green-50 shadow-sm opacity-75'
                      : selectedProductIdsSet.has(product.id)
                        ? 'border-purple-300 bg-purple-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                  ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                `}>
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={
                    selectedProductIds.includes(product.id) ||
                    selectedProductIdsSet.has(product.id)
                  }
                  onChange={() => handleProductToggle(product.id)}
                  disabled={
                    isSubmitting || selectedProductIds.includes(product.id)
                  }
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mr-3"
                  onClick={(e) => e.stopPropagation()}
                />

                {/* Package Icon */}
                <div className="flex-shrink-0 mr-3">
                  <Package className="w-5 h-5 text-green-500" />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0 max-w-36">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      {product.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1 truncate">
                          {product.description}
                        </p>
                      )}
                    </div>
                    {product.categories && product.categories.length > 0 && (
                      <div className="flex flex-wrap max-w-65 gap-1 justify-center truncate">
                        {product.categories.map((cat, idx) => (
                          <span
                            key={idx}
                            className="items-center px-2 py-1 text-xs font-medium border rounded bg-blue-100 text-blue-800 border-blue-200 truncate">
                            {cat.category.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Price Badge */}
                    {product.price !== null && product.price !== undefined && (
                      <div className="flex justify-end w-21">
                        <span className="items-center px-2 py-1 text-xs font-medium border rounded bg-green-100 text-green-800 border-green-200 max-w-21 truncate">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selection Summary */}
      {selectedProductIdsSet.size > 0 && (
        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-800">
            <span className="font-medium">{selectedProductIdsSet.size}</span>{' '}
            product(s) selected
          </p>
        </div>
      )}
    </div>
  )

  const footer = (
    <div className="flex justify-end space-x-3">
      <button
        onClick={handleClose}
        type="button"
        disabled={isSubmitting}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
        Cancel
      </button>
      <button
        onClick={onSubmit}
        type="button"
        disabled={
          isSubmitting ||
          isLoading ||
          selectedProductIdsSet.size === 0 ||
          !hasNewProductsAvailable
        }
        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
        {isSubmitting
          ? 'Adding...'
          : `Add ${selectedProductIdsSet.size} Product${selectedProductIdsSet.size !== 1 ? 's' : ''}`}
      </button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      contentClass="h-[400px] overflow-y-auto"
      title="Add Products"
      size="modal-lg"
      position="modal-center"
      content={content}
      footer={footer}
    />
  )
}

export default DialogAddProduct
