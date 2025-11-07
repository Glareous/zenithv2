'use client'

import React, { useState } from 'react'

import { useWorkflow } from '@src/contexts/WorkflowContext'
import type { NodeVariant } from '@src/server/api/routers/projectAgentWorkflow'
import { GitBranch, Menu, RotateCcw, Scissors } from 'lucide-react'

export interface DropdownStepProps {
  position: { x: number; y: number }
  parentNodeId: string
  onSelect?: (variant: NodeVariant) => void
  isEndOfWorkflow?: boolean
}

const baseStepTypes = [
  {
    variant: 'default' as NodeVariant,
    label: 'Step',
    icon: <Menu className="w-4 h-4 text-purple-500" />,
    description: 'Standard workflow step',
  },
  {
    variant: 'branch' as NodeVariant,
    label: 'Branch',
    icon: <GitBranch className="w-4 h-4 text-purple-500" />,
    description: 'Create conditional branches',
  },
]

const endStepTypes = [
  {
    variant: 'jump' as NodeVariant,
    label: 'Jump',
    icon: <RotateCcw className="w-4 h-4 text-blue-500" />,
    description: 'Jump to another step',
  },
  {
    variant: 'end' as NodeVariant,
    label: 'End',
    icon: <Scissors className="w-4 h-4 text-red-500" />,
    description: 'End the workflow',
  },
]

const DropdownStep: React.FC<DropdownStepProps> = ({
  position,
  parentNodeId,
  onSelect,
  isEndOfWorkflow = false,
}) => {
  const { createNode, createBranch, insertNode, insertBranch, layout } =
    useWorkflow()

  const stepTypes = isEndOfWorkflow
    ? [...baseStepTypes, ...endStepTypes]
    : baseStepTypes

  const handleVariantSelection = (variant: NodeVariant) => {
    let newNode

    switch (variant) {
      case 'branch':
        const branchCount =
          layout.nodes.filter((node) => node.data?.variant === 'branch')
            .length + 1

        const branchParentChildren = layout.edges.filter(
          (edge) => edge.source === parentNodeId
        )

        if (branchParentChildren.length > 0) {
          const firstChild = branchParentChildren[0]
          if (firstChild) {
            insertBranch(
              parentNodeId,
              firstChild.target,
              `Branch ${branchCount}`,
              `Branch ${branchCount + 1}`
            )
          }
        } else {
          createBranch(
            parentNodeId,
            `Branch ${branchCount}`,
            `Branch ${branchCount + 1}`
          )
        }
        break

      case 'default':
        const stepCount =
          layout.nodes.filter((node) => node.data?.variant === 'default')
            .length + 1

        const parentChildren = layout.edges.filter(
          (edge) => edge.source === parentNodeId
        )

        if (parentChildren.length > 0) {
          const firstChild = parentChildren[0]
          if (firstChild) {
            newNode = insertNode(
              parentNodeId,
              firstChild.target,
              `Step ${stepCount}`,
              'default'
            )
          }
        } else {
          newNode = createNode(`Step ${stepCount}`, parentNodeId, 'default')
        }
        break

      case 'jump':
        const jumpCount =
          layout.nodes.filter((node) => node.data?.variant === 'jump').length +
          1

        const jumpParentChildren = layout.edges.filter(
          (edge) => edge.source === parentNodeId
        )

        if (jumpParentChildren.length > 0) {
          const firstChild = jumpParentChildren[0]
          if (firstChild) {
            newNode = insertNode(
              parentNodeId,
              firstChild.target,
              `Jump ${jumpCount}`,
              'jump'
            )
          }
        } else {
          newNode = createNode(`Jump ${jumpCount}`, parentNodeId, 'jump')
        }
        break

      case 'end':
        const endParentChildren = layout.edges.filter(
          (edge) => edge.source === parentNodeId
        )

        if (endParentChildren.length > 0) {
          const firstChild = endParentChildren[0]
          if (firstChild) {
            newNode = insertNode(parentNodeId, firstChild.target, 'End', 'end')
          }
        } else {
          newNode = createNode('End', parentNodeId, 'end')
        }
        break
    }

    onSelect?.(variant)
  }

  return (
    <div className="min-w-[160px] bg-white border border-gray-200 rounded-lg shadow-lg py-1">
      {stepTypes.map((stepType) => (
        <div
          key={stepType.variant}
          onClick={() => handleVariantSelection(stepType.variant)}
          className="flex items-center px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer transition-colors duration-150">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-lg mr-3 ${
              stepType.variant === 'branch'
                ? 'bg-purple-50 border border-purple-200'
                : stepType.variant === 'jump'
                  ? 'bg-blue-50 border border-blue-200'
                  : stepType.variant === 'end'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-purple-50 border border-purple-200'
            }`}>
            {stepType.icon}
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">{stepType.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default DropdownStep
