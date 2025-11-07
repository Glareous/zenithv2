'use client'

import React, { useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { z } from 'zod'

import { Drawer } from '@/components/custom/drawer/drawer'
import { useWorkflow } from '@/contexts/WorkflowContext'

const jumpStepFormSchema = z.object({
  label: z.string().min(1, 'Step name is required'),
  targetNodeId: z.string().optional(),
})

type JumpStepFormData = z.infer<typeof jumpStepFormSchema>

interface DrawerJumpStepProps {
  isOpen: boolean
  onClose: () => void
  nodeId?: string
}

const DrawerJumpStep: React.FC<DrawerJumpStepProps> = ({
  isOpen,
  onClose,
  nodeId,
}) => {
  const { layout, updateNode, setJumpTarget } = useWorkflow()

  const currentNode = layout.nodes.find((node) => node.id === nodeId)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<JumpStepFormData>({
    resolver: zodResolver(jumpStepFormSchema),
    defaultValues: {
      label: '',
      targetNodeId: '',
    },
  })

  const watchedTargetNodeId = watch('targetNodeId')

  const availableNodes =
    layout.nodes.filter(
      (node) => node.id !== nodeId && node.data?.variant !== 'end'
    ) || []

  const nodesByVariant = {
    branch: availableNodes.filter((node) => node.data?.variant === 'branch'),
    default: availableNodes.filter((node) => node.data?.variant === 'default'),
  }

  useEffect(() => {
    if (currentNode) {
      reset({
        label: currentNode.data?.label || '',
        targetNodeId: currentNode.data?.targetNodeId || '',
      })
    }
  }, [currentNode, reset])

  const onSubmit = async (data: JumpStepFormData) => {
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
          targetNodeId: data.targetNodeId,
        },
      })

      if (data.targetNodeId) {
        setJumpTarget(nodeId, data.targetNodeId)
      }

      toast.success('Jump step updated successfully')
      onClose()
    } catch (error) {
      toast.error('Failed to update step. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNodeSelect = (targetId: string) => {
    setValue('targetNodeId', targetId, { shouldDirty: true })
    setDropdownOpen(false)
  }

  const getSelectedNodeLabel = () => {
    if (!watchedTargetNodeId) return 'Select'
    const selectedNode = availableNodes.find(
      (node) => node.id === watchedTargetNodeId
    )
    return selectedNode ? selectedNode.data?.label || 'Select' : 'Select'
  }

  const drawerContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Branch or Step Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Branch or Step
        </label>

        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 flex items-center justify-between">
            <span
              className={
                watchedTargetNodeId ? 'text-gray-900' : 'text-gray-500'
              }>
              {getSelectedNodeLabel()}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {/* Branch Nodes */}
              {nodesByVariant.branch.length > 0 && (
                <>
                  {nodesByVariant.branch.map((node) => (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => handleNodeSelect(node.id)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center">
                      <span className="font-medium text-gray-900 mr-2">
                        Branch:
                      </span>
                      <span className="text-purple-600">
                        {node.data?.label}
                      </span>
                    </button>
                  ))}
                </>
              )}

              {/* Step Nodes */}
              {nodesByVariant.default.length > 0 && (
                <>
                  {nodesByVariant.default.map((node) => (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => handleNodeSelect(node.id)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center">
                      <span className="font-medium text-gray-900 mr-2">
                        Step:
                      </span>
                      <span className="text-purple-600">
                        {node.data?.label}
                      </span>
                    </button>
                  ))}
                </>
              )}

              {availableNodes.length === 0 && (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  No available nodes to jump to
                </div>
              )}
            </div>
          )}
        </div>

        {errors.targetNodeId && (
          <p className="text-sm text-red-600">{errors.targetNodeId.message}</p>
        )}
      </div>

      {/* Hidden input for targetNodeId */}
      <input type="hidden" {...register('targetNodeId')} />
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
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Jump To"
      size="medium"
      content={drawerContent}
      footer={drawerFooter}
      isSimpleBar={true}
    />
  )
}

export default DrawerJumpStep
