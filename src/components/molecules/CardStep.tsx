'use client'

import React from 'react'

import { useWorkflow } from '@src/contexts/WorkflowContext'
import type {
  NodeVariant,
  WorkflowAction,
  WorkflowFaq,
  WorkflowObjection,
} from '@src/server/api/routers/projectAgentWorkflow'
import { Handle, Position } from '@xyflow/react'
import {
  ArrowRight,
  Menu,
  Plus,
  RotateCcw,
  Scissors,
  Trash2,
} from 'lucide-react'

import DropdownStep from './DropdownStep'

export interface CardStepProps {
  id: string
  data: {
    variant: NodeVariant
    label: string
    instructions?: string
    instructionsDetailed?: string
    hasInstructions?: boolean
    targetNodeId?: string
    branches?: Array<{
      id: string
      label: string
      condition?: string
    }>
    actions?: WorkflowAction[]
    faqs?: WorkflowFaq[]
    objections?: WorkflowObjection[]
    onDeleteRequest?: (nodeId: string, nodeLabel: string) => void
    canManageAgents?: boolean
  }
  selected?: boolean
  dragging?: boolean
  onDoubleClick?: (nodeId: string) => void
  onDeleteRequest?: (nodeId: string, nodeLabel: string) => void
  canManageAgents?: boolean
}

