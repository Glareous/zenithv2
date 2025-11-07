/**
 * Step Analysis Engine
 * 
 * This module provides functionality for analyzing workflow step relationships
 * and identifying which steps should be transferred when branches are inserted.
 */

import type { WorkflowNode, WorkflowEdge } from '@src/server/api/routers/projectAgentWorkflow'
import { findNodeConnections, findPathsBetweenNodes } from './workflowEdgeUtils'

export interface StepAnalysisResult {
  subsequentSteps: WorkflowNode[]
  affectedEdges: WorkflowEdge[]
  branchInsertionPoint: WorkflowNode
  transferPlan: StepTransferPlan
}

export interface StepTransferPlan {
  stepsToTransfer: WorkflowNode[]
  edgesToRemove: WorkflowEdge[]
  edgesToCreate: WorkflowEdge[]
  targetBranchId: string
  estimatedComplexity: 'simple' | 'moderate' | 'complex'
}

export interface BranchInsertionContext {
  targetNodeId: string
  insertionType: 'before' | 'after' | 'convert'
  preserveConnections: boolean
}

/**
 * Analyzes what steps should be transferred when a branch is inserted before a step
 */
export function analyzeStepsForBranchInsertion(
  targetNodeId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  context: BranchInsertionContext = {
    targetNodeId,
    insertionType: 'before',
    preserveConnections: true
  }
): StepAnalysisResult {
  const targetNode = nodes.find(n => n.id === targetNodeId)
  if (!targetNode) {
    throw new Error(`Target node ${targetNodeId} not found`)
  }

  // Get all subsequent steps from the target node
  const subsequentSteps = getSubsequentSteps(targetNodeId, nodes, edges)
  
  // Analyze affected edges
  const affectedEdges = getAffectedEdges(targetNodeId, subsequentSteps, edges)
  
  // Create transfer plan
  const transferPlan = createStepTransferPlan(
    targetNode,
    subsequentSteps,
    affectedEdges,
    context
  )

  return {
    subsequentSteps,
    affectedEdges,
    branchInsertionPoint: targetNode,
    transferPlan
  }
}

/**
 * Gets all steps that come after a given node in the workflow
 */
export function getSubsequentSteps(
  nodeId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  visited: Set<string> = new Set()
): WorkflowNode[] {
  if (visited.has(nodeId)) {
    return [] // Prevent infinite loops
  }
  
  visited.add(nodeId)
  const subsequentSteps: WorkflowNode[] = []
  
  // Find all outgoing edges from this node
  const outgoingEdges = edges.filter(edge => edge.source === nodeId)
  
  for (const edge of outgoingEdges) {
    const childNode = nodes.find(n => n.id === edge.target)
    if (childNode) {
      subsequentSteps.push(childNode)
      
      // Recursively get subsequent steps from child nodes
      const childSubsequentSteps = getSubsequentSteps(
        childNode.id,
        nodes,
        edges,
        visited
      )
      subsequentSteps.push(...childSubsequentSteps)
    }
  }
  
  return subsequentSteps
}

/**
 * Gets all edges that would be affected by the step transfer
 */
