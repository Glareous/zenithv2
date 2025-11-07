import React, { useCallback, useEffect, useMemo, useRef } from 'react'

import { ProjectAction } from '@prisma/client'
import { ActionFormData } from '@src/app/(layout)/page/dashboard-actions/[id]/page'
import RichTextEditor from '@src/components/molecules/RichTextEditor'
import { TRIGGER_CHARACTERS } from '@src/utils/triggerMappings'
import { type Editor } from '@tiptap/react'
import { Plus, X } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import Select from 'react-select'

import { type RichTextEditorRef } from '@/components/molecules/RichTextEditor'

const extractKeysFromEditorContent = (editor: Editor): string[] => {
  if (!editor) return []
  const content = editor.getJSON()

  const extractTextFromNodes = (nodes: any[]): string => {
    return nodes
      .map((node) => {
        if (node.type === 'text') return node.text || ''
        if (node.type === 'reactMention')
          return `"${node.attrs?.label || node.attrs?.id || ''}"`
        if (node.content) return extractTextFromNodes(node.content)
        return ''
      })
      .join('')
  }

  const fullText = extractTextFromNodes(content.content || [])
  try {
    const jsonObj = JSON.parse(fullText)
    return Object.keys(jsonObj)
  } catch {
    const keyMatches = fullText.match(/"([^"]+)":/g)
    return keyMatches ? keyMatches.map((match) => match.slice(1, -2)) : []
  }
}

interface ActionsFormStep3Props {
  onPreviousStep?: () => void
  onNextStep?: () => void
  isLoading?: boolean
  availableActions: any[]
  editorRef: React.RefObject<RichTextEditorRef | null>
}

