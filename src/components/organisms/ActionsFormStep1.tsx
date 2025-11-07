import React from 'react'

import { ActionFormData } from '@src/app/(layout)/page/dashboard-actions/[id]/page'
import { Check, Globe, List, Plus, Settings, Trash2, X } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'

interface ActionsFormStep1Props {
  onNextStep?: () => void
  isLoading?: boolean
  setCurrentStep: any
}

const ActionsFormStep1: React.FC<ActionsFormStep1Props> = ({
  onNextStep,
  isLoading,
  setCurrentStep,
}) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
    control,
  } = useFormContext<ActionFormData>()

  const selectedMethod = watch('apiUrl')

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'headers',
  })

  const handleMethodSelect = (method: string) => {
    setValue('apiUrl', method as ActionFormData['apiUrl'])
  }

  const addHeader = () => {
    append({ key: '', value: '' })
  }

  const removeHeader = (index: number) => {
    remove(index)
  }

  const methods = [
    { name: 'GET', description: 'Get Data', color: 'badge-green', icon: Globe },
    {
      name: 'POST',
      description: 'Create or Submit Data',
      color: 'badge-blue',
      icon: Settings,
    },
    {
      name: 'PUT',
      description: 'Replace Entire Data',
      color: 'badge-orange',
      icon: List,
    },
    {
      name: 'PATCH',
      description: 'Modify Partial Data',
      color: 'badge-purple',
      icon: Settings,
    },
    {
      name: 'DELETE',
      description: 'Delete Data',
      color: 'badge-red',
      icon: Trash2,
    },
  ]

  return (
    <div>
      <div className="card-header">
        <h6 className="card-title">Connect to the API</h6>
        <p className="text-gray-500 dark:text-dark-500">
          You can find all the necessary data in the API documentation of the
          selected service.
        </p>
      </div>

      <div className="card-body">
        {/* Endpoint Method Section */}
        <div className="mb-8">
          <h6 className="mb-4">Endpoint Method</h6>
          <p className="text-gray-500 dark:text-dark-500 mb-4">
            Select the endpoint method to define how the API will interact with
            the data.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {methods.map((method) => {
              const IconComponent = method.icon
              const isSelected = selectedMethod === method.name

              return (
                <div
                  key={method.name}
                  onClick={() => handleMethodSelect(method.name)}
                  className={`p-4 border rounded-md cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}>
                  <div className="flex items-center gap-3">
                    <span className={`${method.color} badge`}>
                      {method.name}
                    </span>
                    {IconComponent && (
                      <IconComponent className="size-5 text-gray-500 dark:text-dark-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-dark-500 mt-2">
                    {method.description}
                  </p>
                  {isSelected && (
                    <div className="flex items-center gap-2 mt-2 text-primary-500">
                      <Check className="size-4" />
                      <span className="text-xs font-medium">Selected</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Endpoint URL Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h6>Endpoint URL</h6>
          </div>
          <p className="text-gray-500 dark:text-dark-500 mb-4">
            Enter the full URL of the API endpoint.
          </p>
          <div className="flex flex-col gap-2">
            <input
              {...register('endpointUrl')}
              type="text"
              placeholder="https://api.example.com/endpoint"
              className={`form-input flex-1 ${errors.endpointUrl ? 'border-red-500' : ''}`}
            />
            {errors.endpointUrl && (
              <span className="text-red-500 text-sm">
                {errors.endpointUrl.message as string}
              </span>
            )}
          </div>
        </div>

        {/* Headers Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h6>Headers</h6>
            <button
              type="button"
              onClick={addHeader}
              className="btn btn-sm btn-outline-primary flex items-center gap-2">
              <Plus className="size-4" />
              Add Row
            </button>
          </div>
          <p className="text-gray-500 dark:text-dark-500 mb-4">
            Specify the HTTP headers required for your API request.
          </p>

          {fields.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              No headers added yet
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-2">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                        {...register(`headers.${index}.key`)}
                        type="text"
                        placeholder="Header name"
                        className={`form-input w-full ${errors.headers?.[index]?.key ? 'border-red-500' : ''}`}
                      />
                      {errors.headers?.[index]?.key && (
                        <span className="text-red-500 text-sm mt-1 block">
                          {errors.headers[index].key.message as string}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        {...register(`headers.${index}.value`)}
                        type="text"
                        placeholder="Header value"
                        className={`form-input w-full ${errors.headers?.[index]?.value ? 'border-red-500' : ''}`}
                      />
                      {errors.headers?.[index]?.value && (
                        <span className="text-red-500 text-sm mt-1 block">
                          {errors.headers[index].value.message as string}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeHeader(index)}
                      className="btn btn-sm btn-outline-danger">
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timeout Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h6>Timeout</h6>
          </div>
          <p className="text-gray-500 dark:text-dark-500 mb-4">
            How long to wait before the request is considered failed.
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <input
                {...register('timeout', { valueAsNumber: true })}
                type="number"
                min="0"
                className={`form-input w-32 ${errors.timeout ? 'border-red-500' : ''}`}
              />
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                ms
              </span>
            </div>
            {errors.timeout && (
              <span className="text-red-500 text-sm">
                {errors.timeout.message as string}
              </span>
            )}
          </div>
          <div className="mt-2">
            <p
              onClick={() => setCurrentStep(5)}
              className="text-primary-500 text-sm hover:underline">
              Manage error messages
            </p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="pt-6 border-t border-gray-200 dark:border-dark-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:ml-auto">
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
    </div>
  )
}

export default ActionsFormStep1
