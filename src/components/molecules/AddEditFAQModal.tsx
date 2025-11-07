import React, { useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@src/components/custom/modal/modal'
import { api } from '@src/trpc/react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

const faqSchema = z.object({
  question: z.string().min(1, 'Question is required').max(500),
  answer: z.string().min(1, 'Answer is required').max(2000),
})

type FaqFormValues = z.infer<typeof faqSchema>

interface AddEditFAQModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editFaq?: {
    id: string
    question: string
    answer: string
  } | null
  projectId: string
}

const AddEditFAQModal: React.FC<AddEditFAQModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editFaq,
  projectId,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FaqFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: '',
      answer: '',
    },
  })

  const createFaq = api.projectFaq.create.useMutation({
    onSuccess: () => {
      toast.success('FAQ created successfully')
      reset({
        question: '',
        answer: '',
      })
      onSuccess()
      onClose()
    },
    onError: () => toast.error('Error creating FAQ'),
  })

  const updateFaq = api.projectFaq.update.useMutation({
    onSuccess: () => {
      toast.success('FAQ updated successfully')
      onSuccess()
      onClose()
    },
    onError: () => toast.error('Error updating FAQ'),
  })

  const deleteFaq = api.projectFaq.delete.useMutation({
    onSuccess: () => {
      toast.success('FAQ deleted successfully')
      onSuccess()
      onClose()
    },
    onError: () => toast.error('Error deleting FAQ'),
  })

  useEffect(() => {
    if (editFaq) {
      reset({
        question: editFaq.question,
        answer: editFaq.answer,
      })
    } else {
      reset({
        question: '',
        answer: '',
      })
    }
  }, [editFaq, reset])

  const onSubmit = (data: FaqFormValues) => {
    if (editFaq) {
      updateFaq.mutate({ id: editFaq.id, ...data, projectId })
    } else {
      createFaq.mutate({ ...data, projectId })
    }
  }

  const handleDelete = () => {
    if (editFaq) {
      deleteFaq.mutate({ id: editFaq.id })
    }
  }

  const handleCloseModal = () => {
    onClose()
    reset()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        reset({
          question: '',
          answer: '',
        })
        onClose()
      }}
      title={editFaq ? 'Edit FAQ' : 'Add FAQ'}
      position="modal-center"
      contentClass="modal-content"
      content={() => (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="form-label">Question</label>
            <input
              className="form-input"
              {...register('question')}
              placeholder="Write the question"
            />
            {errors.question && (
              <span className="text-red-500">{errors.question.message}</span>
            )}
          </div>
          <div className="mb-4">
            <label className="form-label">Answer</label>
            <textarea
              className="form-input resize-none "
              rows={4}
              {...register('answer')}
              placeholder="Write the answer"
            />
            {errors.answer && (
              <span className="text-red-500">{errors.answer.message}</span>
            )}
          </div>
          <div className="flex justify-end gap-2">
            {editFaq && (
              <button
                type="button"
                className="btn btn-red"
                onClick={handleDelete}
                disabled={deleteFaq.isPending}>
                Delete
              </button>
            )}
            <button
              type="button"
              className="btn btn-outline-red"
              onClick={onClose}
              disabled={
                isSubmitting || createFaq.isPending || updateFaq.isPending
              }>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                isSubmitting || createFaq.isPending || updateFaq.isPending
              }>
              {isSubmitting || createFaq.isPending || updateFaq.isPending ? (
                <>
                  {editFaq ? 'Updating' : 'Creating'}
                  <span className="ml-2 animate-pulse">...</span>
                </>
              ) : editFaq ? (
                'Update'
              ) : (
                'Create'
              )}
            </button>
          </div>
        </form>
      )}
    />
  )
}

export default AddEditFAQModal
