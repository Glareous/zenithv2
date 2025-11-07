'use client'

import React, { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@src/components/custom/modal/modal'
import type { WorkflowFaq } from '@src/server/api/routers/projectAgentWorkflow'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

const faqFormSchema = z.object({
  question: z
    .string()
    .min(1, 'Question is required')
    .max(200, 'Question must be 200 characters or less'),
  answer: z
    .string()
    .min(1, 'Answer is required')
    .max(1000, 'Answer must be 1000 characters or less'),
})

type FaqFormData = z.infer<typeof faqFormSchema>

interface DialogAddFaqProps {
  isOpen: boolean
  onClose: () => void
  onAddFaq: (faq: WorkflowFaq) => void
}

const DialogAddFaq: React.FC<DialogAddFaqProps> = ({
  isOpen,
  onClose,
  onAddFaq,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FaqFormData>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: {
      question: '',
      answer: '',
    },
  })

  const onSubmit = async (data: FaqFormData) => {
    setIsSubmitting(true)
    try {
      const newFaq: WorkflowFaq = {
        id: `faq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        question: data.question,
        answer: data.answer,
      }

      onAddFaq(newFaq)
      toast.success('FAQ added successfully')
      reset()
      onClose()
    } catch (error) {
      console.error('Failed to add FAQ:', error)
      toast.error('Failed to add FAQ. Please try again.')
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Question Field */}
        <div>
          <label
            htmlFor="question"
            className="block text-sm font-medium text-gray-700 mb-2">
            Question
          </label>
          <input
            {...register('question')}
            type="text"
            id="question"
            placeholder="What is the name of your restaurant?"
            disabled={isSubmitting}
            className={`
              w-full px-3 py-2 text-sm border rounded-md transition-colors duration-200
              ${
                errors.question
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-purple-300 focus:border-purple-500 focus:ring-purple-500'
              }
              ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-400'}
              focus:outline-none focus:ring-2 focus:ring-opacity-50
            `}
          />
          {errors.question && (
            <p className="mt-1 text-xs text-red-600">
              {errors.question.message}
            </p>
          )}
        </div>

        {/* Answer Field */}
        <div>
          <label
            htmlFor="answer"
            className="block text-sm font-medium text-gray-700 mb-2">
            Answer
          </label>
          <textarea
            {...register('answer')}
            id="answer"
            rows={4}
            placeholder="The name of my restaurant is..."
            disabled={isSubmitting}
            className={`
              w-full px-3 py-2 text-sm border rounded-md transition-colors duration-200 resize-none
              ${
                errors.answer
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
              }
              ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
              focus:outline-none focus:ring-2 focus:ring-opacity-50
            `}
          />
          {errors.answer && (
            <p className="mt-1 text-xs text-red-600">{errors.answer.message}</p>
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
        {isSubmitting ? 'Adding...' : 'Add FAQ'}
      </button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add FAQ"
      size="modal-md"
      position="modal-center"
      content={content}
      footer={footer}
    />
  )
}

export default DialogAddFaq
