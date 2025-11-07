import type {
  WorkflowNode,
  WorkflowEdge,
} from '@src/server/api/routers/projectAgentWorkflow'
import type {
  BranchWithDragOptions,
  StepDragResult,
  BranchCreationContext,
  BranchDragOperation,
} from '@src/types/branchWithDrag'

/**
 * Creates branches with automatic step dragging functionality
 * When creating branches between Step A and Step B:
 * 1. Creates Branch 1 and Branch 2 connected to Step A
 * 2. Automatically moves Step B (and its connected steps) to Branch 1
 * 3. Leaves Branch 2 empty for new workflow paths
 */

/**
 * Analyzes which steps should be transferred when creating branches
 */
export function analyzeStepsForDrag(
  sourceNodeId: string,
  targetNodeId: string | undefined,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): string[] {
  if (!targetNodeId) return []

  const stepsToTransfer: string[] = []
  const visited = new Set<string>()

  // Find all steps connected downstream from the target node
  function collectDownstreamSteps(nodeId: string) {
    if (visited.has(nodeId)) return
    visited.add(nodeId)
    
    stepsToTransfer.push(nodeId)

    // Find outgoing edges from this node
    const outgoingEdges = edges.filter(edge => edge.source === nodeId)
    
    for (const edge of outgoingEdges) {
      collectDownstreamSteps(edge.target)
    }
  }

  // Start collection from the target node
  collectDownstreamSteps(targetNodeId)

  return stepsToTransfer
}

/**
 * Creates a branch drag operation plan
 */
export function createBranchDragOperation(
  context: BranchCreationContext,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): BranchDragOperation | null {
  const sourceNode = nodes.find(n => n.id === context.sourceNodeId)
  if (!sourceNode) {
    console.error(`Source node ${context.sourceNodeId} not found`)
    return null
  }

  const targetNode = context.targetNodeId 
    ? nodes.find(n => n.id === context.targetNodeId)
    : null

  // Generate unique IDs
  const timestamp = Date.now()
  const branchNodeId = `branch-${timestamp}`
  const branch1Id = `branch-${timestamp}-1`
  const branch2Id = `branch-${timestamp}-2`
  const branch1NodeId = `node-${timestamp}-branch1`
  const branch2NodeId = `node-${timestamp}-branch2`

  // Determine branch labels
  const branchLabels = context.options.branchLabels || ['Branch', 'Branch']
  
  // Determine main branch node label
  const branchLabel = context.options.preserveStepLabel 
    ? sourceNode.data.label
    : 'Decision Point'

  // Create the main branch node
  const branchNode = {
    id: branchNodeId,
    position: context.branchPosition,
    label: branchLabel,
    branches: [
      {
        id: branch1Id,
        label: branchLabels[0],
        condition: ''
      },
      {
        id: branch2Id,
        label: branchLabels[1], 
        condition: ''
      }
    ]
  }

  // Position Branch 1 and Branch 2 nodes
  const branch1Position = {
    x: context.branchPosition.x - 200, // Left side
    y: context.branchPosition.y + 150
  }
  
  const branch2Position = {
    x: context.branchPosition.x + 200, // Right side
    y: context.branchPosition.y + 150
  }

  const branch1Node = {
    id: branch1NodeId,
    position: branch1Position,
    label: branchLabels[0]
  }

  const branch2Node = {
    id: branch2NodeId,
    position: branch2Position,
    label: branchLabels[1]
  }

  // Analyze steps to transfer
  const stepsToTransferIds = analyzeStepsForDrag(
    context.sourceNodeId,
    context.targetNodeId,
    nodes,
    edges
  )

  // Calculate new positions for transferred steps
  let currentY = branch1Position.y + 120 // Start below Branch 1
  const stepsToTransfer = stepsToTransferIds.map(stepId => ({
    stepId,
    newPosition: {
      x: branch1Position.x, // Same X as Branch 1
      y: currentY += 120 // Stack vertically
    }
  }))

  // Find edges to remove (between source and target)
  const edgesToRemove: string[] = []
  if (context.targetNodeId) {
    const sourceToTargetEdges = edges.filter(
      edge => edge.source === context.sourceNodeId && edge.target === context.targetNodeId
    )
    edgesToRemove.push(...sourceToTargetEdges.map(e => e.id))
  }

  // Create new edges
  const newEdges = [
    // Source node to main branch node
    {
      id: `edge-${context.sourceNodeId}-${branchNodeId}`,
      source: context.sourceNodeId,
      target: branchNodeId,
      animated: true,
      style: { stroke: '#94a3b8', strokeWidth: 2 }
    },
    // Main branch to Branch 1 node
    {
      id: `edge-${branchNodeId}-${branch1NodeId}`,
      source: branchNodeId,
      target: branch1NodeId,
      sourceHandle: branch1Id,
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 2 }
    },
    // Main branch to Branch 2 node
    {
      id: `edge-${branchNodeId}-${branch2NodeId}`,
      source: branchNodeId,
      target: branch2NodeId,
      sourceHandle: branch2Id,
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 2 }
    }
  ]

  // Connect Branch 1 to the first transferred step
  if (stepsToTransfer.length > 0) {
    newEdges.push({
      id: `edge-${branch1NodeId}-${stepsToTransfer[0].stepId}`,
      source: branch1NodeId,
      target: stepsToTransfer[0].stepId,
      animated: true,
      style: { stroke: '#94a3b8', strokeWidth: 2 }
    })
  }

  return {
    branchNode,
    branch1Node,
    branch2Node,
    stepsToTransfer,
    edgesToRemove,
    newEdges
  }
}

