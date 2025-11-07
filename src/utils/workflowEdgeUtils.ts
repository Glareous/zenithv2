/**
 * Workflow Edge Utilities
 * 
 * This file contains utilities for managing workflow edges, including
 * rerouting when nodes are inserted and branch-specific edge handling.
 */

import type { WorkflowNode, WorkflowEdge } from '@src/server/api/routers/projectAgentWorkflow'

// Edge creation result
export interface EdgeCreationResult {
  newEdges: WorkflowEdge[]
  removedEdgeIds: string[]
  success: boolean
  error?: string
}

/**
 * Creates a new edge with proper ID and default properties
 */
export function createEdge(
  source: string,
  target: string,
  options: {
    sourceHandle?: string
    targetHandle?: string
    type?: string
    animated?: boolean
    label?: string
    style?: any
  } = {}
): WorkflowEdge {
  const {
    sourceHandle,
    targetHandle,
    type = 'default',
    animated = true,
    label,
    style,
  } = options

  const edgeId = sourceHandle 
    ? `edge-${source}-${sourceHandle}-${target}`
    : `edge-${source}-${target}`

  return {
    id: edgeId,
    source,
    target,
    sourceHandle,
    targetHandle,
    type,
    animated,
    label,
    style,
  }
}

/**
 * Finds all edges connected to a specific node
 */
export function findNodeConnections(
  nodeId: string,
  edges: WorkflowEdge[]
): {
  incoming: WorkflowEdge[]
  outgoing: WorkflowEdge[]
  all: WorkflowEdge[]
} {
  const incoming = edges.filter(edge => edge.target === nodeId)
  const outgoing = edges.filter(edge => edge.source === nodeId)
  
  return {
    incoming,
    outgoing,
    all: [...incoming, ...outgoing],
  }
}

/**
 * Creates edges for branch connections
 */
export function createBranchEdges(
  parentNodeId: string,
  branchId: string,
  newNodeId: string
): WorkflowEdge {
  return createEdge(parentNodeId, newNodeId, {
    sourceHandle: branchId,
    animated: true,
    style: {
      stroke: '#8b5cf6', // Purple color for branch connections
      strokeWidth: 2,
    },
  })
}

/**
 * Reroutes edges when inserting a node between two connected nodes
 */
