import type { WorkflowNode, WorkflowEdge } from '@src/server/api/routers/projectAgentWorkflow'

export interface InsertionPoint {
  id: string
  sourceNodeId: string
  targetNodeId: string
  edgeId: string
  position: { x: number; y: number }
  isValid: boolean
}

/**
 * Detects valid insertion points between workflow steps
 */
export function detectInsertionPoints(
  nodes: WorkflowNode[], 
  edges: WorkflowEdge[]
): InsertionPoint[] {
  const insertionPoints: InsertionPoint[] = []

  edges.forEach((edge) => {
    const sourceNode = nodes.find(n => n.id === edge.source)
    const targetNode = nodes.find(n => n.id === edge.target)

    if (!sourceNode || !targetNode) return

    // Skip branch-related edges (those with sourceHandle)
    if (edge.sourceHandle) return

    // CRITICAL: Only allow insertion between DEFAULT variant steps
    if (sourceNode.data.variant !== 'default') return
    if (targetNode.data.variant !== 'default') return

    // Skip if target is a branch pill (virtual node)
    if (edge.target.includes('-branch-pill-')) return


    // Calculate midpoint position for the insertion point
    const midPoint = {
      x: (sourceNode.position.x + targetNode.position.x) / 2,
      y: (sourceNode.position.y + targetNode.position.y) / 2,
    }

    insertionPoints.push({
      id: `insertion-${edge.source}-${edge.target}`,
      sourceNodeId: edge.source,
      targetNodeId: edge.target,
      edgeId: edge.id,
      position: midPoint,
      isValid: true
    })
  })

  return insertionPoints
}

/**
 * Checks if an insertion point is currently valid
 */
export function isInsertionPointValid(
  insertionPoint: InsertionPoint,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): boolean {
  // Check if both nodes still exist
  const sourceExists = nodes.some(n => n.id === insertionPoint.sourceNodeId)
  const targetExists = nodes.some(n => n.id === insertionPoint.targetNodeId)
  
  if (!sourceExists || !targetExists) return false

  // Check if the edge still exists
  const edgeExists = edges.some(e => e.id === insertionPoint.edgeId)
  
  return edgeExists
}

/**
 * Updates insertion point positions when nodes move
 */
export function updateInsertionPointPositions(
  insertionPoints: InsertionPoint[],
  nodes: WorkflowNode[]
): InsertionPoint[] {
  return insertionPoints.map(point => {
    const sourceNode = nodes.find(n => n.id === point.sourceNodeId)
    const targetNode = nodes.find(n => n.id === point.targetNodeId)

    if (!sourceNode || !targetNode) return point

    const midPoint = {
      x: (sourceNode.position.x + targetNode.position.x) / 2,
      y: (sourceNode.position.y + targetNode.position.y) / 2,
    }

    return {
      ...point,
      position: midPoint
    }
  })
}