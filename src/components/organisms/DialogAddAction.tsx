'use client'

import React, { useEffect, useState } from 'react'

import Accordion from '@src/components/custom/accordion/accordion'
import { Modal } from '@src/components/custom/modal/modal'
import { InstructionRenderer } from '@src/components/molecules/InstructionRenderer'
import type { WorkflowAction } from '@src/server/api/routers/projectAgentWorkflow'
import { Database, Zap } from 'lucide-react'
import { toast } from 'react-toastify'

interface DialogAddActionProps {
  isOpen: boolean
  onClose: () => void
  onAddActions: (actions: WorkflowAction[]) => void
  selectedActionIds?: string[]
  availableActions: WorkflowAction[]
}

const DialogAddAction: React.FC<DialogAddActionProps> = ({
  isOpen,
  onClose,
  onAddActions,
  selectedActionIds = [],
  availableActions,
}) => {
  const [selectedActionIdsSet, setSelectedActionIdsSet] = useState<Set<string>>(
    new Set()
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isActionsOpen, setIsActionsOpen] = useState(true)
  const [isDatabaseActionsOpen, setIsDatabaseActionsOpen] = useState(false)
  const [isWebhookActionsOpen, setIsWebhookActionsOpen] = useState(false)

  const regularActions = availableActions.filter(
    (action) => (action as any).actionType !== 'DATABASE' && (action as any).actionType !== 'WEBHOOK'
  )
  const databaseActions = availableActions.filter(
    (action) => (action as any).actionType === 'DATABASE'
  )
  const webhookActions = availableActions.filter(
    (action) => (action as any).actionType === 'WEBHOOK'
  )

  const availableNewActions = availableActions.filter(
    (action) => !selectedActionIds.includes(action.id)
  )
  const hasNewActionsAvailable = availableNewActions.length > 0

  useEffect(() => {
    if (isOpen) {
      setSelectedActionIdsSet(new Set())
      setIsActionsOpen(true)
      setIsDatabaseActionsOpen(false)
      setIsWebhookActionsOpen(false)
    }
  }, [isOpen])

  const handleActionToggle = (actionId: string) => {
    if (selectedActionIds.includes(actionId)) {
      return
    }

    const newSelection = new Set(selectedActionIdsSet)
    if (newSelection.has(actionId)) {
      newSelection.delete(actionId)
    } else {
      newSelection.add(actionId)
    }
    setSelectedActionIdsSet(newSelection)
  }

  const handleSelectAll = () => {
    const availableNewActions = availableActions.filter(
      (action) => !selectedActionIds.includes(action.id)
    )

    if (selectedActionIdsSet.size === availableNewActions.length) {
      setSelectedActionIdsSet(new Set())
    } else {
      setSelectedActionIdsSet(
        new Set(availableNewActions.map((action) => action.id))
      )
    }
  }

  const onSubmit = async () => {
    setIsSubmitting(true)
    try {
      const newlySelectedActions = availableActions.filter((action) =>
        selectedActionIdsSet.has(action.id)
      )

      onAddActions(newlySelectedActions)
      toast.success(
        `${newlySelectedActions.length} action(s) added successfully`
      )
      onClose()
    } catch (error) {
      console.error('Failed to add actions:', error)
      toast.error('Failed to add actions. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  const getMethodBadgeColor = (method: string = 'POST') => {
    switch (method.toLowerCase()) {
      case 'get':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'post':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'put':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'delete':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'patch':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const groupDatabaseActionsByCategory = (actions: WorkflowAction[]) => {
    const categories: Record<string, WorkflowAction[]> = {}

    actions.forEach((action) => {
      let category = 'Other'

      if (action.name.toLowerCase().includes('product')) category = 'Products'
      else if (action.name.toLowerCase().includes('customer'))
        category = 'Customers'
      else if (action.name.toLowerCase().includes('agent')) category = 'Agents'
      else if (action.name.toLowerCase().includes('deal')) category = 'Deals'
      else if (action.name.toLowerCase().includes('contact'))
        category = 'Contacts'
      else if (action.name.toLowerCase().includes('lead')) category = 'Leads'
      else if (action.name.toLowerCase().includes('member'))
        category = 'Project Members'
      else if (action.name.toLowerCase().includes('categor'))
        category = 'Categories'
      else if (action.name.toLowerCase().includes('warehouse'))
        category = 'Warehouses'

      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(action)
    })

    return categories
  }

  const renderActionsList = (
    actions: WorkflowAction[],
    isDatabaseType = false
  ) => {
    const IconComponent = isDatabaseType ? Database : Zap
    const iconColor = isDatabaseType ? 'text-blue-500' : 'text-purple-500'
    const emptyMessage = isDatabaseType
      ? 'No database actions available'
      : 'No actions available'

    if (actions.length === 0) {
      return (
        <div className="text-center py-8">
          <IconComponent className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">{emptyMessage}</p>
        </div>
      )
    }

    const availableNew = actions.filter(
      (action) => !selectedActionIds.includes(action.id)
    )

    if (availableNew.length === 0) {
      return (
        <div className="text-center py-8">
          <IconComponent className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            All available actions are already added
          </p>
        </div>
      )
    }

    if (isDatabaseType) {
      const categories = groupDatabaseActionsByCategory(actions)
      const categoryOrder = [
        'Products',
        'Customers',
        'Agents',
        'Deals',
        'Contacts',
        'Leads',
        'Categories',
        'Warehouses',
        'Project Members',
        'Other',
      ]

      return (
        <div className="space-y-4">
          {categoryOrder.map((categoryName) => {
            const categoryActions = categories[categoryName]
            if (!categoryActions || categoryActions.length === 0) return null

            return (
              <div key={categoryName} className="space-y-2">
                {/* Category Header */}
                <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    {categoryName}
                  </h4>
                  <span className="text-xs text-gray-500">
                    ({categoryActions.length})
                  </span>
                </div>

                {/* Category Actions */}
                <div className="space-y-2 pl-2">
                  {categoryActions.map((action) => (
                    <div
                      key={action.id}
                      onClick={() => handleActionToggle(action.id)}
                      className={`
                        flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200
                        ${
                          selectedActionIds.includes(action.id)
                            ? 'border-green-300 bg-green-50 shadow-sm opacity-75'
                            : selectedActionIdsSet.has(action.id)
                              ? 'border-purple-300 bg-purple-50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                        ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                      `}>
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={
                          selectedActionIds.includes(action.id) ||
                          selectedActionIdsSet.has(action.id)
                        }
                        onChange={() => handleActionToggle(action.id)}
                        disabled={
                          isSubmitting || selectedActionIds.includes(action.id)
                        }
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mr-3"
                        onClick={(e) => e.stopPropagation()}
                      />

                      {/* Icon */}
                      <div className="flex-shrink-0 mr-3">
                        <IconComponent className={`w-5 h-5 ${iconColor}`} />
                      </div>

                      {/* Action Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {action.name}
                            </p>
                            {action.description && (
                              <div className="text-xs text-gray-500 mt-1 overflow-hidden">
                                <InstructionRenderer
                                  content={action.description}
                                  className="text-xs line-clamp-1"
                                />
                              </div>
                            )}
                          </div>

                          {/* Method Badge */}
                          <div className="flex-shrink-0 ml-3">
                            {(() => {
                              const inferredMethod = action.apiUrl!
                              return (
                                <span
                                  className={`
                                    inline-flex items-center px-2 py-1 text-xs font-medium border rounded
                                    ${getMethodBadgeColor(inferredMethod)}
                                  `}>
                                  {inferredMethod}
                                </span>
                              )
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {actions.map((action) => (
          <div
            key={action.id}
            onClick={() => handleActionToggle(action.id)}
            className={`
              flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200
              ${
                selectedActionIds.includes(action.id)
                  ? 'border-green-300 bg-green-50 shadow-sm opacity-75'
                  : selectedActionIdsSet.has(action.id)
                    ? 'border-purple-300 bg-purple-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
              ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
            `}>
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={
                selectedActionIds.includes(action.id) ||
                selectedActionIdsSet.has(action.id)
              }
              onChange={() => handleActionToggle(action.id)}
              disabled={isSubmitting || selectedActionIds.includes(action.id)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mr-3"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Icon */}
            <div className="flex-shrink-0 mr-3">
              <IconComponent className={`w-5 h-5 ${iconColor}`} />
            </div>

            {/* Action Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {action.name}
                  </p>
                  {action.description && (
                    <div className="text-xs text-gray-500 mt-1 overflow-hidden">
                      <InstructionRenderer
                        content={action.description}
                        className="text-xs line-clamp-1"
                      />
                    </div>
                  )}
                </div>

                {/* Method Badge */}
                <div className="flex-shrink-0 ml-3">
                  {(() => {
                    const inferredMethod = action.apiUrl!
                    return (
                      <span
                        className={`
                          inline-flex items-center px-2 py-1 text-xs font-medium border rounded
                          ${getMethodBadgeColor(inferredMethod)}
                        `}>
                        {inferredMethod}
                      </span>
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const content = (
    <div className="space-y-4 overflow-y-auto h-[400px]">
      {/* Header with select all */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={(() => {
              const availableNewActions = availableActions.filter(
                (action) => !selectedActionIds.includes(action.id)
              )
              return (
                selectedActionIdsSet.size === availableNewActions.length &&
                availableNewActions.length > 0
              )
            })()}
            onChange={handleSelectAll}
            disabled={
              isSubmitting ||
              availableActions.filter(
                (action) => !selectedActionIds.includes(action.id)
              ).length === 0
            }
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Select All ({selectedActionIdsSet.size}/
            {
              availableActions.filter(
                (action) => !selectedActionIds.includes(action.id)
              ).length
            }
            )
          </span>
        </div>
      </div>

      {/* Accordions */}
      <div className="space-y-3">
        {/* Actions Accordion */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <Accordion
            title="Actions"
            isOpen={isActionsOpen}
            onToggle={() => setIsActionsOpen(!isActionsOpen)}
            icon={<Zap className="w-4 h-4 text-purple-500" />}
            iconPosition="left"
            headerColor="bg-gray-50 hover:bg-gray-100"
            accordionClass="border-0">
            <div className="p-3 max-h-64 overflow-y-auto">
              {renderActionsList(regularActions, false)}
            </div>
          </Accordion>
        </div>

        {/* Webhook Actions Accordion */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <Accordion
            title="Webhook Variables"
            isOpen={isWebhookActionsOpen}
            onToggle={() => setIsWebhookActionsOpen(!isWebhookActionsOpen)}
            icon={<Zap className="w-4 h-4 text-orange-500" />}
            iconPosition="left"
            headerColor="bg-gray-50 hover:bg-gray-100"
            accordionClass="border-0">
            <div className="p-3 max-h-64 overflow-y-auto">
              {renderActionsList(webhookActions, false)}
            </div>
          </Accordion>
        </div>

        {/* Database Actions Accordion */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <Accordion
            title="Database Actions"
            isOpen={isDatabaseActionsOpen}
            onToggle={() => setIsDatabaseActionsOpen(!isDatabaseActionsOpen)}
            icon={<Database className="w-4 h-4 text-blue-500" />}
            iconPosition="left"
            headerColor="bg-gray-50 hover:bg-gray-100"
            accordionClass="border-0">
            <div className="p-3 max-h-64 overflow-y-auto">
              {renderActionsList(databaseActions, true)}
            </div>
          </Accordion>
        </div>
      </div>

      {/* Selection Summary */}
      {selectedActionIdsSet.size > 0 && (
        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-800">
            <span className="font-medium">{selectedActionIdsSet.size}</span>{' '}
            action(s) selected
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
          selectedActionIdsSet.size === 0 ||
          !hasNewActionsAvailable
        }
        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
        {isSubmitting
          ? 'Adding...'
          : `Add ${selectedActionIdsSet.size} Action${selectedActionIdsSet.size !== 1 ? 's' : ''}`}
      </button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Custom Actions"
      size="modal-lg"
      position="modal-center"
      content={content}
      footer={footer}
    />
  )
}

export default DialogAddAction
