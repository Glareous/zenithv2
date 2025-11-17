'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Modal } from '@src/components/custom/modal/modal'
import { useFieldArray, useForm } from 'react-hook-form'

type VariableType = 'string' | 'number' | 'boolean'

interface VariableItem {
  id: string
  key: string
  value: string
  type: string | null
  description: string | null
  actionType: string
  variableType: any
  actionId: string

  selectedType: VariableType
  userInput: string | number | boolean
  required?: boolean
}

interface FormData {
  variables: VariableItem[]
}

interface DialogInitializeRequestProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Record<string, string | number | boolean>) => void
  queryParameters?: Array<{ key: string; value: string }>
  variables?: Array<{
    key: string
    value: string
    actionType?: string
    type?: string
    description?: string
    required?: boolean
  }>
  apiUrl?: string
  title?: string
  description?: string
}

const DynamicInput: React.FC<{
  type: VariableType
  register: any
  error?: any
}> = ({ type, register, error }) => {
  const baseClasses = `form-input ${error ? 'border-red-500' : ''}`

  switch (type) {
    case 'number':
      return (
        <input
          type="number"
          placeholder="Enter number"
          className={baseClasses}
          {...register}
        />
      )
    case 'boolean':
      return (
        <select
          className={`form-select ${error ? 'border-red-500' : ''}`}
          {...register}>
          <option value="">Select value</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      )
    default:
      return (
        <input
          type="text"
          placeholder="Enter text value"
          className={baseClasses}
          {...register}
        />
      )
  }
}

const DialogInitializeRequest: React.FC<DialogInitializeRequestProps> = ({
  isOpen,
  onClose,
  onSubmit,
  queryParameters = [],
  variables = [],
  apiUrl,
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const variablesToShow = useMemo(() => {
    const items: Array<{
      key: string
      value: string
      type?: string
      required?: boolean
    }> = []

    if (apiUrl === 'GET') {
      queryParameters.forEach((param) => {
        items.push({
          key: param.key,
          value: param.value || '',
          type: 'queryParameter',
          required: true,
        })
      })

      variables.forEach((variable) => {
        items.push({
          key: variable.key,
          value: variable.value || '',
          type: 'variable',
          required: variable.required || false,
        })
      })
    } else {
      variables.forEach((variable) => {
        items.push({
          key: variable.key,
          value: variable.value || '',
          type: 'variable',
          required: variable.required || false,
        })
      })
    }

    return items
  }, [queryParameters, variables, apiUrl])

  const defaultValues = {
    variables: variablesToShow,
  }

  const {
    control,
    handleSubmit,
    register,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues,
  })

  const { fields } = useFieldArray({
    control,
    name: 'variables',
  })

  const handleClose = useCallback(() => {
    reset()
    onClose()
  }, [reset, onClose])

  useEffect(() => {
    if (variablesToShow.length) {
      reset({
        variables: variablesToShow.map((variable) => {
          const varType = variables.find((v) => v.key === variable.key)?.type
          let selectedType: VariableType = 'string'

          if (varType) {
            const normalized = varType.toLowerCase()
            if (normalized === 'number') selectedType = 'number'
            else if (normalized === 'boolean') selectedType = 'boolean'
          }

          return {
            ...variable,
            selectedType,
            userInput: '', // Empty input - user enters real value
          }
        }),
      })
    }
  }, [variablesToShow, reset, variables])

  const onFormSubmit = async (formData: FormData) => {
    setIsLoading(true)
    try {
      const result: Record<string, string | number | boolean> = {}

      formData.variables.forEach((variable) => {
        if (variable.userInput !== undefined && variable.userInput !== '') {
          const key = variable.key
          let value = variable.userInput

          if (variable.selectedType === 'number') {
            value = Number(value)
          } else if (variable.selectedType === 'boolean') {
            value = value === 'true' || value === true
          } else {
            value = String(value)
          }

          result[key] = value
        }
      })

      onSubmit(result)
    } finally {
      setIsLoading(false)
    }
    handleClose()
  }
  console.log({ fields, variablesToShow })
  if (variablesToShow.length === 0) {
    return null
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      position="modal-center"
      size="modal-2xl"
      title="Set values for this request"
      content={() => (
        <form onSubmit={handleSubmit(onFormSubmit)} className="">
          {/* Header */}
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              Set values for the parameters and variables required by this
              action:
            </p>
          </div>

          {/* Variables Grid */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {fields.map((field, index) => {
              const watchedType =
                watch(`variables.${index}.selectedType`) || 'string'
              const fieldError = errors.variables?.[index]
              const isRequired = field.required || false

              return (
                <div
                  key={field.id}
                  className="grid grid-cols-2 gap-4 items-end p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {/* Column 1: Parameter/Variable Name (Disabled) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {field.type === 'queryParameter'
                        ? 'Query Parameter'
                        : 'Variable'}
                      {isRequired && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <input
                      value={field.key}
                      disabled
                      className="form-input bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    />
                  </div>

                  {/* Column 3: Dynamic Value Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Value
                    </label>
                    <DynamicInput
                      type={watchedType}
                      register={register(
                        `variables.${index}.userInput`,
                        isRequired ? { required: 'This field is required' } : {}
                      )}
                      error={fieldError?.userInput}
                    />
                    {fieldError?.userInput && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldError.userInput.message}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </form>
      )}
      footer={() => (
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
            disabled={isLoading}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit(onFormSubmit)}
            disabled={isLoading}>
            {isLoading ? 'Initializing...' : 'Initialize'}
          </button>
        </div>
      )}
    />
  )
}

export default DialogInitializeRequest
