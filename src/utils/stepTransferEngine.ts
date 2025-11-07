/**
 * Step Transfer Engine
 * 
 * This module handles the execution of transferring workflow steps to branches,
 * managing the complex operations of updating nodes, edges, and maintaining workflow integrity.
 */

import type { WorkflowNode, WorkflowEdge } from '@src/server/api/routers/projectAgentWorkflow'
import type { StepAnalysisResult, StepTransferPlan } from './stepAnalysisEngine'
import { createEdge, validateEdgeConnections } from './workflowEdgeUtils'
import { calculateBranchPosition, snapToGrid } from './workflowPositioning'

export interface TransferExecutionResult {
  success: boolean
  updatedNodes: WorkflowNode[]
  updatedEdges: WorkflowEdge[]
  createdBranchNode: WorkflowNode | null
  transferredSteps: WorkflowNode[]
  error?: string
  warnings: string[]
}

export interface TransferExecutionOptions {
  dryRun?: boolean
  preservePositions?: boolean
  validateIntegrity?: boolean
  generateBranchLabels?: boolean
}

/**
 * Executes the transfer of steps to a branch based on analysis results
 */
export function executeStepTransfer(
  analysis: StepAnalysisResult,
  currentNodes: WorkflowNode[],
  currentEdges: WorkflowEdge[],
  options: TransferExecutionOptions = {}
): TransferExecutionResult {
  const {
    dryRun = false,
    preservePositions = false,
    validateIntegrity = true,
    generateBranchLabels = true
  } = options

  try {
    // Step 1: Convert the target node to a branch node
    const branchConversionResult = convertNodeToBranch(
      analysis.branchInsertionPoint,
      currentNodes,
      { generateBranchLabels }
    )

    if (!branchConversionResult.success) {
      return {
        success: false,
        updatedNodes: currentNodes,
        updatedEdges: currentEdges,
        createdBranchNode: null,
        transferredSteps: [],
        error: branchConversionResult.error,
        warnings: []
      }
    }

    // Step 2: Update node positions if not preserving them
    const positionedNodes = preservePositions 
      ? branchConversionResult.updatedNodes
      : updateStepPositionsForBranch(
          branchConversionResult.updatedNodes,
          branchConversionResult.branchNode!,
          analysis.transferPlan
        )

    // Step 3: Execute edge updates
    const edgeUpdateResult = executeEdgeUpdates(
      currentEdges,
      analysis.transferPlan,
      branchConversionResult.branchNode!
    )

    if (!edgeUpdateResult.success) {
      return {
        success: false,
        updatedNodes: currentNodes,
        updatedEdges: currentEdges,
        createdBranchNode: null,
        transferredSteps: [],
        error: edgeUpdateResult.error,
        warnings: []
      }
    }

    // Step 4: Validate workflow integrity
    const warnings: string[] = []
    if (validateIntegrity) {
      const validation = validateEdgeConnections(positionedNodes, edgeUpdateResult.updatedEdges)
      if (!validation.valid) {
        return {
          success: false,
          updatedNodes: currentNodes,
          updatedEdges: currentEdges,
          createdBranchNode: null,
          transferredSteps: [],
          error: `Workflow validation failed: ${validation.errors.join(', ')}`,
          warnings: validation.warnings
        }
      }
      warnings.push(...validation.warnings)
    }

    // Return results (either for dry run or actual execution)
    const result: TransferExecutionResult = {
      success: true,
      updatedNodes: positionedNodes,
      updatedEdges: edgeUpdateResult.updatedEdges,
      createdBranchNode: branchConversionResult.branchNode!,
      transferredSteps: analysis.subsequentSteps,
      warnings
    }

    return result

  } catch (error) {
    return {
      success: false,
      updatedNodes: currentNodes,
      updatedEdges: currentEdges,
      createdBranchNode: null,
      transferredSteps: [],
      error: error instanceof Error ? error.message : 'Unknown error during transfer execution',
      warnings: []
    }
  }
}

/**
 * Converts a regular node to a branch node with default branches
 */
