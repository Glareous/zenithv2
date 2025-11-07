/**
 * Enhanced Collision Detection System for React Flow
 * 
 * This module provides intelligent collision detection and positioning
 * algorithms for workflow nodes with spatial optimization and real-time feedback.
 */

import type { WorkflowNode } from '@src/server/api/routers/projectAgentWorkflow'
import { POSITIONING_CONFIG } from './workflowPositioning'

// Configuration for collision detection system
export interface CollisionDetectionConfig {
  // Detection sensitivity
  detectionMode: 'strict' | 'relaxed' | 'adaptive'
  
  // Node dimensions with padding
  nodeBuffer: {
    horizontal: number // 20px default
    vertical: number   // 15px default
  }
  
  // Grid-based optimization
  gridCellSize: number // 150px for spatial hashing
  
  // Performance thresholds
  performanceThresholds: {
    realTimeDetectionLimit: number // 50 nodes
    spatialIndexThreshold: number  // 100 nodes
  }
  
  // Positioning preferences
  positioning: {
    preferredDirection: 'vertical' | 'horizontal' | 'both'
    maxSearchRadius: number // 500px
    maxAttempts: number     // 25 attempts
  }
}

// Default configuration
export const DEFAULT_COLLISION_CONFIG: CollisionDetectionConfig = {
  detectionMode: 'adaptive',
  nodeBuffer: {
    horizontal: 20,
    vertical: 15
  },
  gridCellSize: 150,
  performanceThresholds: {
    realTimeDetectionLimit: 50,
    spatialIndexThreshold: 100
  },
  positioning: {
    preferredDirection: 'both',
    maxSearchRadius: 500,
    maxAttempts: 25
  }
}

// Collision detection result
export interface CollisionResult {
  hasCollision: boolean
  collidingNodes: WorkflowNode[]
  severity: 'none' | 'minor' | 'major' | 'critical'
  recommendedAction?: 'adjust' | 'reposition' | 'warn'
}

// Position with collision metadata
export interface SmartPositionResult {
  x: number
  y: number
  hasCollision: boolean
  adjustedFromOriginal: boolean
  collisionResult: CollisionResult
  score: number // Quality score for position (0-100)
  alternatives?: SmartPositionResult[] // Alternative positions
}

/**
 * Enhanced spatial hash grid for O(k) collision detection performance
 * instead of O(n) naive checking
 */
export class SpatialHashGrid {
  private grid: Map<string, Set<string>> = new Map()
  private nodePositions: Map<string, { x: number; y: number }> = new Map()
  private config: CollisionDetectionConfig

  constructor(config: CollisionDetectionConfig = DEFAULT_COLLISION_CONFIG) {
    this.config = config
  }

  /**
   * Add node to spatial grid
   */
  addNode(nodeId: string, position: { x: number; y: number }): void {
    this.nodePositions.set(nodeId, position)
    
    const gridKeys = this.getGridKeysForPosition(position)
    for (const key of gridKeys) {
      if (!this.grid.has(key)) {
        this.grid.set(key, new Set())
      }
      this.grid.get(key)!.add(nodeId)
    }
  }

  /**
   * Remove node from spatial grid
   */
  removeNode(nodeId: string): void {
    const position = this.nodePositions.get(nodeId)
    if (!position) return

    const gridKeys = this.getGridKeysForPosition(position)
    for (const key of gridKeys) {
      this.grid.get(key)?.delete(nodeId)
      
      // Clean up empty grid cells
      if (this.grid.get(key)?.size === 0) {
        this.grid.delete(key)
      }
    }
    
    this.nodePositions.delete(nodeId)
  }

  /**
   * Update node position in spatial grid
   */
  updateNode(nodeId: string, newPosition: { x: number; y: number }): void {
    this.removeNode(nodeId)
    this.addNode(nodeId, newPosition)
  }

