/**
 * Automatic Node Repositioning System
 * 
 * This module provides intelligent repositioning of workflow nodes to prevent 
 * overlapping when new nodes are inserted into existing flows.
 */

import type { WorkflowNode, WorkflowEdge } from '@/server/api/routers/projectAgentWorkflow'
import { POSITIONING_CONFIG } from './workflowPositioning'

export interface RepositioningOptions {
  /** Vertical spacing between nodes */
  verticalSpacing?: number
  /** Horizontal spacing for branches */
  horizontalSpacing?: number
  /** Whether to animate the repositioning */
  animate?: boolean
  /** Minimum movement threshold to avoid micro-adjustments */
  minimumMovement?: number
}

export interface RepositioningResult {
  /** Nodes that were moved with their new positions */
  movedNodes: Array<{
    nodeId: string
    oldPosition: { x: number; y: number }
    newPosition: { x: number; y: number }
  }>
  /** Total number of nodes affected */
  affectedNodeCount: number
  /** Whether any repositioning was needed */
  repositioningApplied: boolean
}

/**
 * Default repositioning configuration
 */
const DEFAULT_REPOSITIONING_OPTIONS: Required<RepositioningOptions> = {
  verticalSpacing: 120,
  horizontalSpacing: 250,
  animate: true,
  minimumMovement: 10
}

/**
 * Pushes nodes down when a new node is inserted at a specific Y position
 */
export function pushNodesDown(
  insertionPosition: { x: number; y: number },
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  options: RepositioningOptions = {}
): RepositioningResult {
  const config = { ...DEFAULT_REPOSITIONING_OPTIONS, ...options }
  const movedNodes: RepositioningResult['movedNodes'] = []
  
  // Find all nodes that are at or below the insertion Y position
  const nodesToMove = nodes.filter(node => {
    // Only move nodes that are at or below the insertion point
    return node.position.y >= insertionPosition.y
  })

  if (nodesToMove.length === 0) {
    return {
      movedNodes: [],
      affectedNodeCount: 0,
      repositioningApplied: false
    }
  }

  // Calculate new positions for nodes that need to be moved
  nodesToMove.forEach(node => {
    const newY = node.position.y + config.verticalSpacing
    const movement = Math.abs(newY - node.position.y)
    
    // Only move if movement is significant enough
    if (movement >= config.minimumMovement) {
      movedNodes.push({
        nodeId: node.id,
        oldPosition: { ...node.position },
        newPosition: { x: node.position.x, y: newY }
      })
    }
  })

  return {
    movedNodes,
    affectedNodeCount: movedNodes.length,
    repositioningApplied: movedNodes.length > 0
  }
}

/**
 * Intelligent repositioning that follows the flow structure
 * This function analyzes the workflow structure and repositions nodes
 * while maintaining the logical flow relationships
 */
export function repositionFlowNodes(
  insertedNodeId: string,
  insertionPosition: { x: number; y: number },
  parentNodeId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  options: RepositioningOptions = {}
): RepositioningResult {
  const config = { ...DEFAULT_REPOSITIONING_OPTIONS, ...options }
  const movedNodes: RepositioningResult['movedNodes'] = []

  // Build a map of node relationships
  const nodeChildren = buildNodeChildrenMap(edges)
  
  // Find all nodes that should be moved down
  const nodesToRepositionDown = findNodesToRepositionDown(
    parentNodeId,
    insertionPosition,
    nodes,
    nodeChildren
  )

  // Calculate new positions for nodes that need to be moved down
  nodesToRepositionDown.forEach(node => {
    const newY = node.position.y + config.verticalSpacing
    const movement = Math.abs(newY - node.position.y)
    
    // Only move if movement is significant enough
    if (movement >= config.minimumMovement) {
      movedNodes.push({
        nodeId: node.id,
        oldPosition: { ...node.position },
        newPosition: { x: node.position.x, y: newY }
      })
    }
  })

  return {
    movedNodes,
    affectedNodeCount: movedNodes.length,
    repositioningApplied: movedNodes.length > 0
  }
}

/**
 * Build a map of parent -> children relationships
 */
function buildNodeChildrenMap(edges: WorkflowEdge[]): Map<string, string[]> {
  const childrenMap = new Map<string, string[]>()
  
  edges.forEach(edge => {
    if (!childrenMap.has(edge.source)) {
      childrenMap.set(edge.source, [])
    }
    childrenMap.get(edge.source)!.push(edge.target)
  })
  
  return childrenMap
}