export function rerouteEdgesForInsertion(
  insertedNodeId: string,
  sourceNodeId: string,
  targetNodeId: string,
  existingEdges: WorkflowEdge[]
): EdgeCreationResult {
  try {
    // Find the edge that needs to be replaced
    const originalEdge = existingEdges.find(
      edge => edge.source === sourceNodeId && edge.target === targetNodeId
    )

    if (!originalEdge) {
      return {
        newEdges: [],
        removedEdgeIds: [],
        success: false,
        error: 'Original edge not found',
      }
    }

    // Create new edges: source -> inserted -> target
    const newEdges = [
      createEdge(sourceNodeId, insertedNodeId, {
        sourceHandle: originalEdge.sourceHandle,
        animated: originalEdge.animated,
        style: originalEdge.style,
      }),
      createEdge(insertedNodeId, targetNodeId, {
        targetHandle: originalEdge.targetHandle,
        animated: originalEdge.animated,
        style: originalEdge.style,
      }),
    ]

    return {
      newEdges,
      removedEdgeIds: [originalEdge.id],
      success: true,
    }
  } catch (error) {
    return {
      newEdges: [],
      removedEdgeIds: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Reroutes edges when adding a node above an existing node
 * This moves incoming connections to the new node
 */
export function rerouteEdgesForAboveInsertion(
  newNodeId: string,
  existingNodeId: string,
  existingEdges: WorkflowEdge[]
): EdgeCreationResult {
  try {
    const { incoming } = findNodeConnections(existingNodeId, existingEdges)
    
    // Create new edges pointing to the new node instead
    const newEdges: WorkflowEdge[] = []
    const removedEdgeIds: string[] = []

    // Reroute all incoming edges to the new node
    for (const incomingEdge of incoming) {
      // Create new edge from original source to new node
      newEdges.push(
        createEdge(incomingEdge.source, newNodeId, {
          sourceHandle: incomingEdge.sourceHandle,
          animated: incomingEdge.animated,
          style: incomingEdge.style,
        })
      )
      removedEdgeIds.push(incomingEdge.id)
    }

    // Create edge from new node to existing node
    newEdges.push(createEdge(newNodeId, existingNodeId))

    return {
      newEdges,
      removedEdgeIds,
      success: true,
    }
  } catch (error) {
    return {
      newEdges: [],
      removedEdgeIds: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Creates edge for adding a node below an existing node
 */
export function createEdgeForBelowInsertion(
  parentNodeId: string,
  newNodeId: string
): EdgeCreationResult {
  try {
    const newEdges = [createEdge(parentNodeId, newNodeId)]
    
    return {
      newEdges,
      removedEdgeIds: [],
      success: true,
    }
  } catch (error) {
    return {
      newEdges: [],
      removedEdgeIds: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Validates edge connections to prevent invalid configurations
 */
export function validateEdgeConnections(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Create node lookup for efficiency
  const nodeMap = new Map(nodes.map(node => [node.id, node]))

  for (const edge of edges) {
    const sourceNode = nodeMap.get(edge.source)
    const targetNode = nodeMap.get(edge.target)

    // Check if source and target nodes exist
    if (!sourceNode) {
      errors.push(`Edge ${edge.id} references non-existent source node: ${edge.source}`)
      continue
    }
    if (!targetNode) {
      errors.push(`Edge ${edge.id} references non-existent target node: ${edge.target}`)
      continue
    }

    // Validate node type specific rules
    if (sourceNode.data.variant === 'end') {
      errors.push(`End node ${sourceNode.id} cannot be a source node`)
    }

    if (targetNode.data.variant === 'end' && 
        findNodeConnections(targetNode.id, edges).incoming.length > 1) {
      warnings.push(`End node ${targetNode.id} has multiple incoming connections`)
    }

    // Check for self-loops
    if (edge.source === edge.target) {
      errors.push(`Self-loop detected in edge ${edge.id}`)
    }

    // Check branch handle validity
    if (edge.sourceHandle && sourceNode.data.variant === 'branch') {
      const branches = sourceNode.data.branches || []
      const validHandles = branches.map(b => b.id)
      if (!validHandles.includes(edge.sourceHandle)) {
        errors.push(`Invalid branch handle ${edge.sourceHandle} on node ${sourceNode.id}`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Detects circular dependencies in the workflow
 */
export function detectCircularDependencies(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): {
  hasCircularDependency: boolean
  cycles: string[][]
} {
  const nodeMap = new Map(nodes.map(node => [node.id, node]))
  const visited = new Set<string>()
  const recursionStack = new Set<string>()
  const cycles: string[][] = []

  function dfs(nodeId: string, path: string[]): boolean {
    if (recursionStack.has(nodeId)) {
      // Found cycle - extract the cycle from the path
      const cycleStart = path.indexOf(nodeId)
      if (cycleStart !== -1) {
        cycles.push(path.slice(cycleStart).concat(nodeId))
      }
      return true
    }

    if (visited.has(nodeId)) {
      return false
    }

    visited.add(nodeId)
    recursionStack.add(nodeId)
    path.push(nodeId)

    // Visit all adjacent nodes
    const outgoingEdges = edges.filter(edge => edge.source === nodeId)
    for (const edge of outgoingEdges) {
      if (dfs(edge.target, [...path])) {
        // Don't return immediately, continue to find all cycles
      }
    }

    recursionStack.delete(nodeId)
    path.pop()
    return false
  }

  // Check for cycles starting from each unvisited node
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      dfs(node.id, [])
    }
  }

  return {
    hasCircularDependency: cycles.length > 0,
    cycles,
  }
}

/**
 * Gets all possible paths from one node to another
 */
export function findPathsBetweenNodes(
  sourceNodeId: string,
  targetNodeId: string,
  edges: WorkflowEdge[],
  maxDepth: number = 10
): string[][] {
  const paths: string[][] = []
  
  function dfs(currentNodeId: string, currentPath: string[], depth: number) {
    if (depth > maxDepth) return
    
    if (currentNodeId === targetNodeId) {
      paths.push([...currentPath, currentNodeId])
      return
    }
    
    const outgoingEdges = edges.filter(edge => edge.source === currentNodeId)
    for (const edge of outgoingEdges) {
      if (!currentPath.includes(edge.target)) { // Avoid cycles
        dfs(edge.target, [...currentPath, currentNodeId], depth + 1)
      }
    }
  }
  
  dfs(sourceNodeId, [], 0)
  return paths
}

/**
 * Removes all edges connected to a specific node
 */
export function getEdgesToRemoveForNode(
  nodeId: string,
  edges: WorkflowEdge[]
): string[] {
  const { all } = findNodeConnections(nodeId, edges)
  return all.map(edge => edge.id)
}

/**
 * Updates edge endpoints when a node is moved or changed
 */
export function updateEdgeEndpoints(
  edges: WorkflowEdge[],
  nodeUpdates: Map<string, { newId?: string; removed?: boolean }>
): WorkflowEdge[] {
  return edges
    .filter(edge => {
      const sourceUpdate = nodeUpdates.get(edge.source)
      const targetUpdate = nodeUpdates.get(edge.target)
      
      // Remove edge if either node was removed
      return !(sourceUpdate?.removed || targetUpdate?.removed)
    })
    .map(edge => ({
      ...edge,
      source: nodeUpdates.get(edge.source)?.newId || edge.source,
      target: nodeUpdates.get(edge.target)?.newId || edge.target,
    }))
}

/**
 * Optimizes edge layout by removing redundant edges
 */
export function optimizeEdgeLayout(edges: WorkflowEdge[]): WorkflowEdge[] {
  const edgeMap = new Map<string, WorkflowEdge>()
  
  // Remove duplicate edges (same source and target)
  for (const edge of edges) {
    const key = `${edge.source}-${edge.target}-${edge.sourceHandle || 'default'}`
    
    if (!edgeMap.has(key)) {
      edgeMap.set(key, edge)
    }
  }
  
  return Array.from(edgeMap.values())
}