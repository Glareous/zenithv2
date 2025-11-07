'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown, ChevronUp, Expand, Plus, Trash2 } from 'lucide-react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

import { Drawer } from '@/components/custom/drawer/drawer'
import { Modal } from '@/components/custom/modal/modal'
import {
  RichTextEditor,
  type RichTextEditorRef,
} from '@/components/molecules/RichTextEditor'
import DialogAddAction from '@/components/organisms/DialogAddAction'
import DialogAddFaq from '@/components/organisms/DialogAddFaq'
import DialogAddObjection from '@/components/organisms/DialogAddObjection'
import {
  type WorkflowAction,
  type WorkflowFaq,
  type WorkflowObjection,
  useWorkflow,
} from '@/contexts/WorkflowContext'
import { transformTipTapToText } from '@/utils/tiptapTransform'

const stepFormSchema = z.object({
  label: z.string().min(1, 'Step name is required'),
  instructions: z.string().optional(),
  instructionsDetailed: z.string().optional(),
})

type StepFormData = z.infer<typeof stepFormSchema>

interface DrawerBranchStepProps {
  isOpen: boolean
  onClose: () => void
  nodeId?: string
}

const DrawerBranchStep: React.FC<DrawerBranchStepProps> = ({
  isOpen,
  onClose,
  nodeId,
}) => {
  const {
    layout,
    actions,
    updateNode,
    addFaqToNode,
    addObjectionToNode,
    addActionsToNode,
    removeFaqFromNode,
    removeObjectionFromNode,
    removeActionFromNode,
  } = useWorkflow()

  const currentNode = layout.nodes.find((node) => node.id === nodeId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const richTextEditorRef = useRef<RichTextEditorRef>(null)
  const expandedEditorRef = useRef<RichTextEditorRef>(null)

  const nodeActions = (currentNode?.data as any)?.actions || []

  const availableActions = actions

  const [showAddFaqDialog, setShowAddFaqDialog] = useState(false)
  const [showAddActionDialog, setShowAddActionDialog] = useState(false)
  const [showAddObjectionDialog, setShowAddObjectionDialog] = useState(false)
  const [isEditorExpanded, setIsEditorExpanded] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(stepFormSchema),
    defaultValues: {
      label: '',
      instructions: '',
      instructionsDetailed: '',
    },
  })

  const handleRemoveAction = (actionId: string) => {
    if (!nodeId) return
    if (richTextEditorRef.current) {
      richTextEditorRef.current.removeAllMentionsByActionId(actionId)
    }
    removeActionFromNode(nodeId, actionId)
  }

  const handleRemoveFaq = (faqId: string) => {
    if (!nodeId) return
    removeFaqFromNode(nodeId, faqId)
  }

  const handleRemoveObjection = (objectionId: string) => {
    if (!nodeId) return
    removeObjectionFromNode(nodeId, objectionId)
  }

  const watchedInstructions = watch('instructions')

  const selectedActionsForEditor = useMemo(() => {
    const nodeActionIds = nodeActions.map((action: any) => action.id)
    const fullActions = availableActions.filter((action) =>
      nodeActionIds.includes(action.id)
    )

    return fullActions
  }, [nodeActions, availableActions])

  useEffect(() => {
    if (currentNode && currentNode.data) {
      reset({
        label: (currentNode.data as any).label || '',
        instructions:
          typeof (currentNode.data as any).instructions === 'string'
            ? (currentNode.data as any).instructions
            : '',
        instructionsDetailed:
          (currentNode.data as any).instructionsDetailed || '',
      })
    }
  }, [currentNode, reset])

  const onSubmit = async (data: any) => {
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
      const updateData = {
        data: {
          ...(currentNode?.data as any),
          label: data.label,
          instructions: data.instructions,
          instructionsDetailed: data.instructionsDetailed,
          hasInstructions: Boolean(data.instructions?.trim()),
        },
      }

      updateNode(nodeId, updateData)

      toast.success('Step updated successfully')
      onClose()
    } catch (error) {
      toast.error('Failed to update step. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddAction = () => {
    setShowAddActionDialog(true)
  }

  const handleAddFaq = () => {
    setShowAddFaqDialog(true)
  }

  const handleAddObjection = () => {
    setShowAddObjectionDialog(true)
  }

  const handleFaqAdded = (faq: WorkflowFaq) => {
    if (!nodeId) return
    addFaqToNode(nodeId, faq)
  }

  const handleActionsAdded = (newActions: any[]) => {
    if (!nodeId) return

    const mappedActions: WorkflowAction[] = newActions.map((action: any) => ({
      id: action.id,
      name: action.name,
      description: action.description || '',
    }))
    addActionsToNode(nodeId, mappedActions)
  }

  const handleObjectionAdded = (objection: WorkflowObjection) => {
    if (!nodeId) return
    addObjectionToNode(nodeId, objection)
  }

  const handleInstructionsChange = (content: string, fromExpanded = false) => {
    setValue('instructions', content, { shouldDirty: true })

    try {
      const jsonContent = JSON.parse(content)

      const detailedText = transformTipTapToText(jsonContent)

      setValue('instructionsDetailed', detailedText, { shouldDirty: true })
    } catch (error) {
      setValue('instructionsDetailed', '', { shouldDirty: true })
    }

    if (fromExpanded && richTextEditorRef.current?.editor) {
      try {
        const parsedContent = JSON.parse(content)
        richTextEditorRef.current.editor.commands.setContent(parsedContent)
      } catch (error) {
        richTextEditorRef.current.editor.commands.setContent(content)
      }
    } else if (
      !fromExpanded &&
      expandedEditorRef.current?.editor &&
      isEditorExpanded
    ) {
      try {
        const parsedContent = JSON.parse(content)
        expandedEditorRef.current.editor.commands.setContent(parsedContent)
      } catch (error) {
        expandedEditorRef.current.editor.commands.setContent(content)
      }
    }
  }

  const drawerContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 ">
      {/* Step Name */}
      <div className="space-y-2">
        <label
          htmlFor="branchname"
          className="block text-sm font-medium text-gray-700">
          Branch Name
        </label>
        <input
          id="branchname"
          type="text"
          {...register('label')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Enter Step Name"
        />
        {errors.label && (
          <p className="text-sm text-red-600">{errors.label.message}</p>
        )}
      </div>

      {/* Instructions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            When to go here
          </label>
          <button
            type="button"
            onClick={() => setIsEditorExpanded(true)}
            className="translate-y-9 -translate-x-0,5 z-20 btn-xs btn-sub-primary p-1 btn">
            <Expand className="size-5" />
          </button>
        </div>
        <RichTextEditor
          ref={richTextEditorRef}
          content={
            typeof watchedInstructions === 'string' &&
            watchedInstructions.trim() !== ''
              ? watchedInstructions
              : ''
          }
          onUpdate={handleInstructionsChange}
          availableActions={selectedActionsForEditor}
          placeholder="Enter instructions for this step..."
          className="min-h-[120px] border border-gray-300 rounded-md"
        />
        <p className="text-xs text-gray-500">
          Type{' '}
          <span className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-700 font-mono">
            {'{'}
          </span>{' '}
          for variables,{' '}
          <span className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-700 font-mono">
            {'<'}
          </span>{' '}
          for results and{' '}
          <span className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-700 font-mono">
            {'#'}
          </span>{' '}
          for actions
        </p>
      </div>

      {/* Actions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Actions</h3>
        </div>

        {nodeActions.length > 0 ? (
          <div className="space-y-2">
            {nodeActions.map((action: any) => (
              <div
                key={action.id}
                className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full flex items-center justify-center mr-2"></span>
                  <span className="text-sm font-medium">{action.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAction(action.id)}
                  className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="text-center py-2">
              <button
                type="button"
                onClick={handleAddAction}
                className="flex items-center justify-center text-purple-600 hover:text-purple-700 text-sm">
                <Plus className="w-4 h-4 mx-2" />
                Add Action
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 border border-dashed border-gray-300 rounded-lg">
            <button
              type="button"
              onClick={handleAddAction}
              className="flex items-center justify-center text-purple-600 hover:text-purple-700">
              <Plus className="w-4 h-4 mx-2" />
              Add Action
            </button>
          </div>
        )}
      </div>
    </form>
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
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title={
          (currentNode?.data as any)?.label ||
          ((currentNode?.data as any)?.variant === 'branch'
            ? 'New Branch'
            : (currentNode?.data as any)?.variant === 'end'
              ? 'New End Step'
              : (currentNode?.data as any)?.variant === 'jump'
                ? 'New Jump'
                : 'New Step')
        }
        size="large"
        content={drawerContent}
        footer={drawerFooter}
        isSimpleBar={true}
      />

      {/* Dialog Components */}
      <DialogAddFaq
        isOpen={showAddFaqDialog}
        onClose={() => setShowAddFaqDialog(false)}
        onAddFaq={handleFaqAdded}
      />

      <DialogAddAction
        isOpen={showAddActionDialog}
        onClose={() => setShowAddActionDialog(false)}
        onAddActions={handleActionsAdded}
        selectedActionIds={nodeActions.map((action: any) => action.id)}
        availableActions={availableActions}
      />

      <DialogAddObjection
        isOpen={showAddObjectionDialog}
        onClose={() => setShowAddObjectionDialog(false)}
        onAddObjection={handleObjectionAdded}
      />

      {/* Expanded Editor Modal */}
      <Modal
        isOpen={isEditorExpanded}
        onClose={() => setIsEditorExpanded(false)}
        title="When to go here - Expanded View"
        size="modal-lg"
        position="modal-center"
        content={
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Provide clear conditions for when the AI should follow this branch
              path.
            </p>
            <p className="text-xs text-gray-500">
              Type{' '}
              <span className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-700 font-mono">
                {'{'}
              </span>{' '}
              for variables,{' '}
              <span className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-700 font-mono">
                {'<'}
              </span>{' '}
              for results and{' '}
              <span className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-700 font-mono">
                {'#'}
              </span>{' '}
              for actions
            </p>
            <RichTextEditor
              ref={expandedEditorRef}
              content={
                typeof watchedInstructions === 'string' &&
                watchedInstructions.trim() !== ''
                  ? watchedInstructions
                  : ''
              }
              onUpdate={(content) => handleInstructionsChange(content, true)}
              availableActions={selectedActionsForEditor}
              placeholder="Enter conditions for this branch..."
              className="min-h-[300px] border border-gray-300 rounded-md"
            />
          </div>
        }
      />
    </>
  )
}

export default DrawerBranchStep
