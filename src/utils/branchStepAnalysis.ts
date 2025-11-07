import type { WorkflowNode, WorkflowEdge } from '@src/server/api/routers/projectAgentWorkflow'

export interface StepAnalysisResult {
  followingSteps: WorkflowNode[]
  followingEdges: WorkflowEdge[]
  affectedEdges: WorkflowEdge[]
}

/**
 * Analyzes a workflow to determine which steps should be transferred to Branch 1
 * when inserting a branch between a source and target node
 */
export function analyzeStepsForBranchTransfer(
  sourceNodeId: string,
  targetNodeId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): StepAnalysisResult {
  const followingSteps: WorkflowNode[] = []
  const followingEdges: WorkflowEdge[] = []
  const affectedEdges: WorkflowEdge[] = []
  
  // Start from the target node and find all connected nodes in a forward direction
  const visitedNodes = new Set<string>()
  const nodesToProcess = [targetNodeId]
  
  while (nodesToProcess.length > 0) {
    const currentNodeId = nodesToProcess.shift()!
    
    if (visitedNodes.has(currentNodeId)) {
      continue
    }
    
    visitedNodes.add(currentNodeId)
    
    // Find the current node
    const currentNode = nodes.find(n => n.id === currentNodeId)
    if (!currentNode) {
      continue
    }
    
    // Add the node to following steps (including the initial target)
    followingSteps.push(currentNode)
    
    // Find all edges that originate from this node
    const outgoingEdges = edges.filter(edge => edge.source === currentNodeId)
    
    // Add these edges to following edges
    followingEdges.push(...outgoingEdges)
    
    // Find all edges that connect to this node (for affected edges tracking)
    const incomingEdges = edges.filter(edge => edge.target === currentNodeId)
    affectedEdges.push(...incomingEdges)
    
    // Add target nodes of outgoing edges to processing queue
    outgoingEdges.forEach(edge => {
      if (!visitedNodes.has(edge.target)) {
        nodesToProcess.push(edge.target)
      }
    })
  }
  
  return {
    followingSteps,
    followingEdges,
    affectedEdges: affectedEdges.filter(edge => edge.source !== sourceNodeId) // Exclude the original source->target edge
  }
}

/**
 * Validates that a branch transfer operation is safe to perform
 */
export function validateBranchTransfer(
  sourceNodeId: string,
  targetNodeId: string,
  analysisResult: StepAnalysisResult,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check if source and target nodes exist
  const sourceNode = nodes.find(n => n.id === sourceNodeId)
  const targetNode = nodes.find(n => n.id === targetNodeId)
  
  if (!sourceNode) {
    errors.push('Source node not found')
  }
  
  if (!targetNode) {
    errors.push('Target node not found')
  }
  
  // Check if there's a direct connection between source and target
  const directEdge = edges.find(
    edge => edge.source === sourceNodeId && edge.target === targetNodeId
  )
  
  if (!directEdge) {
    errors.push('No direct connection between source and target nodes')
  }
  
  // Check for circular dependencies
  const hasCircularDependency = analysisResult.followingSteps.some(
    step => step.id === sourceNodeId
  )
  
  if (hasCircularDependency) {
    errors.push('Branch transfer would create circular dependency')
  }
  
  // Validate that we have steps to transfer
  if (analysisResult.followingSteps.length === 0) {
    errors.push('No steps found to transfer to branch')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Calculates optimal positions for transferred nodes in the branch structure
 */
export function calculateBranchTransferPositions(
  branchNode: WorkflowNode,
  followingSteps: WorkflowNode[],
  options: {
    branchId: string
    verticalSpacing?: number
    horizontalOffset?: number
  }
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>()
  const verticalSpacing = options.verticalSpacing ?? 120
  const horizontalOffset = options.horizontalOffset ?? 200
  
  // Calculate base position for Branch 1 path
  const baseX = branchNode.position.x + horizontalOffset
  const baseY = branchNode.position.y + 100
  
  // Position each following step vertically below the previous
  followingSteps.forEach((step, index) => {
    positions.set(step.id, {
      x: baseX,
      y: baseY + (index * verticalSpacing)
    })
  })
  
  return positions
}