  /**
   * Get potential collision candidates for position
   * Returns only nodes in nearby grid cells for efficiency
   */
  getPotentialCollisions(position: { x: number; y: number }, excludeNodes: string[] = []): string[] {
    const gridKeys = this.getGridKeysForPosition(position)
    const candidates = new Set<string>()

    for (const key of gridKeys) {
      const cellNodes = this.grid.get(key)
      if (cellNodes) {
        for (const nodeId of cellNodes) {
          if (!excludeNodes.includes(nodeId)) {
            candidates.add(nodeId)
          }
        }
      }
    }

    return Array.from(candidates)
  }

  /**
   * Build spatial grid from existing nodes
   */
  buildFromNodes(nodes: WorkflowNode[]): void {
    this.clear()
    for (const node of nodes) {
      this.addNode(node.id, node.position)
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.grid.clear()
    this.nodePositions.clear()
  }

  /**
   * Get grid keys that a position with node dimensions would occupy
   */
  private getGridKeysForPosition(position: { x: number; y: number }): string[] {
    const { gridCellSize } = this.config
    const { nodeSize } = POSITIONING_CONFIG
    const { nodeBuffer } = this.config

    // Calculate grid cells this node + buffer would occupy
    const startX = Math.floor((position.x - nodeBuffer.horizontal) / gridCellSize)
    const endX = Math.floor((position.x + nodeSize.width + nodeBuffer.horizontal) / gridCellSize)
    const startY = Math.floor((position.y - nodeBuffer.vertical) / gridCellSize)
    const endY = Math.floor((position.y + nodeSize.height + nodeBuffer.vertical) / gridCellSize)

    const keys: string[] = []
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        keys.push(`${x},${y}`)
      }
    }
    return keys
  }
}

/**
 * Enhanced collision detector with spatial optimization
 */
export class SmartCollisionDetector {
  private spatialGrid: SpatialHashGrid
  private config: CollisionDetectionConfig
  private nodes: WorkflowNode[] = []

  constructor(config: CollisionDetectionConfig = DEFAULT_COLLISION_CONFIG) {
    this.config = config
    this.spatialGrid = new SpatialHashGrid(config)
  }

  /**
   * Update the detector with current nodes
   */
  updateNodes(nodes: WorkflowNode[]): void {
    this.nodes = nodes
    this.spatialGrid.buildFromNodes(nodes)
  }

  /**
   * Real-time collision detection for a position
   */
  detectCollisionAtPosition(
    position: { x: number; y: number },
    excludeNodes: string[] = []
  ): CollisionResult {
    // Use spatial grid for performance optimization
    const candidateNodeIds = this.spatialGrid.getPotentialCollisions(position, excludeNodes)
    const collidingNodes: WorkflowNode[] = []

    // Precise collision detection for candidate nodes
    for (const nodeId of candidateNodeIds) {
      const node = this.nodes.find(n => n.id === nodeId)
      if (node && this.wouldCollideWithNode(position, node)) {
        collidingNodes.push(node)
      }
    }

    // Calculate collision severity
    const severity = this.calculateCollisionSeverity(position, collidingNodes)

    return {
      hasCollision: collidingNodes.length > 0,
      collidingNodes,
      severity,
      recommendedAction: this.getRecommendedAction(severity)
    }
  }

  /**
   * Check if a position would collide with a specific node
   */
  private wouldCollideWithNode(
    position: { x: number; y: number },
    node: WorkflowNode
  ): boolean {
    const { nodeSize } = POSITIONING_CONFIG
    const { nodeBuffer } = this.config

    // Calculate bounds with buffer
    const pos1 = {
      left: position.x - nodeBuffer.horizontal,
      right: position.x + nodeSize.width + nodeBuffer.horizontal,
      top: position.y - nodeBuffer.vertical,
      bottom: position.y + nodeSize.height + nodeBuffer.vertical
    }

    const pos2 = {
      left: node.position.x,
      right: node.position.x + nodeSize.width,
      top: node.position.y,
      bottom: node.position.y + nodeSize.height
    }

    // Check for overlap
    return !(
      pos1.right < pos2.left ||
      pos1.left > pos2.right ||
      pos1.bottom < pos2.top ||
      pos1.top > pos2.bottom
    )
  }

