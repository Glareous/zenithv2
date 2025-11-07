import React from 'react'

import { Switch } from '@headlessui/react'
import type { ActionFormData } from '@src/app/(layout)/page/dashboard-actions/[id]/page'
import { useFormContext } from 'react-hook-form'

interface ActionsFormStep5Props {
  onPreviousStep?: () => void
  onNextStep?: () => void
  isLoading?: boolean
}

const ActionsFormStep5: React.FC<ActionsFormStep5Props> = ({
  onPreviousStep,
  onNextStep,
  isLoading,
}) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ActionFormData>()

  const agentSpeakNaturally = watch('agentSpeakNaturally')

  const handleAgentSpeakToggle = (value: boolean) => {
    setValue('agentSpeakNaturally', value)
  }

  return (
    <div>
      <div className="card-header">
        <h6 className="card-title">Messages</h6>
        <p className="text-gray-500 dark:text-dark-500">
          Set what the agent should say at different moments during the task.
        </p>
      </div>

      <div className="card-body">
        {/* Agent Speak Naturally Toggle */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h6>Let the agent speak naturally</h6>
              <p className="text-sm text-gray-500 dark:text-dark-500">
                Allow the AI agent to communicate in a more conversational way
              </p>
            </div>
            <Switch
              checked={agentSpeakNaturally}
              onChange={handleAgentSpeakToggle}
              className={`${
                agentSpeakNaturally ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}>
              <span className="sr-only">Let the agent speak naturally</span>
              <span
                className={`${
                  agentSpeakNaturally ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
        </div>

        {/* Start Message */}
        <div className="mb-8">
          <div className="mb-4">
            <h6>Start Message</h6>
          </div>
          <p className="text-gray-500 dark:text-dark-500 mb-4">
            Message to display when the action starts executing.
          </p>
          <textarea
            {...register('startMessage')}
            placeholder="Starting the action..."
            className="form-input w-full h-32"
          />
          {errors.startMessage && (
            <span className="text-red-500 text-sm mt-1 block">
              {errors.startMessage.message}
            </span>
          )}
        </div>

        {/* Delay Message */}
        <div className="mb-8">
          <div className="mb-4">
            <h6>Delay message</h6>
          </div>
          <p className="text-gray-500 dark:text-dark-500 mb-4">
            Message to show when there's a delay in the action execution.
          </p>
          <textarea
            {...register('delayMessage')}
            placeholder="The action is taking longer than expected..."
            className="form-input w-full h-32"
          />
          {errors.delayMessage && (
            <span className="text-red-500 text-sm mt-1 block">
              {errors.delayMessage.message}
            </span>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Threshold (seconds)
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                {...register('delayThreshold', { valueAsNumber: true })}
                min="1"
                className="form-input w-32"
              />
            </div>
            {errors.delayThreshold && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.delayThreshold.message}
              </span>
            )}
          </div>
        </div>

        {/* Failure Message */}
        <div className="mb-8">
          <div className="mb-4">
            <h6>Failure message</h6>
          </div>
          <p className="text-gray-500 dark:text-dark-500 mb-4">
            Message to display when the action fails to execute.
          </p>
          <textarea
            {...register('failureMessage')}
            placeholder="Sorry, the action failed to execute..."
            className="form-input w-full h-32"
          />
          {errors.failureMessage && (
            <span className="text-red-500 text-sm mt-1 block">
              {errors.failureMessage.message}
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

export default ActionsFormStep5
