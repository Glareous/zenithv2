/**
 * Simple Node Spacing Utility
 * 
 * Provides consistent spacing between workflow nodes regardless of their height.
 * Designed to avoid infinite loops through careful state management and debouncing.
 */

import type { WorkflowNode, WorkflowEdge } from '@src/server/api/routers/projectAgentWorkflow'

// Configuration for node spacing
export interface NodeSpacingConfig {
  minimumGap: number // Minimum space between nodes (default: 30px)
  useActualHeight: boolean // Whether to measure real DOM height
  fallbackHeight: number // Fallback height when measurement fails
  debounceMs: number // Debounce time for batch updates
}

export const DEFAULT_SPACING_CONFIG: NodeSpacingConfig = {
  minimumGap: 30,
  useActualHeight: true,
  fallbackHeight: 160,
  debounceMs: 150,
}

// Height mapping for different node variants (prevents DOM queries)
export const NODE_HEIGHT_ESTIMATES = {
  default: 160,
  step: 160,
  branch: 140,
  end: 120,
  jump: 130,
} as const

// Track nodes being processed to prevent infinite recursion
const processingNodes = new Set<string>()
let debounceTimer: NodeJS.Timeout | null = null

/**
 * Gets the estimated or actual height of a node
 * Uses DOM measurement only if specifically enabled and not in processing state
 */
export function getNodeHeight(
  node: WorkflowNode,
  config: NodeSpacingConfig = DEFAULT_SPACING_CONFIG
): number {
  // Prevent recursive calls
  if (processingNodes.has(node.id)) {
    return NODE_HEIGHT_ESTIMATES[node.data.variant] || config.fallbackHeight
  }

  // Use variant-based estimate (fastest, no DOM access)
  const estimatedHeight = NODE_HEIGHT_ESTIMATES[node.data.variant] || config.fallbackHeight

  // Only measure DOM if explicitly enabled and safe to do so
  if (config.useActualHeight && typeof window !== 'undefined') {
    try {
      const nodeElement = document.querySelector(`[data-id="${node.id}"]`) as HTMLElement
      if (nodeElement) {
        const rect = nodeElement.getBoundingClientRect()
        if (rect.height > 0) {
          return Math.max(estimatedHeight, rect.height)
        }
      }
    } catch (error) {
      console.warn('Failed to measure node height:', error)
    }
  }

  return estimatedHeight
}

/**
 * Calculate the Y position for a node to maintain consistent spacing
 * This is the core function that replaces hardcoded 190px spacing
 */
export function calculateConsistentSpacing(
  previousNode: WorkflowNode,
  config: NodeSpacingConfig = DEFAULT_SPACING_CONFIG
): number {
  const previousHeight = getNodeHeight(previousNode, config)
  return previousNode.position.y + previousHeight + config.minimumGap
}

/**
 * Find all nodes that come after a given node in the vertical flow
 * This helps identify which nodes need repositioning
 */
export function getVerticalNodeChain(
  startNodeId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowNode[] {
  const visited = new Set<string>()
  const chain: WorkflowNode[] = []
  
  function traverse(nodeId: string) {
    if (visited.has(nodeId)) return
    visited.add(nodeId)
    
    // Find outgoing edges from this node
    const outgoingEdges = edges.filter(edge => edge.source === nodeId)
    
    for (const edge of outgoingEdges) {
      const targetNode = nodes.find(n => n.id === edge.target)
      if (targetNode) {
        chain.push(targetNode)
        traverse(targetNode.id)
      }
    }
  }
  
  traverse(startNodeId)
  return chain
}

/**
 * Calculate new positions for a chain of nodes with consistent spacing
 * Returns only the nodes that actually need position updates
 */
export function calculateChainRepositioning(
  changedNodeId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  config: NodeSpacingConfig = DEFAULT_SPACING_CONFIG
): Array<{ nodeId: string; newPosition: { x: number; y: number } }> {
  // Prevent infinite recursion
  if (processingNodes.has(changedNodeId)) {
    return []
  }

  const changedNode = nodes.find(n => n.id === changedNodeId)
  if (!changedNode) return []

  const chain = getVerticalNodeChain(changedNodeId, nodes, edges)
  const updates: Array<{ nodeId: string; newPosition: { x: number; y: number } }> = []
  
  let previousNode = changedNode
  
  for (const node of chain) {
    const expectedY = calculateConsistentSpacing(previousNode, config)
    
    // Only update if position actually needs to change (avoid unnecessary re-renders)
    if (Math.abs(node.position.y - expectedY) > 1) { // 1px tolerance
      updates.push({
        nodeId: node.id,
        newPosition: {
          x: node.position.x, // Keep X position unchanged
          y: expectedY,
        },
      })
    }
    
    previousNode = node
  }
  
  return updates
}

/**
 * Debounced batch update function to prevent excessive re-calculations
 * This is the main function to be called from the context
 */
export function scheduleSpacingUpdate(
  changedNodeId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  updateCallback: (updates: Array<{ nodeId: string; newPosition: { x: number; y: number } }>) => void,
  config: NodeSpacingConfig = DEFAULT_SPACING_CONFIG
): void {
  // Clear existing timer
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  
  // Mark node as being processed
  processingNodes.add(changedNodeId)
  
  debounceTimer = setTimeout(() => {
    try {
      const updates = calculateChainRepositioning(changedNodeId, nodes, edges, config)
      
      if (updates.length > 0) {
        updateCallback(updates)
      }
    } catch (error) {
      console.error('Error in spacing update:', error)
    } finally {
      // Always clean up processing state
      processingNodes.delete(changedNodeId)
      debounceTimer = null
    }
  }, config.debounceMs)
}

/**
 * Calculate position for a new node to be added after an existing node
 * This replaces the hardcoded `parentNode.position.y + 190` logic
 */
export function calculateNewNodePosition(
  parentNode: WorkflowNode,
  config: NodeSpacingConfig = DEFAULT_SPACING_CONFIG
): { x: number; y: number } {
  return {
    x: parentNode.position.x, // Keep same X coordinate for vertical alignment
    y: calculateConsistentSpacing(parentNode, config),
  }
}

/**
 * Utility to clean up any ongoing operations (call on unmount)
 */
export function cleanupSpacingOperations(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
  processingNodes.clear()
}

/**
 * Hook-safe function to get current spacing configuration
 * Can be customized per workflow or component
 */
export function createSpacingConfig(overrides?: Partial<NodeSpacingConfig>): NodeSpacingConfig {
  return {
    ...DEFAULT_SPACING_CONFIG,
    ...overrides,
  }
}