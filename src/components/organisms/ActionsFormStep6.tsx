import React, { useEffect, useState } from 'react'

import { Switch } from '@headlessui/react'
import type { ActionFormData } from '@src/app/(layout)/page/dashboard-actions/[id]/page'
import { api } from '@src/trpc/react'
import { Copy, Maximize2, Play, Search } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { toast } from 'react-toastify'

import DialogInitializeRequest from './DialogInitializeRequest'

interface ActionsFormStep6Props {
  action?: any
  onPreviousStep?: () => void
  onNextStep?: () => void
  isLoading?: boolean
}

const ActionsFormStep6: React.FC<ActionsFormStep6Props> = ({
  action,
  onPreviousStep,
  onNextStep,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [availableResults, setAvailableResults] = useState<any[]>([])
  const [openInitializeVariables, setOpenInitializeVariables] = useState(false)

  const {
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useFormContext<ActionFormData>()

  const actionResults = watch('actionResults')

  const testApiCall = api.projectAction.testApiCall.useMutation({
    onSuccess: (result) => {
      setApiResponse(result.response)

      const allVariables = getVariables()

      const newApiResults = result.extractedFields.map((field) => {
        const matchingVariable = allVariables.find((v) => {
          if (v.key === field.name) return true

          const lastPart = field.name.split('.').pop() || field.name

          if (v.key !== lastPart) return false

          const fieldsWithSameLastPart = result.extractedFields.filter(
            (f) => f.name.split('.').pop() === lastPart
          )

          return fieldsWithSameLastPart.length === 1
        })

        return {
          key: field.name,
          selected: false,
          required: matchingVariable?.required || false,
        }
      })

      const existingKeys = actionResults.map((r) => r.key)
      const mergedResults = [
        ...availableResults.map((result) => ({
          ...result,
          selected: existingKeys.includes(result.key),
        })),

        ...newApiResults.filter(
          (newResult) =>
            !availableResults.some((existing) => existing.key === newResult.key)
        ),
      ]

      setAvailableResults(mergedResults)
      toast.success('API test completed successfully!')
    },
    onError: (error) => {
      toast.error(`API test failed: ${error.message}`)
      setApiResponse(null)
    },
  })

  const handleResultToggle = (resultKey: string, checked: boolean) => {
    setAvailableResults((prev) =>
      prev.map((result) =>
        result.key === resultKey ? { ...result, selected: checked } : result
      )
    )

    const selectedResults = availableResults
      .filter((result) =>
        result.key === resultKey ? checked : result.selected
      )
      .map((result) => ({
        key: result.key,
      }))

    setValue('actionResults', selectedResults)
  }

  const handleSelectAllToggle = () => {
    const allSelected = availableResults.every((result) => result.selected)
    const newSelectedState = !allSelected

    setAvailableResults((prev) =>
      prev.map((result) => ({
        ...result,
        selected: newSelectedState,
      }))
    )

    const selectedResults = newSelectedState
      ? availableResults.map((result) => ({
          key: result.key,
        }))
      : []

    setValue('actionResults', selectedResults)
  }

  const handleInitializeAction = (data = {}) => {
    if (!action?.id) return

    testApiCall.mutate({ actionId: action.id, data })
  }

  useEffect(() => {
    if (actionResults.length > 0) {
      const formResults = actionResults.map((result) => ({
        key: result.key,
        selected: true,
        fromForm: true,
      }))
      setAvailableResults(formResults)
    }
  }, [])

  const getQueryParameters = () => {
    const formData = getValues()
    return formData.queryParameters || []
  }

  const getVariables = () => {
    const formData = getValues()
    return [
      ...(formData.beforeCallVariables || []),
      ...(formData.duringCallVariables || []),
    ]
  }

  const shouldShowInitializeDialog = () => {
    const apiMethod = watch('apiUrl')
    const queryParams = getQueryParameters()
    const variables = getVariables()

    if (apiMethod === 'GET') {
      return queryParams.length > 0 || variables.length > 0
    } else {
      return variables.length > 0
    }
  }

  return (
    <div>
      <div className="card-header">
        <h6 className="card-title">Action Results</h6>
        <p className="text-gray-500 dark:text-dark-500">
          Test your action and select which results to save for later use.
        </p>
      </div>

      <div className="card-body">
        {/* Test the API call */}
        <div className="mb-8">
          <h6 className="mb-4">Test the API call</h6>
          <p className="text-gray-500 dark:text-dark-500 mb-4">
            Initialize your action to see what data it returns, then select
            which fields you want to save as variables.
          </p>

          <button
            onClick={() => {
              if (shouldShowInitializeDialog()) {
                setOpenInitializeVariables(true)
              } else {
                handleInitializeAction()
              }
            }}
            disabled={testApiCall.isPending || isLoading || !action?.id}
            className="btn btn-primary">
            {testApiCall.isPending ? 'Testing API...' : 'Initialize action'}
          </button>

          {/* API Response Display */}
          <div className="bg-gray-50 border rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h6 className="text-sm font-medium">API Response</h6>
              {apiResponse && (
                <button className="btn-icon btn-sm">
                  <Copy className="size-4" />
                </button>
              )}
            </div>
            <pre className="text-sm text-gray-600 bg-white p-3 rounded border overflow-x-auto min-h-[100px]">
              {apiResponse
                ? JSON.stringify(apiResponse.data, null, 2)
                : 'No API response yet.'}
            </pre>
          </div>
        </div>

        {/* Available Action Results */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h6>Available Action Results</h6>
            {availableResults.length > 0 && (
              <button
                onClick={handleSelectAllToggle}
                className="btn btn-sm btn-outline-primary">
                {availableResults.every((result) => result.selected)
                  ? 'Deselect All'
                  : 'Select All'}
              </button>
            )}
          </div>

          <p className="text-gray-500 dark:text-dark-500 mb-4">
            Select the fields you want to extract from the API response and use
            as variables in future actions.
          </p>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search results..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {availableResults
                  .filter((result) =>
                    result.key.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((result) => (
                    <tr key={result.key}>
                      <td
                        className={
                          result.required ? 'font-bold' : 'font-medium'
                        }>
                        {result.key}
                        {result.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </td>
                      <td>
                        <Switch
                          checked={result.selected}
                          onChange={(checked) =>
                            handleResultToggle(result.key, checked)
                          }
                          className={`${
                            result.selected ? 'bg-blue-600' : 'bg-gray-200'
                          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}>
                          <span className="sr-only">Toggle {result.key}</span>
                          <span
                            className={`${
                              result.selected
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                          />
                        </Switch>
                      </td>
                    </tr>
                  ))}
                {availableResults.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-center py-8 text-gray-500">
                      No result fields available yet. Initialize the action to
                      extract fields from the response.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {errors.actionResults && (
            <span className="text-red-500 text-sm mt-1 block">
              {errors.actionResults.message}
            </span>
          )}
        </div>

        {/* Navigation with Save Button */}
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
              {isLoading ? 'Saving...' : 'Save action results'}
            </button>
          </div>
        </div>
      </div>

      {/* Initialize Variables Dialog */}
      <DialogInitializeRequest
        isOpen={openInitializeVariables}
        onClose={() => setOpenInitializeVariables(false)}
        onSubmit={(data) => {
          setOpenInitializeVariables(false)
          handleInitializeAction(data)
        }}
        queryParameters={getQueryParameters()}
        variables={getVariables() as any}
        apiUrl={watch('apiUrl')}
      />
    </div>
  )
}

export default ActionsFormStep6
