'use client'

import React, { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Edit, Plus, X } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

import Accordion from '@/components/custom/accordion/accordion'
import { Drawer } from '@/components/custom/drawer/drawer'

const openQuestionSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Identifier is required')
    .regex(/^[a-z_]+$/, 'Only lowercase letters and underscores are allowed'),
  question: z.string().min(1, 'Question is required'),
  examples: z
    .array(
      z.object({
        value: z.string().min(1, 'Example cannot be empty'),
      })
    )
    .min(2, 'At least 2 examples are required'),
})

type OpenQuestionFormData = z.infer<typeof openQuestionSchema>

interface DrawerOpenQuestionProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: OpenQuestionFormData) => void
  onDelete?: () => void
  initialData?: {
    identifier?: string
    prompt?: string
    examples?: string[]
    isEditing?: boolean
  }
}

const DrawerOpenQuestion: React.FC<DrawerOpenQuestionProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
}) => {
  const [isExamplesAccordionOpen, setIsExamplesAccordionOpen] = useState(true)
  const [isAgentsAccordionOpen, setIsAgentsAccordionOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    trigger,
    formState: { errors, isValid },
  } = useForm<OpenQuestionFormData>({
    resolver: zodResolver(openQuestionSchema),
    mode: 'all',
    defaultValues: {
      identifier: '',
      question: '',
      examples: [{ value: '' }, { value: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'examples',
  })

  const onSubmit = (data: OpenQuestionFormData) => {
    onSave(data)
    reset()
    onClose()
  }

  const handleCancel = () => {
    reset()
    onClose()
  }

  const handleDelete = async () => {
    if (!onDelete) return

    setIsDeleting(true)
    try {
      await onDelete()
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddExample = () => {
    append({ value: '' })
  }

  const handleEditMode = () => {
    if (fields.length === 0) {
      append({ value: '' })
      append({ value: '' })
    }
    setIsEditMode(true)
  }

  React.useEffect(() => {
    if (isOpen) {
      const defaultExamples = initialData?.examples?.map((example) => ({
        value: example,
      })) || [{ value: '' }, { value: '' }]

      reset({
        identifier: initialData?.identifier || '',
        question: initialData?.prompt || '',
        examples: defaultExamples,
      })

      setTimeout(() => trigger(), 0)
    }
  }, [isOpen, initialData, reset, trigger])

  const content = (
    <form
      id="open-question-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6">
      {/* Identifier Field */}
      <div>
        <label className="block text-sm font-normal mb-2">Identifier</label>
        <input
          type="text"
          placeholder="Enter identifier"
          {...register('identifier')}
          className={`w-full px-3 py-2 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 placeholder-gray-400 ${
            errors.identifier ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        <p className="mt-1 text-xs text-gray-500">
          Only lowercase letters and underscores are allowed
        </p>
        {errors.identifier && (
          <p className="mt-1 text-xs text-red-600">
            {errors.identifier.message}
          </p>
        )}
      </div>

      {/* Question Field */}
      <div>
        <label className="block text-sm font-normal mb-2">
          What the AI should extract from the call
        </label>
        <textarea
          placeholder="Enter what the AI should extract from the call"
          {...register('question')}
          rows={4}
          className={`w-full text-xs px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 placeholder-gray-400 resize-none ${
            errors.question ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        <p className="mt-1 text-xs text-gray-500">
          The response will be part of the webhook after the call
        </p>
        {errors.question && (
          <p className="mt-1 text-xs text-red-600">{errors.question.message}</p>
        )}
      </div>

      {/* Examples Accordion */}
      <div className="mt-2">
        <Accordion
          title="Output Examples"
          isOpen={isExamplesAccordionOpen}
          onToggle={() => setIsExamplesAccordionOpen(!isExamplesAccordionOpen)}
          isButtonAccordion={true}
          titleClass="text-sm font-medium text-gray-700"
          arrowColor="text-gray-500">
          <div className="mt-4 space-y-3">
            {!isEditMode ? (
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center text-sm text-gray-700">
                    <span className="text-gray-400 mr-2">→</span>
                    {field.value || `Example ${index + 1}`}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleEditMode}
                  className="flex items-center justify-center w-full py-2 mt-3 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-56 overflow-y-scroll">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    Edit Output Examples
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsEditMode(false)}
                    className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <input
                        {...register(`examples.${index}.value`)}
                        className={`flex-1 px-3 py-2 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 ${
                          errors.examples?.[index]?.value
                            ? 'border-red-300'
                            : 'border-gray-300'
                        }`}
                        placeholder={`Example ${index + 1}`}
                      />
                      {fields.length > 2 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-2 text-gray-400 hover:text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {errors.examples?.[index]?.value && (
                      <p className="text-xs text-red-600">
                        {errors.examples?.[index]?.value?.message}
                      </p>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddExample}
                  className="flex items-center w-full py-2 text-sm text-gray-600 hover:text-gray-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Example
                </button>
              </div>
            )}

            {errors.examples && (
              <p className="mt-1 text-xs text-red-600">
                {errors.examples.message}
              </p>
            )}
          </div>
        </Accordion>
      </div>

      {/* Used in Agents Accordion */}
      <div className="mt-2">
        <Accordion
          title="Used in the Following Agents"
          isOpen={isAgentsAccordionOpen}
          onToggle={() => setIsAgentsAccordionOpen(!isAgentsAccordionOpen)}
          isButtonAccordion={true}
          titleClass="text-sm font-medium text-gray-700"
          arrowColor="text-gray-500">
          <div className="card card-body mt-4 text-center">
            <div className="text-gray-500 text-sm">Not used in any agent</div>
            <div className="text-xs text-gray-400 mt-1">
              You can add this action in the Agent settings
            </div>
          </div>
        </Accordion>
      </div>
    </form>
  )

  const footer = (
    <div className="flex justify-between">
      {/* Left side - Delete button (only in edit mode) */}
      <div>
        {initialData?.isEditing && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn btn-md btn-outline-red mr-3 flex items-center gap-2">
            Delete
            {isDeleting && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-300 border-t-red-400"></div>
            )}
          </button>
        )}
      </div>

      {/* Right side - Cancel and Save buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleCancel}
          className="btn btn-md btn-gray">
          Cancel
        </button>
        <button
          type="submit"
          form="open-question-form"
          disabled={!isValid}
          className={`btn btn-md ${
            isValid
              ? 'btn-primary'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300'
          }`}
          onClick={() =>
            console.log(
              'Save button clicked - isValid:',
              isValid,
              'errors:',
              errors
            )
          }>
          Save
        </button>
      </div>
    </div>
  )

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Open Question"
      position="right"
      size="large"
      content={content}
      footerClass="justify-end"
      footer={footer}
    />
  )
}

export default DrawerOpenQuestion
