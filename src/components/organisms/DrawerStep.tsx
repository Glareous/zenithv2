'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Expand, Plus, Trash2 } from 'lucide-react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { z } from 'zod'

import Accordion from '@/components/custom/accordion/accordion'
import { Drawer } from '@/components/custom/drawer/drawer'
import { Modal } from '@/components/custom/modal/modal'
import {
  RichTextEditor,
  type RichTextEditorRef,
} from '@/components/molecules/RichTextEditor'
import DialogAddAction from '@/components/organisms/DialogAddAction'
import DialogAddFaq from '@/components/organisms/DialogAddFaq'
import DialogAddObjection from '@/components/organisms/DialogAddObjection'
import DialogAddProduct from '@/components/organisms/DialogAddProduct'
import DialogAddService from '@/components/organisms/DialogAddService'
import {
  type WorkflowAction,
  type WorkflowFaq,
  type WorkflowObjection,
  type WorkflowProduct,
  type WorkflowService,
  useWorkflow,
} from '@/contexts/WorkflowContext'
import { RootState } from '@/slices/reducer'
import { transformTipTapToText } from '@/utils/tiptapTransform'

const stepFormSchema = z.object({
  label: z.string().min(1, 'Step name is required'),
  requireUserResponse: z.boolean().default(true),
  instructions: z.string().optional(),
  instructionsDetailed: z.string().optional(),
})

type StepFormData = z.infer<typeof stepFormSchema>

interface DrawerStepProps {
  isOpen: boolean
  onClose: () => void
  nodeId?: string
}

