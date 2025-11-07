'use client'

import React, { useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

import { Drawer } from '@/components/custom/drawer/drawer'
import { RichTextEditor } from '@/components/molecules/RichTextEditor'
import { useWorkflow } from '@/contexts/WorkflowContext'
import { transformTipTapToText } from '@/utils/tiptapTransform'

const endStepFormSchema = z.object({
  label: z.string().min(1, 'Step name is required'),
  requireUserResponse: z.boolean(),
  instructions: z.string().optional(),
  instructionsDetailed: z.string().optional(),
})

type EndStepFormData = z.infer<typeof endStepFormSchema>

interface DrawerEndStepProps {
  isOpen: boolean
  onClose: () => void
  nodeId?: string
}

const DrawerEndStep: React.FC<DrawerEndStepProps> = ({
  isOpen,
  onClose,
  nodeId,
}) => {
  const { layout, actions, updateNode } = useWorkflow()

  const currentNode = layout.nodes.find((node) => node.id === nodeId)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<EndStepFormData>({
    resolver: zodResolver(endStepFormSchema),
    defaultValues: {
      label: '',
      requireUserResponse: true,
      instructions: '',
      instructionsDetailed: '',
    },
  })

  const watchedInstructions = watch('instructions')

  useEffect(() => {
    if (currentNode) {
      reset({
        label: currentNode.data?.label || '',
        requireUserResponse: currentNode.data?.requireUserResponse ?? true,
        instructions: currentNode.data?.instructions || '',
        instructionsDetailed: currentNode.data?.instructionsDetailed || '',
      })
    }
  }, [currentNode, reset])

  const onSubmit = async (data: EndStepFormData) => {
    if (!nodeId) {
      toast.error('Unable to save: Step ID is missing')
      return
    }

    if (!layout.nodes.find((n) => n.id === nodeId)) {
      toast.error(
        'This step was deleted by another user. Please refresh the page.'
      )
      onClose()
      return
    }

    setIsSubmitting(true)
    try {
      updateNode(nodeId, {
        data: {
          ...(currentNode?.data as any),
          label: data.label,
          requireUserResponse: data.requireUserResponse,
          instructions: data.instructions,
          instructionsDetailed: data.instructionsDetailed,
          hasInstructions: Boolean(data.instructions?.trim()),
        },
      })

      toast.success('End step updated successfully')
      onClose()
    } catch (error) {
      toast.error('Failed to update step. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInstructionsChange = (content: string) => {
    setValue('instructions', content, { shouldDirty: true })

    try {
      const jsonContent = JSON.parse(content)
      const detailedText = transformTipTapToText(jsonContent)
      setValue('instructionsDetailed', detailedText, { shouldDirty: true })
    } catch (error) {
      setValue('instructionsDetailed', '', { shouldDirty: true })
    }
  }

  const drawerContent = (
    <div className="space-y-6">
      {/* Header Description */}
      <div className="text-sm text-gray-600">
        Provide your Assistant with a script to follow for this node, specifying
        what should be said to the recipient.
      </div>

      {/* Require User Response */}
      <div className="flex items-center space-x-2">
        <input
          id="requireUserResponse"
          type="checkbox"
          {...register('requireUserResponse')}
          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
        />
        <label
          htmlFor="requireUserResponse"
          className="text-sm font-medium text-gray-700">
          Require user response
        </label>
      </div>

      {/* Instructions */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Instructions
        </label>
        <RichTextEditor
          content={watchedInstructions || ''}
          onUpdate={handleInstructionsChange}
          availableActions={actions}
          placeholder="Thanks for calling. Have a great day!"
          className="min-h-[160px] border border-purple-300 rounded-md"
        />
      </div>
    </div>
  )

  const drawerFooter = (
    <div className="flex justify-end space-x-3">
      <button
        onClick={onClose}
        type="button"
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
        Cancel
      </button>
      <button
        onClick={handleSubmit(onSubmit)}
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  )

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={currentNode?.data?.label || 'End Step'}
      size="large"
      content={drawerContent}
      footer={drawerFooter}
      isSimpleBar={true}
    />
  )
}

export default DrawerEndStep
