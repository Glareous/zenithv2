'use client'

import React, { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import Accordion from '@/components/custom/accordion/accordion'
import { Drawer } from '@/components/custom/drawer/drawer'

const yesNoQuestionSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Identifier is required')
    .regex(/^[a-z_]+$/, 'Only lowercase letters and underscores are allowed'),
  question: z.string().min(1, 'Question is required'),
})

type YesNoQuestionFormData = z.infer<typeof yesNoQuestionSchema>

interface DrawerYesNoQuestionProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: YesNoQuestionFormData) => void
  onDelete?: () => void
  initialData?: {
    identifier?: string
    prompt?: string
    isEditing?: boolean
  }
}

const DrawerYesNoQuestion: React.FC<DrawerYesNoQuestionProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
}) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<YesNoQuestionFormData>({
    resolver: zodResolver(yesNoQuestionSchema),
    mode: 'onChange',
    defaultValues: {
      identifier: initialData?.identifier || '',
      question: initialData?.prompt || '',
    },
  })

  const onSubmit = (data: YesNoQuestionFormData) => {
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

  React.useEffect(() => {
    if (isOpen && initialData) {
      reset({
        identifier: initialData.identifier || '',
        question: initialData.prompt || '',
      })
    }
  }, [isOpen, initialData, reset])

  const content = (
    <form
      id="yes-no-question-form"
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

      {/* Accordion Section */}
      <div className="mt-2">
        <Accordion
          title="Used in the Following Agents"
          isOpen={isAccordionOpen}
          onToggle={() => setIsAccordionOpen(!isAccordionOpen)}
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
          form="yes-no-question-form"
          disabled={!isValid}
          className={`btn btn-md ${
            isValid
              ? 'btn-primary'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300'
          }`}>
          Save
        </button>
      </div>
    </div>
  )

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Yes/No Question"
      position="right"
      size="large"
      content={content}
      footerClass="justify-end"
      footer={footer}
    />
  )
}

export default DrawerYesNoQuestion
