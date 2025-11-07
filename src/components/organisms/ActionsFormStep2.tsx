import React from 'react'

import { Switch } from '@headlessui/react'
import { ActionFormData } from '@src/app/(layout)/page/dashboard-actions/[id]/page'
import { useFormContext } from 'react-hook-form'

interface ActionsFormStep2Props {
  onPreviousStep?: () => void
  onNextStep?: () => void
  isLoading?: boolean
}

const ActionsFormStep2: React.FC<ActionsFormStep2Props> = ({
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

  const authorizationNeeded = watch('authorizationNeeded')

  const handleAuthorizationToggle = (value: boolean) => {
    setValue('authorizationNeeded', value)
  }

  return (
    <div>
      <div className="card-header">
        <h6 className="card-title">Authentication</h6>
        <p className="text-gray-500 dark:text-dark-500">
          Configure authentication settings for your API calls.
        </p>
      </div>

      <div className="card-body">
        {/* Authorization Toggle */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h6>Authorization needed</h6>
              <p className="text-sm text-gray-500 dark:text-dark-500">
                Enable if your API requires authentication
              </p>
            </div>
            <Switch
              checked={authorizationNeeded}
              onChange={handleAuthorizationToggle}
              className={`${
                authorizationNeeded ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}>
              <span className="sr-only">Enable authorization</span>
              <span
                className={`${
                  authorizationNeeded ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>

          {authorizationNeeded && (
            <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg space-y-6">
              <div className="text-sm text-blue-800 mb-4">
                Configure your API authentication credentials below.
              </div>

              {/* Authentication Key Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h6>Authentication Key</h6>
                </div>
                <p className="text-gray-500 text-sm mb-3">
                  Enter the key name used for API authentication
                </p>
                <div className="flex flex-col gap-2">
                  <input
                    {...register('authenticationKey')}
                    type="text"
                    className={`form-input w-full ${errors.authenticationKey ? 'border-red-500' : ''}`}
                  />
                  {errors.authenticationKey && (
                    <span className="text-red-500 text-sm">
                      {errors.authenticationKey.message as string}
                    </span>
                  )}
                </div>
              </div>

              {/* Authentication Value Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h6>Authentication Value</h6>
                </div>
                <p className="text-gray-500 text-sm mb-3">
                  Enter the corresponding value for the authentication key
                </p>
                <div className="flex flex-col gap-2">
                  <input
                    {...register('authenticationValue')}
                    type="password"
                    placeholder="Enter authentication value..."
                    className={`form-input w-full ${errors.authenticationValue ? 'border-red-500' : ''}`}
                  />
                  {errors.authenticationValue && (
                    <span className="text-red-500 text-sm">
                      {errors.authenticationValue.message as string}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="pt-6 border-t border-gray-200 dark:border-dark-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={onPreviousStep}
              disabled={isLoading}
              className="btn btn-outline-primary w-full sm:w-auto">
              ← Previous step
            </button>
            <button
              type="button"
              onClick={onNextStep}
              disabled={isLoading}
              className={`btn btn-primary w-full sm:w-auto ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isLoading ? 'Saving...' : 'Save and continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActionsFormStep2