function convertNodeToBranch(
  targetNode: WorkflowNode,
  currentNodes: WorkflowNode[],
  options: { generateBranchLabels?: boolean } = {}
): {
  success: boolean
  updatedNodes: WorkflowNode[]
  branchNode: WorkflowNode | null
  error?: string
} {
  const { generateBranchLabels = true } = options

  try {
    // Create branch configuration
    const defaultBranches = [
      {
        id: `branch-${Date.now()}-1`,
        label: generateBranchLabels ? 'Branch' : 'Yes',
        condition: ''
      },
      {
        id: `branch-${Date.now()}-2`, 
        label: generateBranchLabels ? 'Branch' : 'No',
        condition: ''
      }
    ]

    // Update the target node to become a branch node
    const updatedNodes = currentNodes.map(node => {
      if (node.id === targetNode.id) {
        return {
          ...node,
          data: {
            ...node.data,
            variant: 'branch' as const,
            branches: defaultBranches,
            // Preserve existing data but update variant
            label: node.data.label || 'Decision Point'
          }
        }
      }
      return node
    })

    const branchNode = updatedNodes.find(n => n.id === targetNode.id) || null

    return {
      success: true,
      updatedNodes,
      branchNode
    }

  } catch (error) {
    return {
      success: false,
      updatedNodes: currentNodes,
      branchNode: null,
      error: error instanceof Error ? error.message : 'Failed to convert node to branch'
    }
  }
}

/**
 * Updates positions of transferred steps to align with the new branch structure
 */
function updateStepPositionsForBranch(
  nodes: WorkflowNode[],
  branchNode: WorkflowNode,
  transferPlan: StepTransferPlan
): WorkflowNode[] {
  const branches = branchNode.data.branches || []
  if (branches.length === 0 || transferPlan.stepsToTransfer.length === 0) {
    return nodes
  }

  // Calculate the position for Branch 1 (first branch)
  const branchPosition = calculateBranchPosition(
    branchNode,
    0, // First branch (Branch 1)
    branches.length,
    nodes,
    { avoidCollisions: true }
  )

  // Update positions for transferred steps
  return nodes.map(node => {
    const stepIndex = transferPlan.stepsToTransfer.findIndex(step => step.id === node.id)
    if (stepIndex !== -1) {
      // Position steps vertically below the branch position
      const verticalSpacing = 120
      const newPosition = {
        x: branchPosition.x,
        y: branchPosition.y + (stepIndex * verticalSpacing)
      }

      return {
        ...node,
        position: snapToGrid(newPosition)
      }
    }
    return node
  })
}

/**
 * Executes the edge updates according to the transfer plan
 */
function executeEdgeUpdates(
  currentEdges: WorkflowEdge[],
  transferPlan: StepTransferPlan,
  branchNode: WorkflowNode
): {
  success: boolean
  updatedEdges: WorkflowEdge[]
  error?: string
} {
  try {
    // Start with current edges
    let updatedEdges = [...currentEdges]

    // Step 1: Remove edges that should be removed
    const edgeIdsToRemove = new Set(transferPlan.edgesToRemove.map(edge => edge.id))
    updatedEdges = updatedEdges.filter(edge => !edgeIdsToRemove.has(edge.id))

    // Step 2: Add new edges that should be created
    updatedEdges.push(...transferPlan.edgesToCreate)

    // Step 3: Create branch-specific edges if needed
    const branches = branchNode.data.branches || []
    if (branches.length > 0 && transferPlan.stepsToTransfer.length > 0) {
      const firstTransferredStep = transferPlan.stepsToTransfer[0]
      if (firstTransferredStep) {
        // Ensure there's an edge from the branch to the first transferred step
        const branchEdgeExists = updatedEdges.some(
          edge => edge.source === branchNode.id && 
                  edge.target === firstTransferredStep.id &&
                  edge.sourceHandle === transferPlan.targetBranchId
        )

        if (!branchEdgeExists) {
          const branchEdge = createEdge(branchNode.id, firstTransferredStep.id, {
            sourceHandle: transferPlan.targetBranchId,
            animated: true,
            style: {
              stroke: '#8b5cf6',
              strokeWidth: 2
            }
          })
          updatedEdges.push(branchEdge)
        }
      }
    }

    return {
      success: true,
      updatedEdges
    }

  } catch (error) {
    return {
      success: false,
      updatedEdges: currentEdges,
      error: error instanceof Error ? error.message : 'Failed to update edges'
    }
  }
}

