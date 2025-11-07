/**
 * Workflow Positioning Utilities
 *
 * This file contains utilities for calculating optimal positions for new workflow nodes,
 * handling collision detection, and managing branch-specific positioning logic.
 */
import type {
  WorkflowEdge,
  WorkflowNode,
} from '@src/server/api/routers/projectAgentWorkflow'

// Configuration constants
export const POSITIONING_CONFIG = {
  spacing: {
    vertical: 120,
    horizontal: 200,
    branchHorizontal: 250,
  },
  gridSnap: 15,
  minSpacing: {
    horizontal: 100,
    vertical: 80,
  },
  nodeSize: {
    width: 300,
    height: 120,
  },
  branchOffset: {
    left: -125,
    right: 125,
  },
} as const

// Position calculation options
export interface PositionCalculationOptions {
  spacing?: { vertical: number; horizontal: number }
  gridSnap?: boolean
  avoidCollisions?: boolean
  viewportBounds?: { x: number; y: number; width: number; height: number }
}

// Branch connection metadata
export interface BranchConnection {
  id: string
  parentNodeId: string
  branchId: string
  branchIndex: number
  handleId: string
  targetNodeId?: string
}

// Position calculation result
export interface PositionResult {
  x: number
  y: number
  hasCollision: boolean
  adjustedFromOriginal: boolean
}

/**
 * Snaps a position to the grid based on configuration
 */
export function snapToGrid(position: { x: number; y: number }): {
  x: number
  y: number
} {
  const { gridSnap } = POSITIONING_CONFIG
  return {
    x: Math.round(position.x / gridSnap) * gridSnap,
    y: Math.round(position.y / gridSnap) * gridSnap,
  }
}

/**
 * Checks if two nodes would collide based on their positions and sizes
 */
export function wouldCollide(
  pos1: { x: number; y: number },
  pos2: { x: number; y: number },
  margin: number = 20
): boolean {
  // Handle undefined positions
  if (
    !pos1 ||
    !pos2 ||
    pos1.x === undefined ||
    pos1.y === undefined ||
    pos2.x === undefined ||
    pos2.y === undefined
  ) {
    return false
  }

  const { nodeSize } = POSITIONING_CONFIG

  const distance = {
    x: Math.abs(pos1.x - pos2.x),
    y: Math.abs(pos1.y - pos2.y),
  }

  return (
    distance.x < nodeSize.width + margin &&
    distance.y < nodeSize.height + margin
  )
}

/**
 * Detects collisions with existing nodes for a proposed position
 */
export function detectPositionCollisions(
  newPosition: { x: number; y: number },
  existingNodes: WorkflowNode[],
  minSpacing: number = 20
): WorkflowNode[] {
  return existingNodes.filter((node) =>
    wouldCollide(newPosition, node.position, minSpacing)
  )
}

/**
 * Resolves position collisions by finding the nearest available position
 */
export function resolvePositionCollisions(
  preferredPosition: { x: number; y: number },
  existingNodes: WorkflowNode[],
  options: PositionCalculationOptions = {}
): PositionResult {
  const { spacing = POSITIONING_CONFIG.spacing, gridSnap = true } = options

  let candidatePosition = preferredPosition
  let hasCollision = false
  let adjustedFromOriginal = false

  // Check initial position
  const initialCollisions = detectPositionCollisions(
    candidatePosition,
    existingNodes
  )
  if (initialCollisions.length === 0) {
    return {
      ...snapToGrid(candidatePosition),
      hasCollision: false,
      adjustedFromOriginal: false,
    }
  }

  hasCollision = true

  // Try positions in expanding spiral pattern
  const maxAttempts = 20
  const directions = [
    { x: 0, y: spacing.vertical }, // down
    { x: spacing.horizontal, y: 0 }, // right
    { x: 0, y: -spacing.vertical }, // up
    { x: -spacing.horizontal, y: 0 }, // left
    { x: spacing.horizontal, y: spacing.vertical }, // diagonal down-right
    { x: -spacing.horizontal, y: spacing.vertical }, // diagonal down-left
    { x: spacing.horizontal, y: -spacing.vertical }, // diagonal up-right
    { x: -spacing.horizontal, y: -spacing.vertical }, // diagonal up-left
  ]

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    for (const direction of directions) {
      const testPosition = {
        x: preferredPosition.x + direction.x * attempt,
        y: preferredPosition.y + direction.y * attempt,
      }

      const collisions = detectPositionCollisions(testPosition, existingNodes)
      if (collisions.length === 0) {
        candidatePosition = testPosition
        adjustedFromOriginal = true
        break
      }
    }

    if (adjustedFromOriginal) break
  }

  return {
    ...(gridSnap ? snapToGrid(candidatePosition) : candidatePosition),
    hasCollision: adjustedFromOriginal ? false : hasCollision,
    adjustedFromOriginal,
  }
}

/**
 * Calculates position for a new node above a parent node
 */
export function calculateAbovePosition(
  parentNode: WorkflowNode,
  existingNodes: WorkflowNode[],
  options: PositionCalculationOptions = {}
): PositionResult {
  const { spacing = POSITIONING_CONFIG.spacing } = options

  const preferredPosition = {
    x: parentNode.position.x,
    y: parentNode.position.y - spacing.vertical,
  }

  return resolvePositionCollisions(preferredPosition, existingNodes, options)
}

