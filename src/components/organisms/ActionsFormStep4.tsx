import React from 'react'

import type { ActionFormData } from '@src/app/(layout)/page/dashboard-actions/[id]/page'
import { useFormContext } from 'react-hook-form'

interface ActionsFormStep4Props {
  onPreviousStep?: () => void
  onNextStep?: () => void
  isLoading?: boolean
}

const ActionsFormStep4: React.FC<ActionsFormStep4Props> = ({
  onPreviousStep,
  onNextStep,
  isLoading,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<ActionFormData>()

  return (
    <div>
      <div className="card-header">
        <h6 className="card-title">General Settings</h6>
        <p className="text-gray-500 dark:text-dark-500">
          Tell your AI Agent what this action is for and when to use it.
        </p>
      </div>

      <div className="card-body">
        {/* Action Name */}
        <div className="mb-8">
          <div className="mb-4">
            <h6>Action Name</h6>
          </div>
          <p className="text-gray-500 dark:text-dark-500 mb-4">
            Give your action a descriptive name that explains its purpose.
          </p>
          <input
            type="text"
            {...register('name')}
            placeholder="e.g., Send SMS notification"
            className="form-input w-full"
          />
          {errors.name && (
            <span className="text-red-500 text-sm mt-1 block">
              {errors.name.message}
            </span>
          )}
        </div>

        {/* Description */}
        <div className="mb-8">
          <div className="mb-4">
            <h6>Description</h6>
          </div>
          <p className="text-gray-500 dark:text-dark-500 mb-4">
            Provide a detailed explanation of what this action does and when it
            should be used.
          </p>
          <textarea
            {...register('description')}
            placeholder="This action sends an SMS notification to the user when..."
            rows={4}
            className="form-input w-full h-32"
          />
          {errors.description && (
            <span className="text-red-500 text-sm mt-1 block">
              {errors.description.message}
            </span>
          )}
        </div>

        {/* Navigation */}
        <div className="pt-6 border-t border-gray-200 dark:border-dark-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={onPreviousStep}
              className="btn btn-outline-primary w-full sm:w-auto">
              ← Previous step
            </button>
            <button
              onClick={onNextStep}
              disabled={isLoading}
              className="btn btn-primary w-full sm:w-auto">
              {isLoading ? 'Saving...' : 'Save and continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActionsFormStep4