function getAffectedEdges(
  targetNodeId: string,
  subsequentSteps: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowEdge[] {
  const subsequentStepIds = new Set(subsequentSteps.map(step => step.id))
  const affectedEdges: WorkflowEdge[] = []
  
  // Find edges that connect to or from subsequent steps
  for (const edge of edges) {
    if (subsequentStepIds.has(edge.source) || subsequentStepIds.has(edge.target)) {
      affectedEdges.push(edge)
    }
  }
  
  // Also include incoming edges to the target node
  const incomingEdges = edges.filter(edge => edge.target === targetNodeId)
  affectedEdges.push(...incomingEdges)
  
  return affectedEdges
}

/**
 * Creates a detailed plan for transferring steps to a branch
 */
function createStepTransferPlan(
  branchInsertionPoint: WorkflowNode,
  subsequentSteps: WorkflowNode[],
  affectedEdges: WorkflowEdge[],
  context: BranchInsertionContext
): StepTransferPlan {
  // Determine which steps to transfer (all subsequent steps)
  const stepsToTransfer = [...subsequentSteps]
  
  // Determine target branch ID (will be the left branch by default)
  const targetBranchId = `branch-${Date.now()}-1`
  
  // Calculate edges to remove and create
  const edgesToRemove = calculateEdgesToRemove(
    branchInsertionPoint,
    subsequentSteps,
    affectedEdges
  )
  
  const edgesToCreate = calculateEdgesToCreate(
    branchInsertionPoint,
    subsequentSteps,
    targetBranchId,
    context
  )
  
  // Estimate complexity
  const estimatedComplexity = estimateTransferComplexity(
    stepsToTransfer,
    edgesToRemove,
    edgesToCreate
  )
  
  return {
    stepsToTransfer,
    edgesToRemove,
    edgesToCreate,
    targetBranchId,
    estimatedComplexity
  }
}

/**
 * Calculates which edges should be removed during the transfer
 */
function calculateEdgesToRemove(
  branchInsertionPoint: WorkflowNode,
  subsequentSteps: WorkflowNode[],
  affectedEdges: WorkflowEdge[]
): WorkflowEdge[] {
  const subsequentStepIds = new Set(subsequentSteps.map(step => step.id))
  const edgesToRemove: WorkflowEdge[] = []
  
  for (const edge of affectedEdges) {
    // Remove edges that connect to the original location
    if (edge.target === branchInsertionPoint.id && !subsequentStepIds.has(edge.source)) {
      edgesToRemove.push(edge)
    }
    
    // Remove outgoing edges from the branch insertion point to subsequent steps
    if (edge.source === branchInsertionPoint.id && subsequentStepIds.has(edge.target)) {
      edgesToRemove.push(edge)
    }
  }
  
  return edgesToRemove
}

/**
 * Calculates which edges should be created during the transfer
 */
function calculateEdgesToCreate(
  branchInsertionPoint: WorkflowNode,
  subsequentSteps: WorkflowNode[],
  targetBranchId: string,
  context: BranchInsertionContext
): WorkflowEdge[] {
  const edgesToCreate: WorkflowEdge[] = []
  
  if (subsequentSteps.length === 0) {
    return edgesToCreate
  }
  
  // Create edge from branch to first subsequent step
  const firstSubsequentStep = subsequentSteps[0]
  if (firstSubsequentStep) {
    edgesToCreate.push({
      id: `edge-${branchInsertionPoint.id}-${targetBranchId}-${firstSubsequentStep.id}`,
      source: branchInsertionPoint.id,
      target: firstSubsequentStep.id,
      sourceHandle: targetBranchId,
      animated: true,
      style: {
        stroke: '#8b5cf6',
        strokeWidth: 2
      }
    })
  }
  
  return edgesToCreate
}

/**
 * Estimates the complexity of the transfer operation
 */
function estimateTransferComplexity(
  stepsToTransfer: WorkflowNode[],
  edgesToRemove: WorkflowEdge[],
  edgesToCreate: WorkflowEdge[]
): 'simple' | 'moderate' | 'complex' {
  const totalOperations = stepsToTransfer.length + edgesToRemove.length + edgesToCreate.length
  
  if (totalOperations <= 5) {
    return 'simple'
  } else if (totalOperations <= 15) {
    return 'moderate'
  } else {
    return 'complex'
  }
}

/**
 * Validates that a step transfer operation is safe to perform
 */
export function validateStepTransfer(
  analysis: StepAnalysisResult,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Check for circular dependencies
  const { transferPlan, branchInsertionPoint } = analysis
  
  // Validate that we're not creating circular references
  for (const stepToTransfer of transferPlan.stepsToTransfer) {
    if (stepToTransfer.data.variant === 'jump' && 
        stepToTransfer.data.targetNodeId === branchInsertionPoint.id) {
      errors.push(
        `Cannot transfer jump step "${stepToTransfer.data.label}" that targets the branch insertion point`
      )
    }
  }
  
  // Check for end nodes in the middle of transfer
  const endNodesInTransfer = transferPlan.stepsToTransfer.filter(
    step => step.data.variant === 'end'
  )
  if (endNodesInTransfer.length > 0 && transferPlan.stepsToTransfer.length > 1) {
    warnings.push(
      `Transfer includes ${endNodesInTransfer.length} end node(s) which may affect workflow termination`
    )
  }
  
  // Check for branch nodes in transfer
  const branchNodesInTransfer = transferPlan.stepsToTransfer.filter(
    step => step.data.variant === 'branch'
  )
  if (branchNodesInTransfer.length > 0) {
    warnings.push(
      `Transfer includes ${branchNodesInTransfer.length} branch node(s) which will create nested branching`
    )
  }
  
  // Validate edge integrity
  if (transferPlan.edgesToRemove.length === 0 && transferPlan.stepsToTransfer.length > 0) {
    warnings.push('No edges will be removed, which may result in duplicate connections')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Finds the optimal insertion point for a branch before a target step
 */
export function findOptimalBranchInsertionPoint(
  targetStepId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): {
  insertionPoint: WorkflowNode | null
  insertionStrategy: 'convert' | 'insertBefore' | 'insertAbove'
  reasoning: string
} {
  const targetStep = nodes.find(n => n.id === targetStepId)
  if (!targetStep) {
    return {
      insertionPoint: null,
      insertionStrategy: 'convert',
      reasoning: 'Target step not found'
    }
  }
  
  // Check if target step already has multiple incoming connections
  const incomingEdges = edges.filter(edge => edge.target === targetStepId)
  
  if (incomingEdges.length === 0) {
    return {
      insertionPoint: targetStep,
      insertionStrategy: 'convert',
      reasoning: 'Target step has no incoming connections, safe to convert'
    }
  }
  
  if (incomingEdges.length === 1) {
    return {
      insertionPoint: targetStep,
      insertionStrategy: 'insertBefore',
      reasoning: 'Target step has single incoming connection, insert branch before it'
    }
  }
  
  return {
    insertionPoint: targetStep,
    insertionStrategy: 'insertAbove',
    reasoning: 'Target step has multiple incoming connections, insert above to maintain all connections'
  }
}

/**
 * Generates a summary of the transfer operation for user confirmation
 */
export function generateTransferSummary(analysis: StepAnalysisResult): {
  title: string
  description: string
  stepsAffected: number
  edgesAffected: number
  complexity: string
  warnings: string[]
} {
  const { transferPlan, subsequentSteps } = analysis
  
  return {
    title: 'Branch Creation and Step Transfer',
    description: `This will create a branch before "${analysis.branchInsertionPoint.data.label}" and move ${subsequentSteps.length} subsequent step(s) to Branch 1.`,
    stepsAffected: subsequentSteps.length,
    edgesAffected: transferPlan.edgesToRemove.length + transferPlan.edgesToCreate.length,
    complexity: transferPlan.estimatedComplexity,
    warnings: subsequentSteps.length === 0 ? 
      ['No steps will be transferred as there are no subsequent steps'] : 
      []
  }
}