const ActionsFormStep3: React.FC<ActionsFormStep3Props> = ({
  onPreviousStep,
  onNextStep,
  isLoading,
  availableActions,
  editorRef,
}) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
    control,
  } = useFormContext<ActionFormData>()

  const formRequestBody = watch('requestBody')
  const formActionCallType = watch('actionCallType')
  const formApiUrl = watch('apiUrl')
  const formBeforeCallVariables = watch('beforeCallVariables')
  const formDuringCallVariables = watch('duringCallVariables')

  const {
    fields: beforeCallFields,
    append: appendBeforeCall,
    remove: removeBeforeCall,
  } = useFieldArray({
    control,
    name: 'beforeCallVariables',
  })

  const {
    fields: duringCallFields,
    append: appendDuringCall,
    remove: removeDuringCall,
  } = useFieldArray({
    control,
    name: 'duringCallVariables',
  })

  const {
    fields: queryParamsFields,
    append: appendQueryParam,
    remove: removeQueryParam,
  } = useFieldArray({
    control,
    name: 'queryParameters',
  })
  const enabledTriggers = useMemo(
    () => ({
      variables: false,
      actions: false,
      results: true,
    }),
    []
  )

  const handleRequestBodyUpdate = useCallback(
    (newValue: string) => {
      setValue('requestBody', newValue)
    },
    [setValue]
  )

  const handleActionCallTypeChange = (type: string) => {
    setValue('actionCallType', type as 'BEFORE_CALL' | 'DURING_CALL')
  }

  const generateVariableId = () => {
    return `var-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const addVariable = () => {
    if (formActionCallType === 'BEFORE_CALL') {
      appendBeforeCall({
        key: '',
        value: '',
        variable_id: generateVariableId(),
        actionCallType: 'BEFORE_CALL',
        type: 'STRING',
        required: false,
      })
    } else {
      appendDuringCall({
        key: '',
        value: '',
        variable_id: generateVariableId(),
        actionCallType: 'DURING_CALL',
        description: '',
        type: 'STRING',
        required: false,
      })
    }
  }

  const addQueryParameter = () => {
    appendQueryParam({
      key: '',
      value: '',
    })
  }

  const createPredefinedVariables = () => {
    if (formActionCallType !== 'BEFORE_CALL') return

    const hasCallId = beforeCallFields.some((v) => v.key === 'call_id')
    if (!hasCallId) {
      appendBeforeCall({
        variable_id: generateVariableId(),
        key: 'call_id',
        value: '',
        actionCallType: 'BEFORE_CALL',
        type: 'STRING',
        required: false,
      })
    }

    const hasPhone = beforeCallFields.some((v) => v.key === 'user_phone_number')
    if (!hasPhone) {
      appendBeforeCall({
        variable_id: generateVariableId(),
        key: 'user_phone_number',
        value: '',
        actionCallType: 'BEFORE_CALL',
        type: 'STRING',
        required: false,
      })
    }
  }

  const handleVariableRemoved = (id: string) => {
    editorRef.current?.removeMentionsById(id)
  }

  const handleVariableUpdate = (variableId: string, newKey: string) => {
    editorRef.current?.updateMentionById(variableId, newKey)
  }

  const removeVariable = (index: number) => {
    if (formActionCallType === 'BEFORE_CALL') {
      const variableId = formBeforeCallVariables[index]?.variable_id
      if (variableId) handleVariableRemoved(variableId)
      removeBeforeCall(index)
    } else {
      const variableId = formDuringCallVariables[index]?.variable_id
      if (variableId) handleVariableRemoved(variableId)
      removeDuringCall(index)
    }
  }

  return (
    <div>
      <div className="card-header">
        <h6 className="card-title">Configuration</h6>
        <p className="text-gray-500 dark:text-dark-500">
          Configure Custom Variables for the action to work correctly or provide
          the request body in JSON format to send data to the API.
        </p>
      </div>

      <div className="card-body">
        {/* Action Call Type Selection */}
        <div className="mb-8">
          <h6 className="mb-4">When to Execute</h6>
          <p className="text-gray-500 dark:text-dark-500 mb-4">
            Choose when this action should be executed during the call process.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                value: 'BEFORE_CALL',
                label: 'Before Call',
                description: 'Execute before the call starts',
              },
              {
                value: 'DURING_CALL',
                label: 'During Call',
                description: 'Execute while the call is active',
              },
            ].map((type) => (
              <div
                key={type.value}
                onClick={() => handleActionCallTypeChange(type.value)}
                className={`p-4 border rounded-md cursor-pointer transition-all ${
                  formActionCallType === type.value
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}>
                <div className="font-medium mb-2">{type.label}</div>
                <p className="text-sm text-gray-500 dark:text-dark-500">
                  {type.description}
                </p>
                {formActionCallType === type.value && (
                  <div className="mt-2 text-primary-500 text-sm font-medium">
                    ✓ Selected
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Request Body */}
        <div className="mb-8">
          {formApiUrl === 'GET' ? (
            <>
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h6>Query parameters</h6>
                    </div>
                    <p className="text-gray-500 dark:text-dark-500 mb-2">
                      Query parameters to send in the request
                    </p>
                  </div>

                  <button
                    onClick={addQueryParameter}
                    className="btn btn-sm btn-outline-primary flex items-center gap-2">
                    <Plus className="size-4" />
                    Add query parameter
                  </button>
                </div>
                <div className="space-y-3">
                  {queryParamsFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between gap-2">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            {...register(`queryParameters.${index}.key`)}
                            className="form-input"
                            placeholder="Key"
                          />
                          {errors.queryParameters?.[index]?.key && (
                            <span className="text-red-500 text-sm mt-1 block">
                              {
                                errors.queryParameters[index].key
                                  .message as React.ReactNode
                              }
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            {...register(`queryParameters.${index}.value`)}
                            className="form-input"
                            placeholder="Value"
                          />
                          {errors.queryParameters?.[index]?.value && (
                            <span className="text-red-500 text-sm mt-1 block">
                              {
                                errors.queryParameters[index].value
                                  .message as React.ReactNode
                              }
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQueryParam(index)}
                        className="btn btn-sm btn-outline-danger"
                        disabled={isLoading}>
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {/**@ts-expect-error - TypeScript error accessing nested validation error properties */}
                {errors.queryParameters?.queryParameters?.message && (
                  <span className="text-red-500 text-sm block mt-1">
                    {/**@ts-expect-error - TypeScript error accessing nested validation error message */}
                    {errors.queryParameters.queryParameters.message}
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h6>Body</h6>
              </div>
              <p className="text-gray-500 dark:text-dark-500 mb-2">
                JSON payload to send with the request (optional).
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Type{' '}
                <span className="bg-gray-50 text-gray-600 px-1 rounded">
                  {TRIGGER_CHARACTERS.result}
                </span>{' '}
                to reference variables
              </p>
              <RichTextEditor
                ref={editorRef}
                content={formRequestBody}
                onUpdate={handleRequestBodyUpdate}
                availableActions={availableActions}
                placeholder='{"key": "value"}'
                className="min-h-[200px]"
                enabledTriggers={enabledTriggers}
                replaceResultChar
              />
              {errors?.requestBody?.message && (
                <p className="text-red-500 text-sm mt-2">
                  {errors?.requestBody?.message}
                </p>
              )}
            </>
          )}
        </div>

        <div className="mb-8 mt-5">
          <div className="flex items-center justify-between mb-2">
            <h6>Variables</h6>
            <div className="flex gap-2">
              {formActionCallType === 'BEFORE_CALL' &&
                (!formBeforeCallVariables
                  .map((field) => field.key)
                  .includes('call_id') ||
                  !formBeforeCallVariables
                    .map((field) => field.key)
                    .includes('user_phone_number')) && (
                  <button
                    onClick={createPredefinedVariables}
                    className="btn btn-sm btn-outline-secondary flex items-center gap-2">
                    Add Predefined
                  </button>
                )}
              <button
                onClick={addVariable}
                className="btn btn-sm btn-outline-primary flex items-center gap-2">
                <Plus className="size-4" />
                Add Variable
              </button>
            </div>
          </div>
          <p className="text-gray-500 dark:text-dark-500 mb-1">
            {formActionCallType === 'BEFORE_CALL'
              ? 'Configure simple key-value pairs for call initialization.'
              : 'Define variables that can be used in your prompts and API calls.'}
          </p>

          {formActionCallType === 'BEFORE_CALL' ? (
            /* BEFORE_CALL: Simple key-value pairs */
            <div>
              <div className="space-y-3">
                {beforeCallFields.length > 0 && (
                  <p className="text-red-500 text-xs flex justify-end px-5">
                    is required?
                  </p>
                )}
                {beforeCallFields.map((field, index) => {
                  const currentKey = watch(`beforeCallVariables.${index}.key`)
                  const isReservedVariable =
                    currentKey === 'call_id' ||
                    currentKey === 'user_phone_number'

                  return (
                    <div
                      key={field.id}
                      className="flex items-center gap-2">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            {...register(`beforeCallVariables.${index}.key`)}
                            className="form-input"
                            placeholder="Variable key"
                            disabled={isReservedVariable}
                            onBlur={(e) => {
                              const variableId =
                                formBeforeCallVariables[index]?.variable_id
                              if (variableId) {
                                handleVariableUpdate(variableId, e.target.value)
                              }
                            }}
                          />
                          {errors.beforeCallVariables?.[index]?.key && (
                            <span className="text-red-500 text-sm mt-1 block">
                              {
                                errors.beforeCallVariables[index].key
                                  .message as React.ReactNode
                              }
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <Select
                            {...register(`beforeCallVariables.${index}.type`)}
                            value={{
                              value: watch(`beforeCallVariables.${index}.type`) || 'STRING',
                              label: watch(`beforeCallVariables.${index}.type`) || 'STRING',
                            }}
                            onChange={(option: any) => {
                              setValue(
                                `beforeCallVariables.${index}.type`,
                                option.value
                              )
                            }}
                            options={[
                              { value: 'STRING', label: 'STRING' },
                              { value: 'NUMBER', label: 'NUMBER' },
                              { value: 'BOOLEAN', label: 'BOOLEAN' },
                            ]}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            placeholder="Type"
                          />
                          {errors.beforeCallVariables?.[index]?.type && (
                            <span className="text-red-500 text-sm mt-1 block">
                              {
                                errors.beforeCallVariables[index].type
                                  .message as React.ReactNode
                              }
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            {...register(`beforeCallVariables.${index}.value`)}
                            className="form-input"
                            placeholder="Variable value"
                          />
                          {errors.beforeCallVariables?.[index]?.value && (
                            <span className="text-red-500 text-sm mt-1 block">
                              {
                                errors.beforeCallVariables[index].value
                                  .message as React.ReactNode
                              }
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor={`switch-before-${index}`}
                          className="switch-group switch-soft switch-text">
                          <div className="relative">
                            <input
                              type="checkbox"
                              id={`switch-before-${index}`}
                              className="sr-only peer"
                              {...register(
                                `beforeCallVariables.${index}.required`
                              )}
                            />
                            <div className="switch-wrapper"></div>
                            <div className="switch-dot peer-checked:translate-x-full rtl:peer-checked:-translate-x-full switch-primary peer-checked:bg-primary-500 peer-checked:after:text-primary-50"></div>
                          </div>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeVariable(index)}
                          className={`btn btn-sm btn-outline-danger ${
                            isReservedVariable
                              ? 'opacity-0 pointer-events-none'
                              : ''
                          }`}
                          disabled={isLoading || isReservedVariable}>
                          <X className="size-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
              {/**@ts-expect-error - TypeScript error accessing nested validation error properties */}
              {errors.beforeCallVariables?.beforeCallVariables?.message && (
                <span className="text-red-500 text-sm block mt-1">
                  {/**@ts-expect-error - TypeScript error accessing nested validation error message */}
                  {errors.beforeCallVariables.beforeCallVariables.message}
                </span>
              )}
            </div>
          ) : (
            /* DURING_CALL: Full variable configuration */
            <div>
              <div className="space-y-3">
                {duringCallFields.length > 0 && (
                  <p className="text-red-500 text-xs flex justify-end px-5">
                    is required?
                  </p>
                )}
                {duringCallFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <div className="grid grid-cols-4 gap-3">
                      <div className="flex flex-col gap-1">
                        <input
                          type="text"
                          {...register(`duringCallVariables.${index}.key`)}
                          placeholder="Variable name"
                          className="form-input"
                          onBlur={(e) => {
                            const variableId =
                              formDuringCallVariables[index]?.variable_id
                            if (variableId) {
                              handleVariableUpdate(variableId, e.target.value)
                            }
                          }}
                        />
                        {errors.duringCallVariables?.[index]?.key && (
                          <span className="text-red-500 text-sm mt-1 block">
                            {
                              errors.duringCallVariables[index].key
                                .message as React.ReactNode
                            }
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <input
                          type="text"
                          {...register(
                            `duringCallVariables.${index}.description`
                          )}
                          placeholder="Variable description"
                          className="form-input"
                        />
                        {errors.duringCallVariables?.[index]?.description && (
                          <span className="text-red-500 text-sm mt-1 block">
                            {
                              errors.duringCallVariables[index].description
                                .message as React.ReactNode
                            }
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <Select
                          value={{
                            value:
                              watch(`duringCallVariables.${index}.type`) ||
                              'STRING',
                            label:
                              watch(`duringCallVariables.${index}.type`) ===
                              'STRING'
                                ? 'String'
                                : watch(`duringCallVariables.${index}.type`) ===
                                    'NUMBER'
                                  ? 'Number'
                                  : watch(
                                        `duringCallVariables.${index}.type`
                                      ) === 'INT'
                                    ? 'Integer'
                                    : watch(
                                          `duringCallVariables.${index}.type`
                                        ) === 'FLOAT'
                                      ? 'Float'
                                      : watch(
                                            `duringCallVariables.${index}.type`
                                          ) === 'BOOL'
                                        ? 'Boolean'
                                        : watch(
                                              `duringCallVariables.${index}.type`
                                            ) === 'LIST'
                                          ? 'List'
                                          : 'String',
                          }}
                          onChange={(option) => {
                            if (option) {
                              setValue(
                                `duringCallVariables.${index}.type`,
                                option.value
                              )
                            }
                          }}
                          options={[
                            { value: 'STRING', label: 'String' },
                            { value: 'NUMBER', label: 'Number' },
                            { value: 'INT', label: 'Integer' },
                            { value: 'FLOAT', label: 'Float' },
                            { value: 'BOOL', label: 'Boolean' },
                            { value: 'LIST', label: 'List' },
                          ]}
                          classNamePrefix="select"
                        />
                        {errors.duringCallVariables?.[index]?.type && (
                          <span className="text-red-500 text-sm mt-1 block">
                            {
                              errors.duringCallVariables[index].type
                                .message as React.ReactNode
                            }
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <input
                          type="text"
                          {...register(`duringCallVariables.${index}.value`)}
                          placeholder="Example value"
                          className="form-input flex-1"
                        />
                        {errors.duringCallVariables?.[index]?.value && (
                          <span className="text-red-500 text-sm mt-1 block">
                            {
                              errors.duringCallVariables[index].value
                                .message as React.ReactNode
                            }
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={`switch-during-${index}`}
                        className="switch-group switch-soft switch-text">
                        <div className="relative">
                          <input
                            type="checkbox"
                            id={`switch-during-${index}`}
                            className="sr-only peer"
                            {...register(
                              `duringCallVariables.${index}.required`
                            )}
                          />
                          <div className="switch-wrapper"></div>
                          <div className="switch-dot peer-checked:translate-x-full rtl:peer-checked:-translate-x-full switch-primary peer-checked:bg-primary-500 peer-checked:after:text-primary-50"></div>
                        </div>
                      </label>
                      <button
                        type="button"
                        onClick={() => removeVariable(index)}
                        className="btn btn-sm btn-outline-danger"
                        disabled={isLoading}>
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {/**@ts-expect-error - TypeScript error accessing nested validation error properties */}
              {errors.duringCallVariables?.duringCallVariables?.message && (
                <span className="text-red-500 text-sm block mt-1">
                  {/**@ts-expect-error - TypeScript error accessing nested validation error message */}
                  {errors.duringCallVariables?.duringCallVariables?.message}
                </span>
              )}
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

export default ActionsFormStep3