  /**
   * Calculate collision severity based on overlap amount and node count
   */
  private calculateCollisionSeverity(
    position: { x: number; y: number },
    collidingNodes: WorkflowNode[]
  ): CollisionResult['severity'] {
    if (collidingNodes.length === 0) return 'none'
    if (collidingNodes.length === 1) return 'minor'
    if (collidingNodes.length === 2) return 'major'
    return 'critical'
  }

  /**
   * Get recommended action based on collision severity
   */
  private getRecommendedAction(severity: CollisionResult['severity']): CollisionResult['recommendedAction'] {
    switch (severity) {
      case 'none': return undefined
      case 'minor': return 'adjust'
      case 'major': return 'reposition'
      case 'critical': return 'warn'
    }
  }
}

/**
 * Smart positioning strategy interface
 */
export interface PositioningStrategy {
  name: string
  calculatePosition(
    preferredPosition: { x: number; y: number },
    nodes: WorkflowNode[],
    detector: SmartCollisionDetector,
    config: CollisionDetectionConfig
  ): SmartPositionResult | null
}

/**
 * Grid-aligned positioning strategy
 * Maintains clean grid alignment while avoiding collisions
 */
export class GridAlignedStrategy implements PositioningStrategy {
  name = 'grid-aligned'

  calculatePosition(
    preferredPosition: { x: number; y: number },
    nodes: WorkflowNode[],
    detector: SmartCollisionDetector,
    config: CollisionDetectionConfig
  ): SmartPositionResult | null {
    const { spacing } = POSITIONING_CONFIG
    const gridSize = config.gridCellSize

    // Snap to grid
    const gridX = Math.round(preferredPosition.x / gridSize) * gridSize
    const gridY = Math.round(preferredPosition.y / gridSize) * gridSize

    // Test positions in expanding grid pattern
    const maxRadius = Math.floor(config.positioning.maxSearchRadius / gridSize)

    for (let radius = 0; radius <= maxRadius; radius++) {
      const positions = this.getGridPositionsAtRadius(gridX, gridY, radius, gridSize)

      for (const position of positions) {
        const collisionResult = detector.detectCollisionAtPosition(position)

        if (!collisionResult.hasCollision) {
          const distance = Math.sqrt(
            Math.pow(position.x - preferredPosition.x, 2) +
            Math.pow(position.y - preferredPosition.y, 2)
          )

          return {
            x: position.x,
            y: position.y,
            hasCollision: false,
            adjustedFromOriginal: distance > 10,
            collisionResult,
            score: Math.max(0, 100 - distance / 5), // Score based on distance from preferred
            alternatives: []
          }
        }
      }
    }

    return null // No valid position found
  }

  private getGridPositionsAtRadius(
    centerX: number,
    centerY: number,
    radius: number,
    gridSize: number
  ): { x: number; y: number }[] {
    if (radius === 0) {
      return [{ x: centerX, y: centerY }]
    }

    const positions: { x: number; y: number }[] = []

    // Generate positions in a square pattern around center
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        // Only include positions on the edge of the square
        if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
          positions.push({
            x: centerX + dx * gridSize,
            y: centerY + dy * gridSize
          })
        }
      }
    }

    return positions
  }
}

/**
 * Flow-direction positioning strategy
 * Respects the natural flow direction of the workflow
 */
export class FlowDirectionStrategy implements PositioningStrategy {
  name = 'flow-direction'

