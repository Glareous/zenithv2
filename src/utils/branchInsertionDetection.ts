import type {
  WorkflowEdge,
  WorkflowNode,
} from '@src/server/api/routers/projectAgentWorkflow'

export interface BranchInsertionPoint {
  id: string
  sourceNodeId: string
  targetNodeId: string
  edgeId: string
  position: { x: number; y: number }
  isValid: boolean
}

/**
 * Detects valid branch insertion points between workflow steps
 * Only creates insertion points where branch insertion makes logical sense
 */
export function detectBranchInsertionPoints(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): BranchInsertionPoint[] {
  const insertionPoints: BranchInsertionPoint[] = []

  edges.forEach((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source)
    const targetNode = nodes.find((n) => n.id === edge.target)

    if (!sourceNode || !targetNode) return

    // Skip branch-related edges (those with sourceHandle - already part of a branch)
    if (edge.sourceHandle) return

    // Skip if source is already a branch (avoid nested branch creation for now)
    if (sourceNode.data.variant === 'branch') return

    // Skip if source is an end step (end steps can't have branches)
    if (sourceNode.data.variant === 'end') return

    // Skip if target is a virtual branch pill node
    if (edge.target.includes('-branch-pill-')) return

    // Skip if target is already a branch (would create complex nested structure)
    if (targetNode.data.variant === 'branch') return

    // Calculate midpoint position for the branch insertion point
    const midPoint = {
      x: (sourceNode.position.x + targetNode.position.x) / 2,
      y: (sourceNode.position.y + targetNode.position.y) / 2,
    }

    insertionPoints.push({
      id: `branch-insertion-${edge.source}-${edge.target}`,
      sourceNodeId: edge.source,
      targetNodeId: edge.target,
      edgeId: edge.id,
      position: midPoint,
      isValid: true,
    })
  })

  return insertionPoints
}

/**
 * Checks if a branch insertion point is currently valid
 */
export function isBranchInsertionPointValid(
  insertionPoint: BranchInsertionPoint,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): boolean {
  // Check if both nodes still exist
  const sourceExists = nodes.some((n) => n.id === insertionPoint.sourceNodeId)
  const targetExists = nodes.some((n) => n.id === insertionPoint.targetNodeId)

  if (!sourceExists || !targetExists) return false

  // Check if the edge still exists
  const edgeExists = edges.some((e) => e.id === insertionPoint.edgeId)

  return edgeExists
}

/**
 * Updates branch insertion point positions when nodes move
 */
export function updateBranchInsertionPointPositions(
  insertionPoints: BranchInsertionPoint[],
  nodes: WorkflowNode[]
): BranchInsertionPoint[] {
  return insertionPoints.map((point) => {
    const sourceNode = nodes.find((n) => n.id === point.sourceNodeId)
    const targetNode = nodes.find((n) => n.id === point.targetNodeId)

    if (!sourceNode || !targetNode) return point

    const midPoint = {
      x: (sourceNode.position.x + targetNode.position.x) / 2,
      y: (sourceNode.position.y + targetNode.position.y) / 2,
    }

    return {
      ...point,
      position: midPoint,
    }
  })
}