/**
 * Calculates position for a new node below a parent node
 */
export function calculateBelowPosition(
  parentNode: WorkflowNode,
  existingNodes: WorkflowNode[],
  options: PositionCalculationOptions = {}
): PositionResult {
  const { spacing = POSITIONING_CONFIG.spacing } = options

  const preferredPosition = {
    x: parentNode.position.x,
    y: parentNode.position.y + spacing.vertical,
  }

  return resolvePositionCollisions(preferredPosition, existingNodes, options)
}

/**
 * Calculates position for a branch node connection
 */
export function calculateBranchPosition(
  parentNode: WorkflowNode,
  branchIndex: number,
  totalBranches: number,
  existingNodes: WorkflowNode[],
  options: PositionCalculationOptions = {}
): PositionResult {
  const { spacing = POSITIONING_CONFIG.spacing } = options

  // Calculate horizontal offset based on branch index
  let horizontalOffset: number

  if (totalBranches === 1) {
    horizontalOffset = spacing.horizontal
  } else if (totalBranches === 2) {
    horizontalOffset =
      branchIndex === 0
        ? POSITIONING_CONFIG.branchOffset.left
        : POSITIONING_CONFIG.branchOffset.right
  } else {
    // For more than 2 branches, distribute them evenly
    const spreadWidth = spacing.horizontal * 2
    const branchSpacing = spreadWidth / (totalBranches - 1)
    horizontalOffset = -spacing.horizontal + branchSpacing * branchIndex
  }

  const preferredPosition = {
    x: parentNode.position.x + horizontalOffset,
    y: parentNode.position.y + spacing.vertical,
  }

  return resolvePositionCollisions(preferredPosition, existingNodes, options)
}

/**
 * Calculates position for inserting a node between two connected nodes
 */
export function calculateInsertPosition(
  sourceNode: WorkflowNode,
  targetNode: WorkflowNode,
  existingNodes: WorkflowNode[],
  options: PositionCalculationOptions = {}
): PositionResult {
  // Position the new node at the midpoint between source and target
  const preferredPosition = {
    x: (sourceNode.position.x + targetNode.position.x) / 2,
    y: (sourceNode.position.y + targetNode.position.y) / 2,
  }

  return resolvePositionCollisions(preferredPosition, existingNodes, options)
}

/**
 * Finds nodes that are connected to a specific node
 */
export function findNodeConnections(
  nodeId: string,
  edges: WorkflowEdge[]
): {
  incoming: WorkflowEdge[]
  outgoing: WorkflowEdge[]
  all: WorkflowEdge[]
} {
  const incoming = edges.filter((edge) => edge.target === nodeId)
  const outgoing = edges.filter((edge) => edge.source === nodeId)

  return {
    incoming,
    outgoing,
    all: [...incoming, ...outgoing],
  }
}

/**
 * Gets the parent nodes (nodes that connect to this node)
 */
export function getParentNodes(
  nodeId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowNode[] {
  const parentEdges = edges.filter((edge) => edge.target === nodeId)
  const parentIds = parentEdges.map((edge) => edge.source)

  return nodes.filter((node) => parentIds.includes(node.id))
}

/**
 * Gets the child nodes (nodes that this node connects to)
 */
export function getChildNodes(
  nodeId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowNode[] {
  const childEdges = edges.filter((edge) => edge.source === nodeId)
  const childIds = childEdges.map((edge) => edge.target)

  return nodes.filter((node) => childIds.includes(node.id))
}

/**
 * Validates that a position is within viewport bounds (if provided)
 */
export function validateViewportBounds(
  position: { x: number; y: number },
  bounds?: { x: number; y: number; width: number; height: number }
): boolean {
  if (!bounds) return true

  const { nodeSize } = POSITIONING_CONFIG

  return (
    position.x >= bounds.x &&
    position.y >= bounds.y &&
    position.x + nodeSize.width <= bounds.x + bounds.width &&
    position.y + nodeSize.height <= bounds.y + bounds.height
  )
}

/**
 * Gets optimal position for adding a node after an existing node
 * This is the main function that handles most common cases
 */
export function getOptimalPositionAfterNode(
  parentNode: WorkflowNode,
  existingNodes: WorkflowNode[],
  edges: WorkflowEdge[],
  options: PositionCalculationOptions = {}
): PositionResult {
  // Check if parent node has any children
  const childNodes = getChildNodes(parentNode.id, existingNodes, edges)

  if (childNodes.length === 0) {
    // No children, position below parent
    return calculateBelowPosition(parentNode, existingNodes, options)
  }

  // Has children, position above parent and reroute connections
  return calculateAbovePosition(parentNode, existingNodes, options)
}

/**
 * Calculates the center point of a group of nodes
 */
export function calculateNodesCenter(nodes: WorkflowNode[]): {
  x: number
  y: number
} {
  if (nodes.length === 0) return { x: 0, y: 0 }

  const sumX = nodes.reduce((sum, node) => sum + node.position.x, 0)
  const sumY = nodes.reduce((sum, node) => sum + node.position.y, 0)

  return {
    x: sumX / nodes.length,
    y: sumY / nodes.length,
  }
}

/**
 * Gets a suitable default position for a new workflow (first node)
 */
export function getDefaultStartPosition(): { x: number; y: number } {
  return snapToGrid({ x: 270, y: 120 })
}
