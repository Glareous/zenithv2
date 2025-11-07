'use client'

import React, { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@src/components/custom/modal/modal'
import type { WorkflowObjection } from '@src/server/api/routers/projectAgentWorkflow'
import { Info } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

const objectionFormSchema = z.object({
  case: z
    .string()
    .min(1, 'Case is required')
    .max(200, 'Case must be 200 characters or less'),
  instructions: z
    .string()
    .min(1, 'Instructions are required')
    .max(1000, 'Instructions must be 1000 characters or less'),
})

type ObjectionFormData = z.infer<typeof objectionFormSchema>

interface DialogAddObjectionProps {
  isOpen: boolean
  onClose: () => void
  onAddObjection: (objection: WorkflowObjection) => void
}

const DialogAddObjection: React.FC<DialogAddObjectionProps> = ({
  isOpen,
  onClose,
  onAddObjection,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ObjectionFormData>({
    resolver: zodResolver(objectionFormSchema),
    defaultValues: {
      case: '',
      instructions: '',
    },
  })

  const onSubmit = async (data: ObjectionFormData) => {
    setIsSubmitting(true)
    try {
      const newObjection: WorkflowObjection = {
        id: `objection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        case: data.case,
        instructions: data.instructions,
      }

      onAddObjection(newObjection)
      toast.success('Case added successfully')
      reset()
      onClose()
    } catch (error) {
      console.error('Failed to add case:', error)
      toast.error('Failed to add case. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      reset()
      onClose()
    }
  }

  const content = (
    <div className="space-y-4">
      {/* Informational Banner */}
      <div className="flex items-start p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex-shrink-0">
          <Info className="w-5 h-5 text-blue-500 mt-0.5" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-blue-800">
            Add instructions on how the{' '}
            <span className="font-medium">Assistant</span> should handle special
            cases.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Case Field */}
        <div>
          <label
            htmlFor="case"
            className="block text-sm font-medium text-gray-700 mb-2">
            Case
          </label>
          <input
            {...register('case')}
            type="text"
            id="case"
            placeholder="The user asks if your are an AI"
            disabled={isSubmitting}
            className={`
              w-full px-3 py-2 text-sm border rounded-md transition-colors duration-200
              ${
                errors.case
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-purple-300 focus:border-purple-500 focus:ring-purple-500'
              }
              ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-400'}
              focus:outline-none focus:ring-2 focus:ring-opacity-50
            `}
          />
          {errors.case && (
            <p className="mt-1 text-xs text-red-600">{errors.case.message}</p>
          )}
        </div>

        {/* Instructions Field */}
        <div>
          <label
            htmlFor="instructions"
            className="block text-sm font-medium text-gray-700 mb-2">
            Instructions
          </label>
          <textarea
            {...register('instructions')}
            id="instructions"
            rows={5}
            placeholder="Confirm and point out the advantages..."
            disabled={isSubmitting}
            className={`
              w-full px-3 py-2 text-sm border rounded-md transition-colors duration-200 resize-none
              ${
                errors.instructions
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
              }
              ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
              focus:outline-none focus:ring-2 focus:ring-opacity-50
            `}
          />
          {errors.instructions && (
            <p className="mt-1 text-xs text-red-600">
              {errors.instructions.message}
            </p>
          )}
        </div>
      </form>
    </div>
  )

  const footer = (
    <div className="flex justify-end space-x-3">
      <button
        onClick={handleClose}
        type="button"
        disabled={isSubmitting}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
        Cancel
      </button>
      <button
        onClick={handleSubmit(onSubmit)}
        type="submit"
        disabled={!isDirty || isSubmitting}
        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
        {isSubmitting ? 'Adding...' : 'Add Case'}
      </button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Case"
      size="modal-md"
      position="modal-center"
      content={content}
      footer={footer}
    />
  )
}

export default DialogAddObjection