const DrawerStep: React.FC<DrawerStepProps> = ({ isOpen, onClose, nodeId }) => {
  const {
    layout,
    actions,
    updateNode,
    addFaqToNode,
    addObjectionToNode,
    addActionsToNode,
    addProductToNode,
    addServiceToNode,
    removeFaqFromNode,
    removeObjectionFromNode,
    removeActionFromNode,
    removeProductFromNode,
    removeServiceFromNode,
  } = useWorkflow()

  const { currentProject } = useSelector((state: RootState) => state.Project)

  const currentNode = layout.nodes.find((node) => node.id === nodeId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const richTextEditorRef = useRef<RichTextEditorRef>(null)
  const expandedEditorRef = useRef<RichTextEditorRef>(null)

  const nodeActions = (currentNode?.data as any)?.actions || []
  const nodeProducts = (currentNode?.data as any)?.products || []
  const nodeServices = (currentNode?.data as any)?.services || []

  const availableActions = actions

  const [showAddFaqDialog, setShowAddFaqDialog] = useState(false)
  const [showAddActionDialog, setShowAddActionDialog] = useState(false)
  const [showAddObjectionDialog, setShowAddObjectionDialog] = useState(false)
  const [showAddProductDialog, setShowAddProductDialog] = useState(false)
  const [showAddServiceDialog, setShowAddServiceDialog] = useState(false)

  const [isFaqOpen, setIsFaqOpen] = useState(false)
  const [isObjectionOpen, setIsObjectionOpen] = useState(false)
  const [isProductOpen, setIsProductOpen] = useState(false)
  const [isServiceOpen, setIsServiceOpen] = useState(false)
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
      requireUserResponse: true,
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
        requireUserResponse:
          (currentNode.data as any).requireUserResponse ?? true,
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
          requireUserResponse: data.requireUserResponse,
          instructions: data.instructions || '',
          instructionsDetailed: data.instructionsDetailed || '',
          hasInstructions: Boolean(data.instructions?.trim()),
        },
      }

      await updateNode(nodeId, updateData)

      reset({
        label: data.label,
        requireUserResponse: data.requireUserResponse,
        instructions: data.instructions || '',
        instructionsDetailed: data.instructionsDetailed || '',
      })

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

  const handleAddProduct = () => {
    setShowAddProductDialog(true)
  }

  const handleAddService = () => {
    setShowAddServiceDialog(true)
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

  const handleProductsAdded = (products: WorkflowProduct[]) => {
    if (!nodeId) return
    addProductToNode(nodeId, products)
  }

  const handleServicesAdded = (services: WorkflowService[]) => {
    if (!nodeId) return
    addServiceToNode(nodeId, services)
  }

  const handleRemoveProduct = (productId: string) => {
    if (!nodeId) return
    removeProductFromNode(nodeId, productId)
  }

  const handleRemoveService = (serviceId: string) => {
    if (!nodeId) return
    removeServiceFromNode(nodeId, serviceId)
  }

  const handleInstructionsChange = (content: string, fromExpanded = false) => {
    setValue('instructions', content, { shouldDirty: true, shouldTouch: true })

    try {
      const jsonContent = JSON.parse(content)

      const detailedText = transformTipTapToText(jsonContent)

      setValue('instructionsDetailed', detailedText, {
        shouldDirty: true,
        shouldTouch: true,
      })
    } catch (error) {
      setValue('instructionsDetailed', '', {
        shouldDirty: true,
        shouldTouch: true,
      })
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
          htmlFor="stepName"
          className="block text-sm font-medium text-gray-700">
          Step Name
        </label>
        <input
          id="stepName"
          type="text"
          {...register('label')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Enter Step Name"
        />
        {errors.label && (
          <p className="text-sm text-red-600">{errors.label.message}</p>
        )}
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
        <p className="text-xs text-gray-500">
          Provide clear and detailed instructions on how the AI Assistant should
          behave during this step.
        </p>
        <div className="flex items-center justify-between mb-2">
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
              : (currentNode?.data as any)?.instructions || ''
          }
          onUpdate={handleInstructionsChange}
          availableActions={selectedActionsForEditor}
          placeholder="Enter instructions for this step..."
          className="min-h-[120px] border border-gray-300 rounded-md pr-6!"
        />
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

      {/* FAQ Section */}
      <div className="space-y-3">
        <Accordion
          title="FAQ"
          isOpen={isFaqOpen}
          onToggle={() => setIsFaqOpen(!isFaqOpen)}
          isButtonAccordion={true}
          icon={
            <span className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center text-xs">
              ?
            </span>
          }
          iconPosition="left">
          <div className="space-y-5">
            <p className="text-xs text-gray-500">
              Add common Q&A here for quick AI responses during calls. For
              complex branching, build it directly in the editor.
            </p>

            {((currentNode?.data as any)?.faqs || []).length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {((currentNode?.data as any)?.faqs || []).map((faq: any) => (
                  <div
                    key={faq.id}
                    className="border border-gray-200 rounded-lg p-3 space-y-2 mr-6">
                    <div className="text-sm font-medium text-gray-900">
                      {faq.question}
                    </div>
                    <div className="text-sm text-gray-700">{faq.answer}</div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFaq(faq.id)}
                      className="text-red-500 hover:text-red-700 text-xs">
                      Remove FAQ
                    </button>
                  </div>
                ))}
                <div className="text-center py-2">
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="flex items-center justify-center text-purple-600 hover:text-purple-700 text-sm">
                    <Plus className="w-4 h-4 mx-2" />
                    Add FAQ
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 border border-dashed border-gray-300 rounded-lg mb-2">
                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="flex items-center justify-center text-purple-600 hover:text-purple-700 text-sm">
                  <Plus className="w-4 h-4 mx-2" />
                  Add FAQ
                </button>
              </div>
            )}
          </div>
        </Accordion>
      </div>

      {/* Objections & Special Cases Section */}
      <div className="space-y-3">
        <Accordion
          title="Objections & Special Cases"
          isOpen={isObjectionOpen}
          onToggle={() => setIsObjectionOpen(!isObjectionOpen)}
          isButtonAccordion={true}
          icon={
            <span className="w-4 h-4 bg-orange-100 rounded-full flex items-center justify-center text-xs">
              !
            </span>
          }
          iconPosition="left">
          <div className=" space-y-5">
            <p className="text-xs text-gray-500">
              Set up responses for your AI Voice Assistant to handle common
              objections or user objections.
            </p>

            {((currentNode?.data as any)?.objections || []).length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {((currentNode?.data as any)?.objections || []).map(
                  (objection: any) => (
                    <div
                      key={objection.id}
                      className="border border-gray-200 rounded-lg p-3 space-y-2 mr-6">
                      <div className="text-sm font-medium text-gray-900">
                        {objection.case}
                      </div>
                      <div className="text-sm text-gray-700">
                        {objection.instructions}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveObjection(objection.id)}
                        className="text-red-500 hover:text-red-700 text-xs">
                        Remove Objection
                      </button>
                    </div>
                  )
                )}
                <div className="text-center py-2">
                  <button
                    type="button"
                    onClick={handleAddObjection}
                    className="flex items-center justify-center text-purple-600 hover:text-purple-700 text-sm">
                    <Plus className="w-4 h-4 mx-2" />
                    Add Case
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 border border-dashed border-gray-300 rounded-lg mb-2">
                <button
                  type="button"
                  onClick={handleAddObjection}
                  className="flex items-center justify-center text-purple-600 hover:text-purple-700 text-sm">
                  <Plus className="w-4 h-4 mx-2" />
                  Add Case
                </button>
              </div>
            )}
          </div>
        </Accordion>
      </div>

      {/* Products Section */}
      <div className="space-y-3">
        <Accordion
          title="Products"
          isOpen={isProductOpen}
          onToggle={() => setIsProductOpen(!isProductOpen)}
          isButtonAccordion={true}
          icon={
            <span className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center text-xs">
              📦
            </span>
          }
          iconPosition="left">
          <div className="space-y-5">
            <p className="text-xs text-gray-500">
              Add products from your project that the agent can reference during
              this step.
            </p>

            {nodeProducts.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {nodeProducts.map((product: any) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg p-3 space-y-2 mr-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900 max-w-26 truncate">
                        {product.name}
                      </div>
                      {product.categories && product.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 max-w-26 justify-center">
                          {product.categories.map((cat: any, idx: number) => (
                            <span
                              key={idx}
                              className="items-center px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800 truncate">
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}
                      {product.price !== null &&
                        product.price !== undefined && (
                          <span className="text-sm font-medium text-green-600 w-14 text-right truncate">
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(product.id)}
                      className="text-red-500 hover:text-red-700 text-xs">
                      Remove Product
                    </button>
                  </div>
                ))}
                <div className="text-center py-2">
                  <button
                    type="button"
                    onClick={handleAddProduct}
                    className="flex items-center justify-center text-purple-600 hover:text-purple-700 text-sm">
                    <Plus className="w-4 h-4 mx-2" />
                    Add Product
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 border border-dashed border-gray-300 rounded-lg mb-2">
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="flex items-center justify-center text-purple-600 hover:text-purple-700 text-sm">
                  <Plus className="w-4 h-4 mx-2" />
                  Add Product
                </button>
              </div>
            )}
          </div>
        </Accordion>
      </div>

      {/* Services Section */}
      <div className="space-y-3">
        <Accordion
          title="Services"
          isOpen={isServiceOpen}
          onToggle={() => setIsServiceOpen(!isServiceOpen)}
          isButtonAccordion={true}
          icon={
            <span className="w-4 h-4 bg-orange-100 rounded-full flex items-center justify-center text-xs">
              🔧
            </span>
          }
          iconPosition="left">
          <div className="space-y-5">
            <p className="text-xs text-gray-500">
              Add services from your project that the agent can reference during
              this step.
            </p>

            {nodeServices.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {nodeServices.map((service: any) => (
                  <div
                    key={service.id}
                    className="border border-gray-200 rounded-lg p-3 space-y-2 mr-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900 max-w-26 truncate">
                        {service.name}
                      </div>
                      {service.categories && service.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 max-w-26 justify-center">
                          {service.categories.map((cat: any, idx: number) => (
                            <span
                              key={idx}
                              className="items-center px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800 truncate">
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}
                      {service.price !== null &&
                        service.price !== undefined && (
                          <span className="text-sm font-medium text-green-600 w-14 text-right truncate">
                            ${service.price.toFixed(2)}
                          </span>
                        )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveService(service.id)}
                      className="text-red-500 hover:text-red-700 text-xs">
                      Remove Service
                    </button>
                  </div>
                ))}
                <div className="text-center py-2">
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="flex items-center justify-center text-purple-600 hover:text-purple-700 text-sm">
                    <Plus className="w-4 h-4 mx-2" />
                    Add Service
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 border border-dashed border-gray-300 rounded-lg mb-2">
                <button
                  type="button"
                  onClick={handleAddService}
                  className="flex items-center justify-center text-purple-600 hover:text-purple-700 text-sm">
                  <Plus className="w-4 h-4 mx-2" />
                  Add Service
                </button>
              </div>
            )}
          </div>
        </Accordion>
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

      <DialogAddProduct
        isOpen={showAddProductDialog}
        onClose={() => setShowAddProductDialog(false)}
        onAddProducts={handleProductsAdded}
        selectedProductIds={nodeProducts.map((product: any) => product.id)}
        projectId={currentProject?.id || ''}
      />

      <DialogAddService
        isOpen={showAddServiceDialog}
        onClose={() => setShowAddServiceDialog(false)}
        onAddServices={handleServicesAdded}
        selectedServiceIds={nodeServices.map((service: any) => service.id)}
        projectId={currentProject?.id || ''}
      />

      {/* Expanded Editor Modal */}
      <Modal
        isOpen={isEditorExpanded}
        onClose={() => setIsEditorExpanded(false)}
        title="Instructions - Expanded View"
        size="modal-lg"
        position="modal-center"
        content={
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Provide clear and detailed instructions on how the AI Assistant
              should behave during this step.
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
                  : (currentNode?.data as any)?.instructions || ''
              }
              onUpdate={(content) => handleInstructionsChange(content, true)}
              availableActions={selectedActionsForEditor}
              placeholder="Enter instructions for this step..."
              className="min-h-[300px] border border-gray-300 rounded-md"
            />
          </div>
        }
      />
    </>
  )
}

export default DrawerStep