/**
 * Find all nodes that need to be repositioned down when a new node is inserted
 */
function findNodesToRepositionDown(
  parentNodeId: string,
  insertionPosition: { x: number; y: number },
  nodes: WorkflowNode[],
  nodeChildren: Map<string, string[]>
): WorkflowNode[] {
  const nodesToMove: WorkflowNode[] = []
  const visited = new Set<string>()

  // Get all children of the parent node (these are the nodes that will be pushed down)
  const childrenIds = nodeChildren.get(parentNodeId) || []
  
  // Recursively collect all descendant nodes that need to be moved
  function collectDescendants(nodeId: string) {
    if (visited.has(nodeId)) return
    visited.add(nodeId)
    
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return

    // Add this node to the list of nodes to move
    nodesToMove.push(node)
    
    // Recursively process children
    const children = nodeChildren.get(nodeId) || []
    children.forEach(childId => collectDescendants(childId))
  }

  // Start with immediate children of the parent
  childrenIds.forEach(childId => collectDescendants(childId))

  return nodesToMove
}

/**
 * Optimized repositioning for large workflows
 * Uses spatial partitioning to improve performance
 */
export function repositionWithSpatialOptimization(
  insertionPosition: { x: number; y: number },
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  options: RepositioningOptions = {}
): RepositioningResult {
  const config = { ...DEFAULT_REPOSITIONING_OPTIONS, ...options }
  
  // For large workflows (>100 nodes), use spatial partitioning
  if (nodes.length > 100) {
    return repositionWithSpatialPartitioning(insertionPosition, nodes, edges, config)
  }
  
  // For smaller workflows, use simple repositioning
  return pushNodesDown(insertionPosition, nodes, edges, config)
}

/**
 * Spatial partitioning approach for large workflows
 */
function repositionWithSpatialPartitioning(
  insertionPosition: { x: number; y: number },
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  config: Required<RepositioningOptions>
): RepositioningResult {
  // Divide the canvas into spatial regions
  const regionSize = 500 // 500px regions
  const insertionRegionY = Math.floor(insertionPosition.y / regionSize)
  
  // Only consider nodes in regions at or below the insertion point
  const relevantNodes = nodes.filter(node => {
    const nodeRegionY = Math.floor(node.position.y / regionSize)
    return nodeRegionY >= insertionRegionY
  })
  
  return pushNodesDown(insertionPosition, relevantNodes, edges, config)
}

/**
 * Apply repositioning results to the actual workflow nodes
 * This function should be used by the context to actually update node positions
 */
export function applyRepositioning(
  nodes: WorkflowNode[],
  repositioningResult: RepositioningResult
): WorkflowNode[] {
  if (!repositioningResult.repositioningApplied) {
    return nodes
  }

  // Create a map of nodeId -> newPosition for quick lookup
  const positionUpdates = new Map<string, { x: number; y: number }>()
  repositioningResult.movedNodes.forEach(moved => {
    positionUpdates.set(moved.nodeId, moved.newPosition)
  })

  // Update positions
  return nodes.map(node => {
    const newPosition = positionUpdates.get(node.id)
    if (newPosition) {
      return {
        ...node,
        position: newPosition
      }
    }
    return node
  })
}

/**
 * Utility to check if repositioning is needed at a specific position
 */
export function needsRepositioning(
  position: { x: number; y: number },
  nodes: WorkflowNode[],
  threshold: number = 60 // 60px collision threshold
): boolean {
  return nodes.some(node => {
    const distance = Math.abs(node.position.y - position.y)
    return distance < threshold
  })
}

/**
 * Preview repositioning changes without applying them
 * Useful for showing users what will happen before committing to the change
 */
export function previewRepositioning(
  insertionPosition: { x: number; y: number },
  parentNodeId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  options: RepositioningOptions = {}
): {
  preview: RepositioningResult
  wouldAffectNodes: number
  estimatedSpaceCreated: number
} {
  const preview = repositionFlowNodes(
    'preview-node', 
    insertionPosition, 
    parentNodeId, 
    nodes, 
    edges, 
    options
  )
  
  const config = { ...DEFAULT_REPOSITIONING_OPTIONS, ...options }
  
  return {
    preview,
    wouldAffectNodes: preview.affectedNodeCount,
    estimatedSpaceCreated: config.verticalSpacing
  }
}