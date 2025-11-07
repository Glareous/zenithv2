'use client'

import React, { useEffect, useState } from 'react'

import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import { Modal } from '@src/components/custom/modal/modal'
import type { WorkflowService } from '@src/contexts/WorkflowContext'
import { api } from '@src/trpc/react'
import { Filter, Wrench } from 'lucide-react'
import { toast } from 'react-toastify'

interface DialogAddServiceProps {
  isOpen: boolean
  onClose: () => void
  onAddServices: (services: WorkflowService[]) => void
  selectedServiceIds?: string[]
  projectId: string
}

const DialogAddService: React.FC<DialogAddServiceProps> = ({
  isOpen,
  onClose,
  onAddServices,
  selectedServiceIds = [],
  projectId,
}) => {
  const [selectedServiceIdsSet, setSelectedServiceIdsSet] = useState<
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
      type: 'SERVICE',
      isActive: true,
    },
    { enabled: !!projectId && isOpen }
  )

  const categories = categoriesData?.categories || []

  const { data: servicesData, isLoading } = api.projectService.getAll.useQuery(
    {
      projectId,
      page: 1,
      limit: 100,
      isActive: true,
    },
    { enabled: !!projectId && isOpen }
  )

  const availableServices = servicesData?.services || []

  // Filter by selected categories
  const filteredServices =
    selectedCategoryIds.length > 0
      ? availableServices.filter((service) =>
          service.categories?.some((cat) =>
            selectedCategoryIds.includes(cat.categoryId)
          )
        )
      : availableServices

  const availableNewServices = filteredServices.filter(
    (service) => !selectedServiceIds.includes(service.id)
  )
  const hasNewServicesAvailable = availableNewServices.length > 0

  useEffect(() => {
    if (isOpen) {
      setSelectedServiceIdsSet(new Set())
      setSelectedCategoryIds([])
    }
  }, [isOpen])

  const handleServiceToggle = (serviceId: string) => {
    if (selectedServiceIds.includes(serviceId)) {
      return
    }

    const newSelection = new Set(selectedServiceIdsSet)
    if (newSelection.has(serviceId)) {
      newSelection.delete(serviceId)
    } else {
      newSelection.add(serviceId)
    }
    setSelectedServiceIdsSet(newSelection)
  }

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleSelectAll = () => {
    // Use filtered services (based on selected categories) instead of all services
    if (
      selectedServiceIdsSet.size === availableNewServices.length &&
      availableNewServices.length > 0
    ) {
      setSelectedServiceIdsSet(new Set())
    } else {
      setSelectedServiceIdsSet(
        new Set(availableNewServices.map((service) => service.id))
      )
    }
  }

  const onSubmit = async () => {
    setIsSubmitting(true)
    try {
      const newlySelectedServices = availableServices
        .filter((service) => selectedServiceIdsSet.has(service.id))
        .map((service) => ({
          id: service.id,
          name: service.name,
          description: service.description || undefined,
          price: service.price || undefined,
          categories:
            service.categories?.map((cat) => ({
              name: cat.category.name,
            })) || [],
        }))

      onAddServices(newlySelectedServices)
      toast.success(
        `${newlySelectedServices.length} service(s) added successfully`
      )
      onClose()
    } catch (error) {
      console.error('Failed to add services:', error)
      toast.error('Failed to add services. Please try again.')
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
              selectedServiceIdsSet.size === availableNewServices.length &&
              availableNewServices.length > 0
            }
            onChange={handleSelectAll}
            disabled={
              isSubmitting || isLoading || availableNewServices.length === 0
            }
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Select All ({selectedServiceIdsSet.size}/
            {availableNewServices.length})
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

      {/* Services List */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-3">Loading services...</p>
          </div>
        ) : availableServices.length === 0 ? (
          <div className="text-center py-8">
            <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No services available</p>
            <p className="text-xs text-gray-400 mt-1">
              Create services in your project first
            </p>
          </div>
        ) : !hasNewServicesAvailable ? (
          <div className="text-center py-8">
            <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              All available services are already added
            </p>
            <p className="text-xs text-gray-400 mt-1">No new services to add</p>
          </div>
        ) : (
          <div className="space-y-2 mr-4">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                onClick={() => handleServiceToggle(service.id)}
                className={`
                  flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200
                  ${
                    selectedServiceIds.includes(service.id)
                      ? 'border-green-300 bg-green-50 shadow-sm opacity-75'
                      : selectedServiceIdsSet.has(service.id)
                        ? 'border-purple-300 bg-purple-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                  ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                `}>
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={
                    selectedServiceIds.includes(service.id) ||
                    selectedServiceIdsSet.has(service.id)
                  }
                  onChange={() => handleServiceToggle(service.id)}
                  disabled={
                    isSubmitting || selectedServiceIds.includes(service.id)
                  }
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mr-3"
                  onClick={(e) => e.stopPropagation()}
                />

                {/* Wrench Icon */}
                <div className="flex-shrink-0 mr-3">
                  <Wrench className="w-5 h-5 text-orange-500" />
                </div>

                {/* Service Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0 max-w-36">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {service.name}
                      </p>
                      {service.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1 truncate">
                          {service.description}
                        </p>
                      )}
                    </div>
                    {service.categories && service.categories.length > 0 && (
                      <div className="flex flex-wrap max-w-65 gap-1 justify-center truncate">
                        {service.categories.map((cat, idx) => (
                          <span
                            key={idx}
                            className="items-center px-2 py-1 text-xs font-medium border rounded bg-blue-100 text-blue-800 border-blue-200 truncate">
                            {cat.category.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Price Badge */}
                    {service.price !== null && service.price !== undefined && (
                      <div className="flex justify-end w-21">
                        <span className="items-center px-2 py-1 text-xs font-medium border rounded bg-green-100 text-green-800 border-green-200 max-w-21 truncate">
                          ${service.price.toFixed(2)}
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
      {selectedServiceIdsSet.size > 0 && (
        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-800">
            <span className="font-medium">{selectedServiceIdsSet.size}</span>{' '}
            service(s) selected
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
          selectedServiceIdsSet.size === 0 ||
          !hasNewServicesAvailable
        }
        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
        {isSubmitting
          ? 'Adding...'
          : `Add ${selectedServiceIdsSet.size} Service${selectedServiceIdsSet.size !== 1 ? 's' : ''}`}
      </button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      contentClass="h-[400px] overflow-y-auto"
      title="Add Services"
      size="modal-lg"
      position="modal-center"
      content={content}
      footer={footer}
    />
  )
}

export default DialogAddService
