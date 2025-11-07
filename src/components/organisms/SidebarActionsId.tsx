import React, { useState } from 'react'

import { api } from '@src/trpc/react'
import { ArrowLeft, Check, Edit2, Globe, X } from 'lucide-react'
import { toast } from 'react-toastify'

interface SidebarActionsIdProps {
  action?: any
  currentStep?: number
  onStepChange?: (step: number) => void
  removeBorder?: boolean
}

const SidebarActionsId: React.FC<SidebarActionsIdProps> = ({
  action,
  currentStep = 1,
  onStepChange,
  removeBorder = false,
}) => {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(action?.name || '')
  const utils = api.useUtils()

  const updateAction = api.projectAction.update.useMutation({
    onSuccess: () => {
      if (action) {
        utils.projectAction.getById.invalidate({ id: action.id })
        utils.projectAction.getAll.invalidate()
      }
      toast.success('Action name updated successfully')
      setIsEditingName(false)
    },
    onError: (error) => {
      toast.error(`Error updating action name: ${error.message}`)
    },
  })

  if (!action) return null

  const handleSaveName = () => {
    if (!editedName.trim()) {
      toast.error('Action name cannot be empty')
      return
    }
    if (editedName === action.name) {
      setIsEditingName(false)
      return
    }
    updateAction.mutate({
      id: action.id,
      name: editedName.trim(),
    })
  }

  const handleCancelEdit = () => {
    setEditedName(action.name)
    setIsEditingName(false)
  }

  const getBadgeColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'badge-green'
      case 'POST':
        return 'badge-blue'
      case 'PUT':
        return 'badge-orange'
      case 'PATCH':
        return 'badge-purple'
      case 'DELETE':
        return 'badge-red'
      default:
        return 'badge-blue'
    }
  }

  const steps = [
    'Connect to the API',
    'Authentication',
    'Configure',
    'General Settings',
    'Messages',
    'Action Results',
  ]

  const containerClass = removeBorder ? 'h-fit' : 'card h-fit'
  const headerClass = removeBorder ? 'mb-4' : 'card-header'
  const bodyClass = removeBorder ? 'space-y-4' : 'card-body space-y-4'

  return (
    <div className={containerClass}>
      <div className={headerClass}>
        <div className="flex items-center gap-2">
          <Globe className="size-5 text-blue-500" />
          {isEditingName ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName()
                  if (e.key === 'Escape') handleCancelEdit()
                }}
                className="form-input flex-1 text-base font-semibold"
                autoFocus
                disabled={updateAction.isPending}
              />
              <button
                onClick={handleSaveName}
                disabled={updateAction.isPending}
                className="p-1 hover:bg-green-100 dark:hover:bg-green-900 rounded text-green-600 dark:text-green-400"
                title="Save">
                <Check className="size-4" />
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={updateAction.isPending}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600 dark:text-red-400"
                title="Cancel">
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1 group">
              <h6
                className={
                  removeBorder
                    ? 'text-lg font-semibold flex-1'
                    : 'card-title flex-1'
                }>
                {action.name}
              </h6>
              <button
                onClick={() => setIsEditingName(true)}
                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-600 dark:text-gray-400 transition-opacity"
                title="Edit name">
                <Edit2 className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={bodyClass}>
        {/* Action Status */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className={`badge ${getBadgeColor(action.apiUrl)}`}>
              {action.apiUrl}
            </span>
            {!action.endpointUrl ? (
              <span className="text-sm text-red-500">Missing URL</span>
            ) : (
              <span className="text-sm text-green-500">URL Set</span>
            )}
          </div>

          {/* Show Endpoint URL if it exists */}
          {action.endpointUrl && (
            <div className="text-sm">
              <div className="font-medium text-gray-700 mb-1">
                Endpoint URL:
              </div>
              <div className="text-gray-600 break-all bg-gray-50 p-2 rounded border">
                {action.endpointUrl}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Steps */}
        <div className="space-y-2">
          <h6 className="font-medium text-gray-700">Configuration Steps</h6>
          <div className="space-y-1">
            {steps.map((step, index) => (
              <div
                key={step}
                onClick={() => onStepChange?.(index + 1)}
                className={`p-2 rounded cursor-pointer transition-colors ${
                  index + 1 === currentStep
                    ? 'bg-blue-50 border border-blue-200 text-blue-700'
                    : 'hover:bg-gray-50 text-gray-600'
                }`}>
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SidebarActionsId