/**
 * Creates a preview of what the transfer operation will do
 */
export function previewStepTransfer(
  analysis: StepAnalysisResult,
  currentNodes: WorkflowNode[],
  currentEdges: WorkflowEdge[]
): {
  preview: TransferExecutionResult
  summary: {
    stepsToMove: number
    edgesToRemove: number
    edgesToCreate: number
    branchNodeLabel: string
    estimatedTime: string
  }
} {
  // Execute a dry run
  const preview = executeStepTransfer(analysis, currentNodes, currentEdges, {
    dryRun: true,
    validateIntegrity: true
  })

  const summary = {
    stepsToMove: analysis.subsequentSteps.length,
    edgesToRemove: analysis.transferPlan.edgesToRemove.length,
    edgesToCreate: analysis.transferPlan.edgesToCreate.length,
    branchNodeLabel: analysis.branchInsertionPoint.data.label || 'Unknown Step',
    estimatedTime: estimateExecutionTime(analysis.transferPlan)
  }

  return { preview, summary }
}

/**
 * Estimates execution time based on transfer complexity
 */
function estimateExecutionTime(transferPlan: StepTransferPlan): string {
  switch (transferPlan.estimatedComplexity) {
    case 'simple':
      return '< 1 second'
    case 'moderate':
      return '1-2 seconds'
    case 'complex':
      return '2-5 seconds'
    default:
      return 'Unknown'
  }
}

/**
 * Rollback a transfer operation (for undo functionality)
 */
export function rollbackStepTransfer(
  originalNodes: WorkflowNode[],
  originalEdges: WorkflowEdge[],
  transferResult: TransferExecutionResult
): {
  success: boolean
  restoredNodes: WorkflowNode[]
  restoredEdges: WorkflowEdge[]
  error?: string
} {
  try {
    // Simply restore the original state
    return {
      success: true,
      restoredNodes: [...originalNodes],
      restoredEdges: [...originalEdges]
    }
  } catch (error) {
    return {
      success: false,
      restoredNodes: originalNodes,
      restoredEdges: originalEdges,
      error: error instanceof Error ? error.message : 'Failed to rollback transfer'
    }
  }
}

/**
 * Validates that a transfer operation can be safely executed
 */
export function validateTransferExecution(
  analysis: StepAnalysisResult,
  currentNodes: WorkflowNode[],
  currentEdges: WorkflowEdge[]
): {
  canExecute: boolean
  errors: string[]
  warnings: string[]
  requirements: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  const requirements: string[] = []

  // Check if target node exists
  const targetExists = currentNodes.some(n => n.id === analysis.branchInsertionPoint.id)
  if (!targetExists) {
    errors.push('Target node no longer exists in the workflow')
  }

  // Check if all subsequent steps still exist
  for (const step of analysis.subsequentSteps) {
    const stepExists = currentNodes.some(n => n.id === step.id)
    if (!stepExists) {
      errors.push(`Step "${step.data.label}" no longer exists in the workflow`)
    }
  }

  // Check if target node is already a branch
  const targetNode = currentNodes.find(n => n.id === analysis.branchInsertionPoint.id)
  if (targetNode?.data.variant === 'branch') {
    warnings.push('Target node is already a branch node. This will replace existing branches.')
  }

  // Check for complex edge scenarios
  if (analysis.transferPlan.edgesToRemove.length > 10) {
    requirements.push('This operation will modify many connections. Consider reviewing the workflow structure.')
  }

  // Check for nested branching
  const branchNodesInTransfer = analysis.subsequentSteps.filter(
    step => step.data.variant === 'branch'
  )
  if (branchNodesInTransfer.length > 0) {
    warnings.push('Transfer includes branch nodes, which will create nested branching logic.')
  }

  return {
    canExecute: errors.length === 0,
    errors,
    warnings,
    requirements
  }
}