  calculatePosition(
    preferredPosition: { x: number; y: number },
    nodes: WorkflowNode[],
    detector: SmartCollisionDetector,
    config: CollisionDetectionConfig
  ): SmartPositionResult | null {
    const { spacing } = POSITIONING_CONFIG

    // Define flow-preferred directions (vertical priority)
    const directions = [
      { x: 0, y: spacing.vertical },    // Down (primary flow direction)
      { x: 0, y: -spacing.vertical },   // Up
      { x: spacing.horizontal, y: 0 },  // Right
      { x: -spacing.horizontal, y: 0 }, // Left
      { x: spacing.horizontal, y: spacing.vertical },   // Down-right
      { x: -spacing.horizontal, y: spacing.vertical },  // Down-left
      { x: spacing.horizontal, y: -spacing.vertical },  // Up-right
      { x: -spacing.horizontal, y: -spacing.vertical }, // Up-left
    ]

    const maxAttempts = Math.floor(config.positioning.maxAttempts / directions.length)

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      for (const direction of directions) {
        const position = {
          x: preferredPosition.x + (direction.x * attempt),
          y: preferredPosition.y + (direction.y * attempt)
        }

        const collisionResult = detector.detectCollisionAtPosition(position)

        if (!collisionResult.hasCollision) {
          const distance = Math.sqrt(
            Math.pow(position.x - preferredPosition.x, 2) +
            Math.pow(position.y - preferredPosition.y, 2)
          )

          // Score based on flow direction preference and distance
          let score = Math.max(0, 100 - distance / 10)
          
          // Bonus for vertical flow (natural workflow direction)
          if (direction.x === 0 && direction.y > 0) {
            score += 20
          }

          return {
            x: position.x,
            y: position.y,
            hasCollision: false,
            adjustedFromOriginal: distance > 10,
            collisionResult,
            score,
            alternatives: []
          }
        }
      }
    }

    return null
  }
}

/**
 * Smart positioning engine that combines multiple strategies
 */
export class SmartPositioningEngine {
  private strategies: PositioningStrategy[]
  private detector: SmartCollisionDetector
  private config: CollisionDetectionConfig

  constructor(config: CollisionDetectionConfig = DEFAULT_COLLISION_CONFIG) {
    this.config = config
    this.detector = new SmartCollisionDetector(config)
    this.strategies = [
      new GridAlignedStrategy(),
      new FlowDirectionStrategy(),
    ]
  }

  /**
   * Update nodes for collision detection
   */
  updateNodes(nodes: WorkflowNode[]): void {
    this.detector.updateNodes(nodes)
  }

  /**
   * Find the best position using multiple strategies
   */
  findBestPosition(
    preferredPosition: { x: number; y: number },
    nodes: WorkflowNode[],
    excludeNodes: string[] = []
  ): SmartPositionResult {
    // Update detector with current nodes
    this.detector.updateNodes(nodes.filter(n => !excludeNodes.includes(n.id)))

    // First, check if preferred position is already valid
    const preferredCollision = this.detector.detectCollisionAtPosition(preferredPosition, excludeNodes)
    
    if (!preferredCollision.hasCollision) {
      return {
        x: preferredPosition.x,
        y: preferredPosition.y,
        hasCollision: false,
        adjustedFromOriginal: false,
        collisionResult: preferredCollision,
        score: 100,
        alternatives: []
      }
    }

    // Try each strategy to find the best position
    const results: SmartPositionResult[] = []

    for (const strategy of this.strategies) {
      const result = strategy.calculatePosition(
        preferredPosition,
        nodes,
        this.detector,
        this.config
      )

      if (result) {
        results.push(result)
      }
    }

    if (results.length === 0) {
      // Fallback to original position with collision warning
      return {
        x: preferredPosition.x,
        y: preferredPosition.y,
        hasCollision: true,
        adjustedFromOriginal: false,
        collisionResult: preferredCollision,
        score: 0,
        alternatives: []
      }
    }

    // Sort by score and return the best result
    results.sort((a, b) => b.score - a.score)
    const best = results[0]

    // Add alternatives (top 3 results)
    best.alternatives = results.slice(1, 4)

    return best
  }

  /**
   * Get real-time collision feedback for UI
   */
  getCollisionFeedback(
    position: { x: number; y: number },
    excludeNodes: string[] = []
  ): CollisionResult {
    return this.detector.detectCollisionAtPosition(position, excludeNodes)
  }
}

// Export default instance
export const smartPositioning = new SmartPositioningEngine()