/**
 * Executes a branch drag operation
 */
export function executeBranchDragOperation(
  operation: BranchDragOperation,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  createNewNode: (
    position: { x: number; y: number },
    variant: 'default' | 'end' | 'jump' | 'branch',
    label?: string
  ) => WorkflowNode
): StepDragResult {
  try {
    const updatedNodes = [...nodes]
    let updatedEdges = [...edges]

    // 1. Create main branch node
    const mainBranchNode = createNewNode(
      operation.branchNode.position,
      'branch',
      operation.branchNode.label
    )
    
    // Update with branch data
    mainBranchNode.data = {
      ...mainBranchNode.data,
      branches: operation.branchNode.branches
    }
    updatedNodes.push(mainBranchNode)

    // 2. Create Branch 1 and Branch 2 nodes
    const branch1StepNode = createNewNode(
      operation.branch1Node.position,
      'default',
      operation.branch1Node.label
    )
    const branch2StepNode = createNewNode(
      operation.branch2Node.position,
      'default',
      operation.branch2Node.label
    )
    
    updatedNodes.push(branch1StepNode, branch2StepNode)

    // 3. Update positions of transferred steps
    operation.stepsToTransfer.forEach(({ stepId, newPosition }) => {
      const nodeIndex = updatedNodes.findIndex(n => n.id === stepId)
      if (nodeIndex !== -1) {
        updatedNodes[nodeIndex] = {
          ...updatedNodes[nodeIndex],
          position: newPosition
        }
      }
    })

    // 4. Remove old edges
    updatedEdges = updatedEdges.filter(edge => 
      !operation.edgesToRemove.includes(edge.id)
    )

    // 5. Add new edges
    operation.newEdges.forEach(edgeData => {
      updatedEdges.push({
        id: edgeData.id,
        source: edgeData.source,
        target: edgeData.target,
        sourceHandle: edgeData.sourceHandle,
        targetHandle: edgeData.targetHandle,
        animated: edgeData.animated ?? true,
        style: edgeData.style
      })
    })

    return {
      success: true,
      transferredStepsCount: operation.stepsToTransfer.length,
      transferredStepIds: operation.stepsToTransfer.map(s => s.stepId),
      branch1NodeId: branch1StepNode.id,
      branch2NodeId: branch2StepNode.id
    }

  } catch (error) {
    console.error('Branch drag operation failed:', error)
    return {
      success: false,
      transferredStepsCount: 0,
      transferredStepIds: [],
      branch1NodeId: '',
      branch2NodeId: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Main function to create branches with step dragging
 */
export function createBranchWithStepDrag(
  sourceNodeId: string,
  targetNodeId: string | undefined,
  branchPosition: { x: number; y: number },
  options: BranchWithDragOptions,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  createNewNode: (
    position: { x: number; y: number },
    variant: 'default' | 'end' | 'jump' | 'branch',
    label?: string
  ) => WorkflowNode
): StepDragResult & { 
  updatedNodes: WorkflowNode[]
  updatedEdges: WorkflowEdge[]
} {
  try {
    const context: BranchCreationContext = {
      sourceNodeId,
      targetNodeId,
      branchPosition,
      options
    }

    const operation = createBranchDragOperation(context, nodes, edges)
    if (!operation) {
      return {
        success: false,
        transferredStepsCount: 0,
        transferredStepIds: [],
        branch1NodeId: '',
        branch2NodeId: '',
        error: 'Failed to create branch operation',
        updatedNodes: nodes,
        updatedEdges: edges
      }
    }

    // Start with original nodes and edges
    const updatedNodes = [...nodes]
    let updatedEdges = [...edges]

    // Create main branch node (convert source node to branch)
    const sourceNodeIndex = updatedNodes.findIndex(n => n.id === sourceNodeId)
    if (sourceNodeIndex === -1) {
      throw new Error(`Source node ${sourceNodeId} not found`)
    }

    // Update source node to become a branch node
    updatedNodes[sourceNodeIndex] = {
      ...updatedNodes[sourceNodeIndex],
      data: {
        ...updatedNodes[sourceNodeIndex].data,
        variant: 'branch',
        branches: operation.branchNode.branches
      }
    }

    // Create Branch 1 and Branch 2 step nodes
    const branch1StepNode = createNewNode(
      operation.branch1Node.position,
      'default',
      operation.branch1Node.label
    )
    const branch2StepNode = createNewNode(
      operation.branch2Node.position,
      'default', 
      operation.branch2Node.label
    )
    
    updatedNodes.push(branch1StepNode, branch2StepNode)

    // Update positions of transferred steps (don't duplicate, just move)
    operation.stepsToTransfer.forEach(({ stepId, newPosition }) => {
      const nodeIndex = updatedNodes.findIndex(n => n.id === stepId)
      if (nodeIndex !== -1) {
        updatedNodes[nodeIndex] = {
          ...updatedNodes[nodeIndex],
          position: newPosition
        }
      }
    })

    // Remove old edges
    updatedEdges = updatedEdges.filter(edge => 
      !operation.edgesToRemove.includes(edge.id)
    )

    // Add new edges with correct IDs
    // 1. Branch node to Branch 1 step
    updatedEdges.push({
      id: `edge-${sourceNodeId}-${branch1StepNode.id}`,
      source: sourceNodeId,
      target: branch1StepNode.id,
      sourceHandle: operation.branchNode.branches[0].id, // Branch 1 handle
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 2 }
    })

    // 2. Branch node to Branch 2 step
    updatedEdges.push({
      id: `edge-${sourceNodeId}-${branch2StepNode.id}`,
      source: sourceNodeId,
      target: branch2StepNode.id,
      sourceHandle: operation.branchNode.branches[1].id, // Branch 2 handle
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 2 }
    })

    // 3. Branch 1 step to the first transferred step (if any)
    if (operation.stepsToTransfer.length > 0) {
      updatedEdges.push({
        id: `edge-${branch1StepNode.id}-${operation.stepsToTransfer[0].stepId}`,
        source: branch1StepNode.id,
        target: operation.stepsToTransfer[0].stepId,
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 }
      })
    }

    return {
      success: true,
      transferredStepsCount: operation.stepsToTransfer.length,
      transferredStepIds: operation.stepsToTransfer.map(s => s.stepId),
      branch1NodeId: branch1StepNode.id,
      branch2NodeId: branch2StepNode.id,
      updatedNodes,
      updatedEdges
    }

  } catch (error) {
    console.error('Branch creation with drag failed:', error)
    return {
      success: false,
      transferredStepsCount: 0,
      transferredStepIds: [],
      branch1NodeId: '',
      branch2NodeId: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      updatedNodes: nodes,
      updatedEdges: edges
    }
  }
}