const CardStep: React.FC<CardStepProps> = ({
  id,
  data,
  selected,
  dragging,
  onDoubleClick,
  onDeleteRequest,
  canManageAgents = true,
}) => {
  const [isCardHovered, setIsCardHovered] = React.useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const { deleteNode, layout } = useWorkflow()

  // Use canManageAgents from props or data
  const hasPermission = canManageAgents ?? data.canManageAgents ?? true

  // Check if this node is at the end of the workflow (has no children)
  const isEndOfWorkflow = React.useMemo(() => {
    return !layout.edges.some((edge) => edge.source === id)
  }, [layout.edges, id])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const handleDeleteNode = () => {
    setIsDropdownOpen(false) // Cerrar el dropdown
    if (onDeleteRequest || data.onDeleteRequest) {
      // Usar la prop onDeleteRequest del componente o de data
      const deleteFunction = onDeleteRequest || data.onDeleteRequest
      if (deleteFunction) {
        deleteFunction(id, data.label)
      }
    } else {
      // Fallback al método anterior si no hay prop
      if (confirm(`Are you sure you want to delete "${data.label}"?`)) {
        deleteNode(id)
      }
    }
  }

  const handleDoubleClick = () => {
    console.log('🖱️ CardStep handleDoubleClick called for id:', id)
    if (onDoubleClick) {
      console.log('🖱️ Calling onDoubleClick prop')
      onDoubleClick(id)
    } else {
      console.log('🚫 onDoubleClick prop is not provided')
    }
  }

  const getVariantIcon = () => {
    switch (data.variant) {
      case 'end':
        return <Scissors className="w-4 h-4 text-red-500" />
      case 'jump':
        return <RotateCcw className="w-4 h-4 text-blue-500" />
      case 'branch':
        return <ArrowRight className="w-4 h-4 text-purple-500" />
      default:
        return <Menu className="w-4 h-4 text-purple-500" />
    }
  }

  const getVariantColor = () => {
    switch (data.variant) {
      case 'end':
        return 'border-red-200 bg-red-50'
      case 'jump':
        return 'border-blue-200 bg-blue-50'
      case 'branch':
        return 'border-purple-200 bg-green-100'
      default:
        return 'border-purple-200 bg-purple-50'
    }
  }

  const hasContent =
    (data.actions?.length || 0) > 0 ||
    (data.faqs?.length || 0) > 0 ||
    (data.objections?.length || 0) > 0

  return (
    <div
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
      onDoubleClick={handleDoubleClick}
      className={`
        group relative w-[280px] min-h-[100px] max-h-[170px] bg-white border-2 rounded-lg shadow-sm cursor-pointer transition-all duration-200
        ${selected ? 'border-blue-400 shadow-md' : 'border-gray-200 hover:border-gray-300'}
        ${dragging ? 'shadow-lg opacity-75' : ''}
        hover:shadow-md hover:cursor-pointer
        flex flex-col
      `}>
      {/* Connection Handles */}
      {/* Target handle (all nodes can receive connections) */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400 border-2 border-white hover:bg-gray-500 transition-colors duration-200"
      />

      {/* Source handles - single handle for all variants */}
      {data.variant !== 'end' && (
        <Handle
          type="source"
          position={data.variant === 'jump' ? Position.Right : Position.Bottom}
          className={`w-3 h-3 border-2 border-white transition-colors duration-200 ${
            data.variant === 'branch'
              ? 'bg-purple-400 hover:bg-purple-600'
              : 'bg-gray-400 hover:bg-gray-500'
          }`}
        />
      )}

      {/* Delete Button - Shows on hover */}
      {hasPermission && (
        <div
          className={`
          absolute -top-2 -right-2 z-20 transition-all duration-200 ease-in-out
          ${isCardHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}
        `}>
          <button
            onClick={handleDeleteNode}
            className="
            flex items-center justify-center w-6 h-6
            bg-white/90 backdrop-blur-sm border border-red-200 rounded-full shadow-sm
            text-red-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50/90
            hover:shadow-md hover:scale-105 active:scale-95
            transition-all duration-150 cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1
          "
            title={`Delete "${data.label}"`}
            aria-label={`Delete step ${data.label}`}>
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div
        className={`flex items-center p-3 border-b border-gray-100 ${getVariantColor()}`}>
        <div className="flex items-center space-x-2 flex-1">
          {getVariantIcon()}
          <span className="font-medium text-gray-900">{data.label}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2 flex-1 min-h-0 overflow-hidden">
        {/* Instructions Section */}
        {(() => {
          return null
        })()}
        {data.hasInstructions &&
        (data.instructionsDetailed || data.instructions) ? (
          <div className="text-sm text-gray-700">
            <div className="line-clamp-2 overflow-hidden text-ellipsis">
              {/* Since instructionsDetailed is not being passed, let's transform the JSON here */}
              {(() => {
                const instructionsDetailed = (data as any).instructionsDetailed
                if (instructionsDetailed) {
                  return instructionsDetailed
                }

                // Transform JSON to readable JSX with styled mentions
                if (
                  typeof data.instructions === 'string' &&
                  data.instructions.trim()
                ) {
                  if (data.instructions.startsWith('{')) {
                    try {
                      const jsonContent = JSON.parse(data.instructions)

                      const renderContent = (
                        content: any[]
                      ): React.ReactNode[] => {
                        return content.map((item: any, index: number) => {
                          if (item.type === 'text') {
                            return <span key={index}>{item.text || ''}</span>
                          } else if (item.type === 'reactMention') {
                            const label = item.attrs?.label || 'mention'
                            const className = item.attrs?.class || ''

                            // Style based on mention type
                            if (className.includes('mention--result')) {
                              return (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                  &lt;{label}&gt;
                                </span>
                              )
                            } else if (className.includes('mention--action')) {
                              return (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                  #{label}
                                </span>
                              )
                            } else if (
                              className.includes('mention--variable')
                            ) {
                              return (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                  {'{' + label + '}'}
                                </span>
                              )
                            } else {
                              return (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                  {label}
                                </span>
                              )
                            }
                          } else if (item.content) {
                            return (
                              <span key={index}>
                                {renderContent(item.content)}
                              </span>
                            )
                          }
                          return null
                        })
                      }

                      if (jsonContent.content) {
                        return (
                          <span className="flex flex-wrap items-center gap-1">
                            {renderContent(jsonContent.content)}
                          </span>
                        )
                      }

                      return 'Instructions configured'
                    } catch (e) {
                      return 'Instructions configured'
                    }
                  } else {
                    return data.instructions
                  }
                }
                return 'Instructions configured'
              })()}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-400 italic">
            No instructions added
          </div>
        )}

        {/* Actions Section */}
        {hasContent && (
          <div className="space-y-2 border-t border-gray-100 pt-2">
            {data.actions && data.actions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {data.actions.map((action) => (
                  <div
                    key={action.id}
                    className="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded border border-yellow-200">
                    <span className="mr-1">⚡</span>
                    {action.name}
                  </div>
                ))}
              </div>
            )}

            {/* FAQs and Objections indicators */}
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              {data.faqs && data.faqs.length > 0 && (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                  {data.faqs.length} FAQ{data.faqs.length !== 1 ? 's' : ''}
                </span>
              )}
              {data.objections && data.objections.length > 0 && (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-1"></span>
                  {data.objections.length} Objection
                  {data.objections.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Jump Target Display */}
        {data.variant === 'jump' && data.targetNodeId && (
          <div className="text-sm text-blue-600 flex items-center">
            <RotateCcw className="w-3 h-3 mr-1" />
            Jump to:{' '}
            {(() => {
              const targetNode = layout.nodes.find(
                (node) => node.id === data.targetNodeId
              )
              return (
                targetNode?.data?.label ||
                targetNode?.label ||
                data.targetNodeId
              )
            })()}
          </div>
        )}
      </div>

      {/* Add Step Button - only show for non-end variants */}
      {hasPermission && !['jump', 'end'].includes(data.variant) && (
        <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="
                flex items-center justify-center w-8 h-8
                bg-white border-2 border-dashed border-gray-300
                rounded-full shadow-sm hover:border-gray-400
                hover:shadow-md transition-all duration-200
                cursor-pointer group z-10
              "
              title="Add step below">
              <Plus className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-50">
                <DropdownStep
                  position={{ x: 0, y: 0 }}
                  parentNodeId={id}
                  isEndOfWorkflow={isEndOfWorkflow}
                  onSelect={(variant) => {
                    console.log('Selected variant:', variant)
                    setIsDropdownOpen(false)
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CardStep
