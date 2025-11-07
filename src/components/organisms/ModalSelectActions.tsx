import React, { useState } from 'react'

import { Ban, Plus, Search, X } from 'lucide-react'

import Pagination from '@/components/common/Pagination'

interface Action {
  id?: string
  name: string
  order?: number
  isActive?: boolean
  data?: {
    type?: string
    prompt?: string
    input?: string
    [key: string]: any
  }
}

interface ModalSelectActionsProps {
  isOpen: boolean
  onClose: () => void
  modalType: 'information-extractor' | 'custom-evaluation'
  allActions: Action[]
  activeActions: Set<string>
  onAddActions: (selectedActions: Set<string>) => Promise<void>
  onCreateNew: () => void
  isLoading?: boolean
}

const ModalSelectActions: React.FC<ModalSelectActionsProps> = ({
  isOpen,
  onClose,
  modalType,
  allActions,
  activeActions,
  onAddActions,
  onCreateNew,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedActions, setSelectedActions] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const filteredActions = allActions.filter(
    (action) =>
      action.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.data?.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.data?.input?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalItems = filteredActions.length
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedActions = filteredActions.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  const handleSelectAction = (actionName: string) => {
    setSelectedActions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(actionName)) {
        newSet.delete(actionName)
      } else {
        newSet.add(actionName)
      }
      return newSet
    })
  }

  const handleAddSelectedActions = async () => {
    if (selectedActions.size === 0) return
    await onAddActions(selectedActions)
    setSelectedActions(new Set())
  }

  const handleClose = () => {
    setSearchQuery('')
    setSelectedActions(new Set())
    setCurrentPage(1)
    onClose()
  }

  const handleCreateNew = () => {
    handleClose()
    onCreateNew()
  }

  const getModalTitle = () => {
    return modalType === 'information-extractor'
      ? 'Add Information Extractor'
      : 'Add Custom Evaluation'
  }

  const getEmptyStateText = () => {
    if (modalType === 'information-extractor') {
      return {
        title: searchQuery
          ? "Sorry — we couldn't find any results"
          : 'No actions found',
        description: searchQuery
          ? 'Please double check your filters or create a new action pressing the button below'
          : 'Create your first Information Extractor action to get started',
        buttonText: 'Create Information Extractor',
      }
    } else {
      return {
        title: searchQuery
          ? "Sorry — we couldn't find any results"
          : 'No evaluations found',
        description: searchQuery
          ? 'Please double check your filters or create a new evaluation pressing the button below'
          : 'Create your first Custom Evaluation to get started',
        buttonText: 'Create Custom Evaluation',
      }
    }
  }

  if (!isOpen) return null

  const emptyState = getEmptyStateText()

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-overlay backdrop-blur-sm"
      onClick={handleClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold">{getModalTitle()}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[500px]">
          {/* Search Section */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-800 dark:text-gray-200"
              />
            </div>
            <button
              className="btn btn-gray flex items-center gap-2"
              onClick={handleCreateNew}>
              <Plus className="w-4 h-4" />
              New Action
            </button>
          </div>

          {/* Content */}
          {totalItems === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Ban className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                {emptyState.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                {emptyState.description}
              </p>
              <button
                className="btn btn-gray flex items-center gap-2"
                onClick={handleCreateNew}>
                <Plus className="w-4 h-4" />
                {emptyState.buttonText}
              </button>
            </div>
          ) : (
            /* Actions List */
            <div className="card card-body">
              <div className="card truncate">
                {paginatedActions.map((action: Action) => {
                  const isAdded = activeActions.has(action.name)
                  const isSelected = selectedActions.has(action.name)

                  return (
                    <div
                      key={action.id || action.name}
                      className={`p-2 border-b border-gray-200 dark:border-gray-700 transition-colors ${
                        isAdded
                          ? 'border-green-200 dark:border-green-800'
                          : isSelected
                            ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected || isAdded}
                          disabled={isAdded}
                          onChange={() =>
                            !isAdded && handleSelectAction(action.name)
                          }
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
                        />
                        <div className="grow">
                          <div className="flex justify-between items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-46">
                              {action.name}
                            </h4>
                            {isAdded && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full hidden">
                                Added
                              </span>
                            )}
                            {action.data?.type && (
                              <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded">
                                {action.data.type.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {/* Pagination */}
              {totalItems > itemsPerPage && (
                <div className="flex justify-center">
                  <Pagination
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {totalItems > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-gray-800">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedActions.size > 0
                ? `${selectedActions.size} action(s) selected`
                : 'No actions selected'}
            </span>
            <div className="flex gap-3">
              <button onClick={handleClose} className="btn btn-outline-gray">
                Close
              </button>
              <button
                onClick={handleAddSelectedActions}
                disabled={selectedActions.size === 0 || isLoading}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading
                  ? 'Adding...'
                  : selectedActions.size > 0
                    ? `Add ${selectedActions.size} Action(s)`
                    : 'Add Actions'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ModalSelectActions
